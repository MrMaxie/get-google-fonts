/**
 * @name    Get-Google-Fonts
 * @author  Maciej (Maxie) Mieńko
 * @license Apache-2.0
 */
const Promise = require('bluebird')
const URL     = require('url')
const request = require('request')
const Path    = require('path')
const fs      = require('fs')
const mkdirp  = require('mkdirp')
/**
 * Regular Expressions
 */
const reg = {
	fontFace:   /\s*(?:\/\*\s*(.*?)\s*\*\/)?[^@]*?@font-face\s*{(?:[^}]*?)}\s*/gi,
	fontFamily: /font-family\s*:\s*(?:\'|")?([^;]*?)(?:\'|")?\s*;/i,
	fontWeight: /font-weight\s*:\s*([^;]*?)\s*;/i,
	fontSource: /(src\s*:[^]*?url\s*\(\s*(?:\'|")?\s*)([^]*?)(\s*(?:\'|")?\s*\)[^;]*?;)/i,
	filename:   /^.*\/(.*?)\.(.*?)(?:$|\?.*?$)/gi,
}
/**
 * Default config used as base
 * @type {Object}
 */
const defaultConfig = {
	output:        './fonts',
	path:          './',
	template:      '%(family)s-%(weight)s-%(comment)s%(i)s.%(ext)s',
	css:           'fonts.css',
	agent:         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
	throwAtRepeats: true,
	verbose:        false

}
/**
 * Parse string by replacing in-string variables with their values from given object
 * @param  {String} str
 * @param  {Object} vars
 * @return {String}
 */
function parseString(str, vars) {
	let newvars = {}
	for(let key in vars)
		newvars[key.replace(/[^a-zA-Z0-9_-]/g, '')] = vars[key]
	for(let key in newvars)
		str = str.replace(new RegExp(`%\\(${key}\\)s`,'g'), newvars[key])
	return str
}
/**
 * Parse parameters and throw error if something went wrong
 * @param  {String} url
 * @param  {Object} config
 * @return {Array}
 */
function parseParameters(url, config) {
	if(typeof url !== 'string')
		throw new Error('URL must be given as string')
	url = URL.parse(url,true,true)
	if(['http:','https:'].indexOf(url.protocol) === -1)
		throw new Error('URL\'s protocol must be http or https')
	if(typeof config !== 'object')
		config = {}
	let newConfig = {}
	for(let key in config)
		if(key in defaultConfig)
			newConfig[key] = config[key]
	return [url, Object.assign({}, defaultConfig, newConfig)]
}
/**
 * Downlaod CSS file
 * @param  {URL}      url
 * @param  {Object}   config
 * @return {bluebird}
 */
function downloadCss(url, config) {
	return new Promise((resolve, reject) => {
		request({
			url: url,
			headers: {
				'User-Agent': config.agent
			}
		}, (error, response, body) => {
			if(error || response.statusCode !== 200)
				throw new Error(`Cannot to download CSS file (error: '${error}', status: ${response.statusCode})`)
			resolve([body, config])
		})
	})
}
/**
 * Returns list of all fonts and their replacements along with new prepared CSS
 * @param  {String} css
 * @param  {Object} config
 * @return {Array}
 */
function generateList(css, config) {
	if(config.verbose)
		console.log('Parsing...')
	let list = {}
	let newcss = css.replace(reg.fontFace, (face, comment) => {
		let murl = reg.fontSource.exec(face)
		let url = URL.parse(murl[2] || '', true, true)
		let _filename = '' // Memory of last generated filename for detecting dead end of creating name loop
		let  filename = ''
		let i = 0
		do {
			 filename = parseString(config.template,{
				comment: comment,
				family:  reg.fontFamily.exec(face)[1] || '',
				_family: (reg.fontFamily.exec(face)[1] || '').replace(/[^a-zA-Z0-9]/gi, '_'),
				weight:  reg.fontWeight.exec(face)[1] || '',
				ext:     Path.extname(url.pathname).replace(/^\.+|\.+$/g, ''),
				name:    Path.basename(url.pathname,Path.extname(url.pathname)),
				o:       i + 1,
				i:       i++ === 0 ? '' : i
			})
			// That's mean %(i)s isn't used in template 
			if(filename === _filename) {
				if(config.throwAtDuplicate)
					throw new Error(`Repeating filename found (${filename}). Turn off switch 'throwAtRepeats' and try again for enabling overwriting or use %(i)s in template to avoid repeats.`)
				break
			}
			_filename = filename
		} while(filename in list)
		list[filename] = url.href
		return face.replace(reg.fontSource, murl[1]+config.path+filename+murl[3])
	})
	if(!Object.keys(list).length)
		throw new Error('No @font-faces found')
	if(config.verbose)
		console.log(`Found ${Object.keys(list).length} fonts`)
	return [newcss, list, config]
}
/**
 * Download file from given url and save as given path
 * @param  {String}   url
 * @param  {String}   path
 * @return {bluebird}
 */
function downloadSingleFont(url, path, config) {
	if(config.verbose)
		console.log(`Download file ${Path.basename(path)}`)
	return new Promise((resolve, reject) => {
		mkdirp(Path.dirname(path), e => {
			if(e) throw new Error(e)
			request({
				url: url,
				headers: {
					'User-Agent': config.agent
				}
			})
			.on('error', e => {throw new Error(e)})
			.on('end', () => resolve())
			.pipe(fs.createWriteStream(path))
		})
	})
}
/**
 * Make chain of promises to download all of files given in list and save CSS file
 * @param  {String}   css
 * @param  {Object}   list
 * @param  {Object}   config
 * @return {bluebird}
 */
function downloadFonts(css, list, config) {
	let lastStep = Promise.try(() => {})
	for(let path in list)
		lastStep = lastStep.then(downloadSingleFont.bind(
			null, list[path], Path.join(config.output, path), config 
		))
	return lastStep.then(() => {
		return new Promise((resolve, reject) => {
			fs.writeFile(Path.join(config.output, config.css), css, e => {
				if(config.verbose)
					console.log(`Saving CSS file ${config.css}`)
				if(e) reject(e)
				resolve(config)
			})
		})
	})
}
/**
 * Core function, do all job
 * @param  {String}   url
 * @param  {Object}   config
 * @return {bluebird}
 */
function getByUrl(url, config) {
	if(config.verbose)
		console.log('Preparing...')
	let x = Promise
		.try(parseParameters.bind(this,url,config))
		.spread(downloadCss)
		.spread(generateList)
		.spread(downloadFonts)
	if(config.verbose) {
		x.catch(x => console.error(x))
		x.then(() => {
			console.log('Done!')
		})
	}
	return x
}

/**
 * Alias of 'getByUrl' using query
 * @param  {String}   query
 * @param  {Object}   config
 * @return {bluebird}
 */
function getByQuery(query, config) {
	return getByUrl(URL.parse(`https://fonts.googleapis.com/css?${query}`).href, config)
}

/**
 * Alias of 'getByUrl' using object
 * @param  {Object}   families
 * @param  {Array}    subsets
 * @param  {Object}   config
 * @return {bluebird}
 */
function getByObject(families, subsets, config) {
	let newFamilies = []
	for(let key in families) {
		key = key.trim().replace(/\s/g, '+')
		let val = families[key]
		if(val instanceof Array)
			val = val.join(',')
		if(typeof val === 'string' && String(val).length > 0) {
			newFamilies.push(`${key}:${val}`)
			continue
		}
		newFamilies.push(key)
	}
	families = newFamilies.join('|')
	subsets  = subsets.join(',')
	return getByQuery(
		(families.length > 0 ? `family=${families}` : '')+
		((families.length > 0 && subsets.length > 0) ? '&' : '')+
		(subsets.length > 0 ? `subset=${subsets}` : '')
	,config)
}

module.exports = {
	byUrl: getByUrl,
	byQuery: getByQuery,
	byObject: getByObject
}
