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
import cfonts from 'cfonts';
import Helper from './config.js';
import server from './server.js';
var lo = p({
	level: 'silent'
})
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
var b = async (u, c) => {
	try {
		var m = u.messages[0]
		log(m)
		if (!m) return
		if (m.key.remoteJid === 'status@broadcast') {
			if (!config.autoread) return
			setTimeout(() => {
				c.readMessages([m.key])
				var g = getContentType(m.message)
				log((/protocolMessage/i.test(g)) ? `${m.key.participant.split('@')[0]} Has deleted the story` : 'View user stories : ' + m.key.participant.split('@')[0]);
				if (/(imageMessage|videoMessage|extendedTextMessage)/i.test(g)) {
					var t = (g == 'extendedTextMessage') ? `Story Text Contains : ${m.message.extendedTextMessage.text}` : (g == 'imageMessage') ? `Image Story ${m.message.imageMessage.caption ? 'with Caption : ' + m.message.imageMessage.caption : 'without Caption'}` : (g == 'videoMessage') ? `Story Video ${m.message.videoMessage.caption ? 'with Caption : ' + m.message.videoMessage.caption : 'without Caption'}` : 'Unknow story '
					log('Reading ' + t + ' from @' + m.key.participant.split('@')[0] + ' ( ' + `${m.pushName ? m.pushName : c.getName(m.key.participants)}` + ' )')
				}
			}, config.faston);
		}
	} catch (e) {
		log(e);
	}
}
var run = async () => {
Object.assign(global, Helper);
	try {
		var store = makeInMemoryStore({
			logger: lo
		})
		var {
			state,
			saveCreds
		} = await useMultiFileAuthState('DB');
		global.cl = Y({
			browser: [config.name, 'safari', '1.0.0'],
			printQRInTerminal: true,
			logger: lo,
			auth: state
		});
		helper(cl);
		store.bind(cl.ev);
		cl.ev.on('connection.update', async (up) => a(up, cl, run));
		cl.ev.on('messages.upsert', async (up) => b(up, cl));
		cl.ev.on('creds.update', saveCreds);
		server(cl, store);
	} catch (e) {
		log(e);
	}
};

run();