#!/usr/bin/env node

const cli = require('cli')
const GGF = require('./main.js')

let ggf = new GGF

// Default Config
let dc = ggf.getConfig()

cli.enable('help')

let res = cli.parse({
	input:       ['i', 'Input URL of CSS with fonts', 'url'],
	output:      ['o', 'Output directory', 'string', dc.outputDir],
	path:        ['p', 'Path placed before every source of font in CSS', 'string', dc.path],
	css:         ['c', 'Name of CSS file', 'string', dc.cssFile],
	template:    ['t', 'Template of font filename', 'string',  dc.template],
	useragent:   ['u', 'User-agent used at every connection', 'string', false],
	quiet:       ['q', 'Don\'t displays a lot of useful information', 'true', false],
	base64:      ['b', 'Save fonts inside CSS file as base64 URIs', 'true', false],
	overwriting: ['w', 'Allows overwrite existing files', 'true', false],
	simulate:    ['s', 'Simulation; No file will be saved', 'true', false]
})

ggf.download(
	res.input,
	{
		outputDir: res.output,
	     	 path: res.path,
		  cssFile: res.css,
		userAgent: res.useragent || dc.userAgent,
		  verbose: !res.quiet,
	overwriting: res.overwriting,
	     base64: res.base64,
	   simulate: res.simulate,
		 template: res.template
	}
).catch(e => {
	console.error(e)
})
