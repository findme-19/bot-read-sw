var {
	default: Y,
	useMultiFileAuthState,
	DisconnectReason,
	makeInMemoryStore,
	getContentType,
	areJidsSameUser,
	jidDecode
} = (await import('@adiwajshing/baileys')).default;
import PhoneNumber from 'awesome-phonenumber';
import fs from 'fs';
import util from 'util';
import {
	fileTypeFromBuffer
} from 'file-type';
import {
	format
} from 'util';
import yargs from 'yargs';
import axios from 'axios';
global.fetch = (await import("node-fetch")).default;
global.axios = axios;
var config = {
	name: 'Yomaine', // Ubah Nama kamu [ ini nama yg dimunculin saat terkoneksi ke WA web ]
	owner: '6282331033919', // Ubah Nomor ke Nomor owner
	autoread: true, // Ubah Ini untuk read sw == true, untuk tidak maka == false
	faston: 1000, // Semakin dikit nilai nya, maka semakin cepat read SW
	urlpinger: 'https://boread.herokuapp.com' // ganti aja 
}
function nullish(args) {
	return !(args !== null && args !== undefined)
}
var opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
var log = function log() {
	var args = [].slice.call(arguments);
	console.log.apply(console, args);
}
var helper = function helper(conn, options = {}) {
	function getContact(jid) {
		var chats = {}
		// @ts-ignore
		jid = jid?.decodeJid?.()
		if (!(jid in chats)) return null
		return chats[jid]
	}
	var ea = Object.defineProperties(conn, {
		decodeJid: {
			value(jid) {
				if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null
				return jid?.decodeJid?.()
			},
			enumerable: true,
			writable: true,
		},
		getName: {
			/**
			 * Get name from jid
			 * @param {String} jid
			 * @param {Boolean} withoutContact
			 */
			value(jid = '', withoutContact = false) {
				withoutContact = conn.withoutContact || withoutContact
				var v
				v = jid === '0@s.whatsapp.net' ? {
						jid,
						vname: 'WhatsApp'
					} : areJidsSameUser(jid, conn.user?.id || '') ?
					conn.user :
					(getContact(jid) || {})
				return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
			},
			enumerable: true,
			writable: true,
		},
		getFile: {
			/**
			 * getBuffer hehe
			 * @param {fs.PathLike} PATH 
			 * @param {Boolean} saveToFile
			 */
			async value(PATH, saveToFile = false) {
				var res, filename
				var data = Buffer.isBuffer(PATH) ? PATH : PATH instanceof ArrayBuffer ? PATH.toBuffer() : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? (await (res = await fetch(PATH)).arrayBuffer()).toBuffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
				if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
				var type = await fileTypeFromBuffer(data) || {
					mime: 'application/octet-stream',
					ext: 'bin'
				}
				var name = res ? res.headers ? res.headers.get("content-disposition") ? res.headers.get('content-disposition').split("filename=")[1].replaceAll(/(\")/g, "") : new Date * 1 + '.' + type.ext : new Date * 1 + '.' + type.ext : new Date * 1 + '.' + type.ext
				log(name)
				if (data && saveToFile && !filename)(filename = path.join(__dirname, '../tmp/' + name), await fs.promises.writeFile(filename, data))
				res ? res : res = null
				return {
					res,
					filename,
					...type,
					data,
					deleteFile() {
						return filename && fs.promises.unlink(filename)
					}
				}
			},
			enumerable: true,
			writable: true,
		},
		sendFile: {
			/**
			 * Send Media/File with Automatic Type Specifier
			 * @param {String} jid
			 * @param {String|Buffer} path
			 * @param {String} filename
			 * @param {String} caption
			 * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
			 * @param {Boolean} ptt
			 * @param {Object} options
			 */
			async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
				var type = await conn.getFile(path, true)
				var {
					res,
					data: file,
					filename: pathFile
				} = type
				if (res && res.status !== 200 || file.length <= 65536) {
					try {
						throw {
							json: JSON.parse(file.toString())
						}
					} catch (e) {
						if (e.json) throw e.json
					}
				}
				var fileSize = fs.statSync(pathFile).size / 1024 / 1024
				if (fileSize >= 100) throw new Error('File size is too big!')
				var opt = {}
				if (quoted) opt.quoted = quoted
				if (!type) options.asDocument = true
				log({
					type: type
				})
				var rw
				if (type.res !== null) {
					rw = type.res.headers.get('content-type')
				} else {
					rw = type.mime
				}
				var mtype = '',
					mimetype = options.mimetype || rw,
					convert
				if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
				else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
				else if (/video/.test(type.mime)) mtype = 'video'
				else if (/audio/.test(type.mime))(
					convert = ptt ? await toAudio(file, type.ext) : false,
					convert ? file = convert.data : convert = false,
					convert ? pathFile = convert.filename : convert = false,
					mtype = 'audio',
					mimetype = ptt ? 'audio/ogg; codecs=opus' : mimetype
				)
				else mtype = 'document'
				if (options.asDocument) mtype = 'document'

				delete options.asSticker
				delete options.asLocation
				delete options.asVideo
				delete options.asDocument
				delete options.asImage

				var message = {
					...options,
					caption,
					ptt,
					[mtype]: {
						url: pathFile
					},
					mimetype,
					fileName: filename || pathFile.split('/').pop()
				}
				/**
				 * @type {import('@adiwajshing/baileys').proto.WebMessageInfo}
				 */
				var m
				try {
					m = await conn.sendMessage(jid, message, {
						...opt,
						...options
					})
				} catch (e) {
					console.error(e)
					m = null
				} finally {
					if (!m) m = await conn.sendMessage(jid, {
						...message,
						[mtype]: file
					}, {
						...opt,
						...options
					})
					file = null // releasing the memory
					return m
				}
			},
			enumerable: true,
			writable: true,
		},
		reply: {
			/**
			 * Reply to a message
			 * @param {String} jid
			 * @param {String|Buffer} text
			 * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
			 * @param {Object} options
			 */
			value(jid, text = '', quoted, options) {
				return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMessage(jid, {
					...options,
					text
				}, {
					quoted,
					...options
				})
			},
			writable: true,
		},
	})
	return ea
}
export default {
	config,
	opts,
	log,
	helper
}
