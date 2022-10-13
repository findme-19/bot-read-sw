import express from 'express';
import fs from 'fs';
import path from 'path';
import isUrl from 'is-url';
var router = express.Router()
function rout(conn, store) {
	var mediaDownloader = async (uri) => {
		var down = await axios.get(uri, {
			responseType: 'arraybuffer'
		})
		return down.data
	}

	router.post('/sendmessage/:number', async (req, res) => {
		var text = req.body.text || req.query.text
		var number = req.params.number + '@s.whatsapp.net'
		if (number.startsWith('+')) return res.send({
			status: false,
			msg: 'error'
		})
		if (number.startsWith('0')) return res.send({
			status: false,
			msg: 'error'
		})
		if (!number == undefined) {
			res.send({
				status: false,
				msg: msg.nNumber
			})
		} else if (text == undefined) {
			res.send({
				status: false,
				msg: 'missing text!'
			})
		} else {
			try {
				conn.sendMessage(number, {
					text
				})
				res.send({
					status: true,
					msg: 'Pesan Terkirim'
				})
			} catch (e) {
				res.send({
					status: false,
					msg: msg.nUrl
				})
				console.log(e)
			}
		}
	})

	router.get('/sendmessage/:number', async (req, res) => {
		var text = req.body.text || req.query.text
		var number = req.params.number + '@s.whatsapp.net'
		if (number.startsWith('+')) return res.send({
			status: false,
			msg: 'error'
		})
		if (number.startsWith('0')) return res.send({
			status: false,
			msg: 'error'
		})
		if (!number == undefined) {
			res.send({
				status: false,
				msg: msg.nNumber
			})
		} else if (text == undefined) {
			res.send({
				status: false,
				msg: 'missing text!'
			})
		} else {
			try {
				conn.sendMessage(number, {
					text
				})
				res.send({
					status: true,
					msg: 'Pesan Terkirim'
				})
			} catch (e) {
				res.send({
					status: false,
					msg: msg.nUrl
				})
				console.log(e)
			}
		}
	})

	router.post('/sendmedia/:number', async (req, res) => {
		var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

		var text = req.body.text || req.query.text || ''
		var media = req.body.media
		var number = req.params.number + '@s.whatsapp.net'
		if (number.startsWith('+')) return res.send({
			status: false,
			msg: 'error'
		})
		if (number.startsWith('0')) return res.send({
			status: false,
			msg: 'error'
		})
		if (!number == undefined) {
			res.send({
				status: false,
				msg: msg.nNumber
			})
		} else {
			try {
				// if (isUrl(media)) return
				var aku = await conn.sendFile(number, media, "", text, null)
				console.log(aku)
				res.send({
					status: true,
					msg: 'succes'
				})
			} catch (e) {
				res.send({
					status: false,
					msg: 'media/url error'
				})
			}
		}
	})

	return router
}

export default rout