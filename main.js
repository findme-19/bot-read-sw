/**
 * Base Original   https://github.com/bolaxd/bot-read-sw
 * 
 * Recode By Me
 *
 **/

process.on('uncaughtException', console.error);
var {
	default: Y,
	useMultiFileAuthState,
	DisconnectReason,
	makeInMemoryStore,
	getContentType,
	areJidsSameUser,
	jidDecode
} = (await import('@adiwajshing/baileys')).default;
import {
	Boom
} from '@hapi/boom';
import p from 'pino';
import pretty from 'pino-pretty';
var stream = pretty({
	colorize: true
})
import cfonts from 'cfonts';
import Helper from './config.js';
import server from './server.js';
import clearTmp from './tmp.js';
import syntaxerror from 'syntax-error';
import cp from 'child_process';
import util, {
	promisify
} from 'util';
var lo = p({
	level: 'error'
}, stream)
Object.assign(global, Helper);
cfonts.say('AUTO READING STORY', { // Ubah saja cuii ;v
	font: 'tiny',
	align: 'center',
	colors: ['system'],
	background: 'transparent',
	letterSpacing: 1,
	lineHeight: 1,
	space: true,
	maxLength: '0',
	gradient: false,
	independentGradient: false,
	transitionGradient: false,
	env: 'node'
});
cfonts.say('Simple Bot Whatsapp', { // Ubah saja cuii ;v
	font: 'console',
	align: 'center',
	gradient: ['#FF39EF', 'yellow'],
	background: 'transparent',
	letterSpacing: 1,
	lineHeight: 1,
	space: true,
	maxLength: '0',
	independentGradient: false,
	transitionGradient: true,
	env: 'node'
});

