import {
	fileURLToPath,
	pathToFileURL
} from 'url'
import {
	promises as fs
} from 'fs'
import os, {
	tmpdir,
	platform
} from 'os'
import path, {
	join
} from 'path'

var TIME = 1000 * 60 * 3
var __filename = function filename(pathURL =
	import.meta, rmPrefix = os.platform() !== 'win32') {
	var path = /** @type {ImportMeta} */ (pathURL).url || /** @type {String} */ (pathURL)
	return rmPrefix ?
		/file:\/\/\//.test(path) ?
		fileURLToPath(path) :
		path : /file:\/\/\//.test(path) ?
		path : pathToFileURL(path).href
}

/** @param {ImportMeta | string} pathURL */
var __dirname = function dirname(pathURL) {
	return path.dirname(__filename(pathURL, true))
}
__dirname = __dirname(
	import.meta)

export default async function clearTmp() {
	var tmp = [tmpdir(), join(__dirname, './tmp')]
	var filename = []

	await Promise.allSettled(tmp.map(async (dir) => {
		var files = await fs.readdir(dir)
		for (var file of files) filename.push(join(dir, file))
	}))

	return await Promise.allSettled(filename.map(async (file) => {
		var stat = await fs.stat(file)
		if (stat.isFile() && (Date.now() - stat.mtimeMs >= TIME)) {
			// https://stackoverflow.com/questions/28588707/node-js-check-if-a-file-is-open-before-copy
			if (platform() === 'win32') {
				// https://github.com/nodejs/node/issues/20548
				// https://nodejs.org/api/fs.html#filehandleclose
				var fileHandle
				try {
					fileHandle = await fs.open(file, 'r+')
				} catch (e) {
					console.error('[clearTmp]', e, 'Skipping', file)
					return e
				} finally {
					await fileHandle?.close()
				}
			}
			await fs.unlink(file)
		}
	}))
}