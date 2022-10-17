import path from 'path';
import {
	fileURLToPath
} from 'url';
var {
	default: Y,
	useMultiFileAuthState,
	DisconnectReason,
	makeInMemoryStore,
	getContentType,
	areJidsSameUser,
	jidDecode,
	proto,
	downloadContentFromMessage,
	generateForwardMessageContent,
	generateWAMessageFromContent,
	extractMessageContent
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
import Jimp from 'jimp';
import {
	createRequire
} from 'module'
var __dirname = path.dirname(fileURLToPath(
	import.meta.url));
const require = createRequire(__dirname)
global.fetch = (await import("node-fetch")).default;
global.axios = axios;
var config = {
	name: 'Yomaine', // Ubah Nama kamu [ ini nama yg dimunculin saat terkoneksi ke WA web ]
	owner: [
		//  ['6281234288573'],
		//['12546153210'],
		//['62895368900456'],
		['6282331033919', 'need me?', true]
		// [number, dia creator/owner?, dia developer?]
	], // Ubah Nomor ke Nomor owner
	autoread: true, // Ubah Ini untuk read sw == true, untuk tidak maka == false
	faston: 1000, // Semakin dikit nilai nya, maka semakin cepat read SW
	urlpinger: 'https://boread.herokuapp.com/'
}
var prefix = new RegExp('^[' + ('‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

function isNumber() {
	var int = parseInt(this)
	return typeof int === 'number' && !isNaN(int)
}
var __require = function require(dir =
	import.meta.url) {
	return createRequire(dir)
}

function getRandom() {
	if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)]
	return Math.floor(Math.random() * this)
}

function nullish(args) {
	return !(args !== null && args !== undefined)
}
var opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
var log = function log() {
	var args = [].slice.call(arguments);
	console.log.apply(console, args);
}
var smsg = function smsg(conn, m, hasParent) {
	if (!m) return m
	/**
	 * @type {import('@adiwajshing/baileys').proto.WebMessageInfo}
	 */
	var M = proto.WebMessageInfo
	m = M.fromObject(m)
	Object.defineProperty(m, 'conn', {
		enumerable: false,
		writable: true,
		value: conn
	})
	var MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']
	Object.defineProperties(m, {
		conn: {
			value: global.conn,
			enumerable: false,
			writable: true
		},
		id: {
			get() {
				return m.key?.id
			}
		},
		chat: {
			get() {
				var senderKeyDistributionMessage = m.message?.senderKeyDistributionMessage?.groupId
				return (
					m.key?.remoteJid ||
					(senderKeyDistributionMessage &&
						senderKeyDistributionMessage !== 'status@broadcast'
					) || ''
				).decodeJid()
			}
		},
		isGroup: {
			get() {
				return m.chat.endsWith('@g.us')
			},
			enumerable: true
		},
		sender: {
			get() {
				return m.conn?.decodeJid(m.key?.fromMe && m.conn?.user.id || m.participant || m.key.participant || m.chat || '')
			},
			enumerable: true
		},
		fromMe: {
			get() {
				return m.key?.fromMe || areJidsSameUser(m.conn?.user.id, m.sender) || false
			}
		},
		mtype: {
			get() {
				if (!m.message) return ''
				return getContentType(m.message)
			},
			enumerable: true
		},
		msg: {
			get() {
				if (!m.message) return null
				return m.message[m.mtype]
			},
			enumerable: true,
			writeable: true
		},
		mediaMessage: {
			get() {
				if (!m.message) return null
				var Message = ((m.msg?.url || m.msg?.directPath) ? {
					...m.message
				} : extractMessageContent(m.message)) || null
				if (!Message) return null
				var mtype = Object.keys(Message)[0]
				return MediaType.includes(mtype) ? Message : null
			},
			enumerable: true
		},
		mediaType: {
			get() {
				var message
				if (!(message = m.mediaMessage)) return null
				return Object.keys(message)[0]
			},
			enumerable: true,
		},
		_text: {
			value: null,
			writable: true,
		},
		text: {
			get() {
				var msg = m.msg
				var text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || ''
				return typeof m._text === 'string' ? m._text : '' || (typeof text === 'string' ? text : (
					text?.selectedDisplayText ||
					text?.hydratedTemplate?.hydratedContentText ||
					text
				)) || ''
			},
			set(str) {
				return m._text = str
			},
			enumerable: true
		},
		mentionedJid: {
			get() {
				return m.msg?.contextInfo?.mentionedJid?.length && m.msg.contextInfo.mentionedJid || []
			},
			enumerable: true
		},
		name: {
			get() {
				return !nullish(m.pushName) && m.pushName || m.conn?.getName(m.sender)
			},
			enumerable: true
		},
		download: {
			value(saveToFile = false) {
				var mtype = m.mediaType
				return m.conn?.downloadM(m.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
			},
			enumerable: true,
			configurable: true
		},
		reply: {
			value(text, chatId, options) {
				return m.conn?.reply(chatId ? chatId : m.chat, text, this, options)
			}
		},
		quoted: {
			get() {
				/** @type {ReturnType<typeof makeWASocket>} */
				var self = m
				var msg = self.msg
				var contextInfo = msg?.contextInfo
				var quoted = contextInfo?.quotedMessage
				if (!msg || !contextInfo || !quoted) return null
				var type = getContentType(quoted)
				var q = quoted[type]
				var text = typeof q === 'string' ? q : q.text
				return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? {
					text: q
				} : q)), {
					mtype: {
						get() {
							return type
						},
						enumerable: true
					},
					mediaMessage: {
						get() {
							var Message = ((q.url || q.directPath) ? {
								...quoted
							} : extractMessageContent(quoted)) || null
							if (!Message) return null
							var mtype = Object.keys(Message)[0]
							return MediaType.includes(mtype) ? Message : null
						},
						enumerable: true
					},
					mediaType: {
						get() {
							var message
							if (!(message = m.quoted.mediaMessage)) return null
							return Object.keys(message)[0]
						},
						enumerable: true,
					},
					id: {
						get() {
							return contextInfo.stanzaId
						},
						enumerable: true
					},
					chat: {
						get() {
							return contextInfo.remoteJid || self.chat
						},
						enumerable: true
					},
					sender: {
						get() {
							return (contextInfo.participant || m.chat || '').decodeJid()
						},
						enumerable: true
					},
					fromMe: {
						get() {
							return areJidsSameUser(m.quoted.sender, self.conn?.user.jid)
						},
						enumerable: true,
					},
					text: {
						get() {
							return text || m.caption || m.contentText || m.selectedDisplayText || ''
						},
						enumerable: true
					},
					mentionedJid: {
						get() {
							return q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || []
						},
						enumerable: true
					},
					name: {
						get() {
							var sender = m.quoted.sender
							return sender ? self.conn?.getName(sender) : null
						},
						enumerable: true

					},
					vM: {
						get() {
							return proto.WebMessageInfo.fromObject({
								key: {
									fromMe: m.fromMe,
									remoteJid: m.chat,
									id: m.id
								},
								message: quoted,
								...(self.isGroup ? {
									participant: m.sender
								} : {})
							})
						}
					},
					fakeObj: {
						get() {
							return m.vM
						}
					},
					download: {
						value(saveToFile = false) {
							var mtype = m.quoted.mediaType
							log(mtype)
							return self.conn?.downloadM(m.quoted.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
						},
						enumerable: true,
						configurable: true,
					},
					reply: {
						/**
						 * Reply to quoted message
						 * @param {String|Object} text
						 * @param {String|false} chatId
						 * @param {Object} options
						 */
						value(text, chatId, options) {
							return self.conn?.reply(chatId ? chatId : m.chat, text, m.vM, options)
						},
						enumerable: true,
					},
				})
			},
			enumerable: true
		},
	})
	var protocolMessageKey
	if (m.message) {
		if (m.mtype == 'protocolMessage' && m.msg.key) {
			protocolMessageKey = m.msg.key
			if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat
			if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender
			protocolMessageKey.fromMe = areJidsSameUser(protocolMessageKey.participant, conn.user.id)
			if (!protocolMessageKey.fromMe && areJidsSameUser(protocolMessageKey.remoteJid, conn.user.id)) protocolMessageKey.remoteJid = m.sender
		}
		if (m.quoted)
			if (!m.quoted.mediaMessage) delete m.quoted.download
	}
	if (!m.mediaMessage) delete m.download

	try {
		if (protocolMessageKey && m.mtype == 'protocolMessage') conn.ev.emit('messages.delete', {
			keys: [protocolMessageKey]
		})
	} catch (e) {
		console.error(e)
	}
	return m
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
			}
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
				if (data && saveToFile && !filename)(filename = path.join(__dirname, './tmp/' + name), await fs.promises.writeFile(filename, data))
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
		downloadM: {
			/**
			 * Download media message
			 * @param {Object} m
			 * @param {String} type
			 * @param {fs.PathLike | fs.promises.FileHandle} saveToFile
			 * @returns {Promise<fs.PathLike | fs.promises.FileHandle | Buffer>}
			 */
			async value(m, type, saveToFile) {
				var filename
				if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
				var stream = await downloadContentFromMessage(m, type)
				var buffer = Buffer.from([])
				for await (var chunk of stream) {
					buffer = Buffer.concat([buffer, chunk])
				}
				if (saveToFile)({
					filename
				} = await conn.getFile(buffer, true))
				return saveToFile && fs.existsSync(filename) ? filename : buffer
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
		generateProfilePicture: {
			async value(buffer) {
				var jimp_1 = await Jimp.read(buffer);
				var resz = jimp_1.getWidth() > jimp_1.getHeight() ? jimp_1.resize(550, Jimp.AUTO) : jimp_1.resize(Jimp.AUTO, 650)
				var jimp_2 = await Jimp.read(await resz.getBufferAsync(Jimp.MIME_JPEG));
				return {
					img: await resz.getBufferAsync(Jimp.MIME_JPEG)
				}
			},
			writable: true,
			enumerable: true
		},
		updateProfilePictures: {
			async value(jid, buffer) {
				var {
					img,
				} = await conn.generateProfilePicture(buffer)
				await conn.query({
					tag: 'iq',
					attrs: {
						to: jid,
						type: 'set',
						xmlns: 'w:profile:picture'
					},
					content: [{
						tag: 'picture',
						attrs: {
							type: 'image'
						},
						content: img
					}]
				})
			},
			writable: true,
			enumerable: true
		},
	})
	return ea
}
var protoType = function protoType() {
	Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
		var ab = new ArrayBuffer(this.length);
		var view = new Uint8Array(ab);
		for (var i = 0; i < this.length; ++i) {
			view[i] = this[i];
		}
		return ab;
	}
	/**
	 * @returns {ArrayBuffer}
	 */
	Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
		return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength)
	}
	/**
	 * @returns {Buffer}
	 */
	ArrayBuffer.prototype.toBuffer = function toBuffer() {
		return Buffer.from(new Uint8Array(this))
	}
	// /**
	//  * @returns {String}
	//  */
	// Buffer.prototype.toUtilFormat = ArrayBuffer.prototype.toUtilFormat = Object.prototype.toUtilFormat = Array.prototype.toUtilFormat = function toUtilFormat() {
	//     return util.format(this)
	// }
	Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function getFileType() {
		return await fileTypeFromBuffer(this)
	}
	/**
	 * @returns {Boolean}
	 */
	String.prototype.isNumber = Number.prototype.isNumber = isNumber
	/**
	 * 
	 * @returns {String}
	 */
	String.prototype.capitalize = function capitalize() {
		return this.charAt(0).toUpperCase() + this.slice(1, this.length)
	}
	/**
	 * @returns {String}
	 */
	String.prototype.capitalizeV2 = function capitalizeV2() {
		var str = this.split(' ')
		return str.map(v => v.capitalize()).join(' ')
	}
	String.prototype.decodeJid = function decodeJid() {
		if (/:\d+@/gi.test(this)) {
			var decode = jidDecode(this) || {}
			return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim()
		} else return this.trim()
	}
	/**
	 * number must be milliseconds
	 * @returns {string}
	 */
	Number.prototype.toTimeString = function toTimeString() {
		// var milliseconds = this % 1000
		var seconds = Math.floor((this / 1000) % 60)
		var minutes = Math.floor((this / (60 * 1000)) % 60)
		var hours = Math.floor((this / (60 * 60 * 1000)) % 24)
		var days = Math.floor((this / (24 * 60 * 60 * 1000)))
		return (
			(days ? `${days} day(s) ` : '') +
			(hours ? `${hours} hour(s) ` : '') +
			(minutes ? `${minutes} minute(s) ` : '') +
			(seconds ? `${seconds} second(s)` : '')
		).trim()
	}
	Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom
}
export default {
	config,
	opts,
	log,
	helper,
	smsg,
	protoType,
	require,
	__require
}