var a = async (u, c, q) => {
	var {
		lastDisconnect,
		connection
	} = u
	try {
		if (connection == 'close') {
			if (new Boom(lastDisconnect.error).output?.statusCode === DisconnectReason.loggedOut) q()
			else q()
		} else if (connection == 'open') {
			log("succesfully connected");
		}
	} catch (e) {
		log(e);
	}
};
var b = async (u, conn) => {
	try {
		var m = u.messages[0]
		if (!m) return
		m = smsg(conn, m) || m
		if (!m) return
		if (m.key.remoteJid === 'status@broadcast') {
			if (!m.key.participant.startsWith('62')) return
			if (!config.autoread) return
			setTimeout(() => {
				var g = getContentType(m.message)
				log((/protocolMessage/i.test(g)) ? `${m.key.participant.split('@')[0]} Has deleted the story` : 'View user stories : ' + m.key.participant.split('@')[0]);
				if (/(imageMessage|videoMessage|extendedTextMessage)/i.test(g)) {
					conn.readMessages([m.key])
					var t = (g == 'extendedTextMessage') ? `Story Text Contains : ${m.text}` : (g == 'imageMessage') ? `Image Story ${m.text ? 'with Caption : ' + m.text : 'without Caption'}` : (g == 'videoMessage') ? `Story Video ${m.text ? 'with Caption : ' + m.text : 'without Caption'}` : 'Unknow story '
					log('Reading ' + t + ' from @' + m.key.participant.split('@')[0] + ' ( ' + `${m.pushName ? m.pushName : conn.getName(m.key.participants)}` + ' )')
				}
			}, config.faston);
		} else {
			var [cmd, ...args] = m.text.trim().split` `.filter(v => v)
			var _args = m.text.trim().split` `.slice(1),
				text = _args.join` `,
				numbot = conn.decodeJid(conn.user.id),
				Rowner = [conn.decodeJid(numbot), ...config.owner.map(([number]) => number)].map(v => v?.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender),
				owner = Rowner || m.fromMe
			args = args || []
			cmd = (cmd || '').toLowerCase()
			switch (cmd) {
				case '>':
				case '=>':
					if (!owner) return
					class CustomArray extends Array {
						constructor(...args) {
							if (typeof args[0] == 'number') return super(Math.min(args[0], 10000))
							else return super(...args)
						}
					}
					var _return
					var _syntax = ''
					var _text = (/^=/.test(cmd) ? 'return ' : '') + text
					try {
						var i = 15
						var f = {
							exports: {}
						}
						var exec = new(async () => {}).constructor('print', 'm', 'require', 'conn', 'Array', 'process', 'args', 'module', 'exports', 'argument', _text)
						_return = await exec.call(conn, (...args) => {
							if (--i < 1) return
							return conn.reply(m.chat, util.format(...args), m)
						}, m, require, conn, CustomArray, process, args, f, f.exports, [conn])
					} catch (e) {
						var err = await syntaxerror(_text, 'Execution Function', {
							allowReturnOutsideFunction: true,
							allowAwaitOutsideFunction: true
						})
						if (err) _syntax = '```' + err + '```\n\n'
						_return = e
					} finally {
						//conn.reply(m.sender, _syntax + util.format(_return), m)
						conn.reply(m.sender, _syntax + util.format(_return), m)
					}
					break;
				case '$':
					if (!owner) return
					var exec = promisify(cp.exec).bind(cp)
					var o
					try {
						o = await exec(cmd.trimStart() + ' ' + text.trimEnd())
					} catch (e) {
						o = e
					} finally {
						var {
							stdout,
							stderr
						} = o
						if (stdout.trim()) m.reply(stdout)
						if (stderr.trim()) m.reply(stderr)
					}
					break;
				case 'setpp':
				case 'setppbot':
					if (!owner) return
					var q = m.quoted ? m.quoted : m
					var mime = (q.msg || q).mimetype || q.mediaType || ''
					if (/webp|image/g.test(mime)) {
						var img = await q.download?.()
						log(img)
						if (!img) return m.reply(`balas gambar/stiker dengan perintah ${cmd}`)
						if (/webp/g.test(mime)) {
							var out = await webp2png(img)
							out = await getBuffer(out)
							await conn.updateProfilePictures(numbot, out)
							m.reply('success change the profile picture Bot')
						} else {
							await conn.updateProfilePictures(numbot, img)
							m.reply('success change the profile picture Bot')
						}
					}
					break;
					case 'setppgc':
					case 'setppgroup':
					if (!m.isGroup) return
					if (!owner) return
					var q = m.quoted ? m.quoted : m
					var mime = (q.msg || q).mimetype || q.mediaType || ''
					if (/webp|image/g.test(mime)) {
						var img = await q.download?.()
						log(img)
						if (!img) return m.reply(`balas gambar/stiker dengan perintah ${cmd}`)
						if (/webp/g.test(mime)) {
							var out = await webp2png(img)
							out = await getBuffer(out)
							await conn.updateProfilePictures(m.chat, out)
							m.reply('success change the profile picture Group')
						} else {
							await conn.updateProfilePictures(m.chat, img)
							m.reply('success change the profile picture Group')
						}
					}
					break;
			}
		}
	} catch (e) {
		log(e);
	}
}
var run = async () => {
	try {
		var store = makeInMemoryStore({
			logger: lo
		})
		var {
			state,
			saveCreds
		} = await useMultiFileAuthState('DB');
		global.conn = Y({
			browser: [config.name, 'safari', '1.0.0'],
			printQRInTerminal: true,
			logger: lo,
			auth: state
		});
		helper(conn);
		store.bind(conn.ev);
		conn.ev.on('connection.update', async (up) => a(up, conn, run));
		conn.ev.on('messages.upsert', async (up) => b(up, conn));
		conn.ev.on('creds.update', saveCreds);
		server(conn, store);
	} catch (e) {
		log(e);
	}
};
protoType();
run();
setInterval(async () => {
	var a = await clearTmp()
}, 180000);


async function webp2png(source) {
	var form = new require("form-data")()
	var isUrl = typeof source === 'string' && /https?:\/\//.test(source)
	form.append('new-image-url', isUrl ? source : '')
	form.append('new-image', isUrl ? '' : source, 'image.webp')
	var res = await axios.request("https://s6.ezgif.com/webp-to-png", {
		method: "POST",
		data: form.getBuffer(),
		headers: {
			...form.getHeaders()
		}
	})
	var {
		document
	} = new JSDOM(res.data).window
	var obj = {}
	var form2 = new require('form-data')()
	for (var input of document.querySelectorAll('form input[name]')) {
		obj[input.name] = input.value
		form2.append(input.name, input.value)
	}
	var res2 = await axios.request('https://ezgif.com/webp-to-png/' + obj.file, {
		method: "POST",
		data: form2.getBuffer(),
		headers: {
			...form2.getHeaders()
		}
	})
	akhir = require("cheerio").load(res2.data)
	return "https:" + akhir("p.outfile > img").attr("src")
}

async function getBuffer(url, options) {
	try {
		options ? options : {}
		var res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'User-Agent': 'GoogleBot',
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (e) {
		console.log(`Error : ${e}`)
	}
}
