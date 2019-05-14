#!/usr/bin/env node

const cli = require('cli')
const GGF = require('./main.js')

let ggf = new GGF

// Default Config
let dc = ggf.getConfig()

cli.enable('help')

let res = cli.parse({
	input:            ['i', 'Input URL of CSS with fonts', 'url'],
	output:           ['o', 'Output directory', 'string', dc.outputDir],
	path:             ['p', 'Path placed before every source of font in CSS', 'string', dc.path],
	css:              ['c', 'Name of CSS file', 'string', dc.cssFile],
	template:         ['t', 'Template of font filename', 'string',  dc.template],
	useragent:        ['u', 'User-agent used at every connection', 'string', false],
	quiet:            ['q', 'Don\'t displays a lot of useful information'],
	base64:           ['b', 'Save fonts inside CSS file as base64 URIs'],
	'non-strict-ssl': [false, [
		'Force to accepts only valid SSL certificates; in some cases,',
		'such proxy or self-signed certificates should be turned off',
	].join('')],
	overwriting:      ['w', 'Allows overwrite existing files'],
	'print-options':  [false, 'Shows result options object without performing any action'],
	simulate:         ['s', 'Simulation; No file will be saved']
})

const options = {
	outputDir: res.output,
     	 path: res.path,
	  cssFile: res.css,
	userAgent: res.useragent || dc.userAgent,
	  verbose: !Boolean(res.quiet),
  overwriting: Boolean(res.overwriting),
    strictSSL: !Boolean(res['non-strict-ssl']),
       base64: Boolean(res.base64),
     simulate: Boolean(res.simulate),
	 template: res.template
};

if (Boolean(res['print-options'])) {
	console.log(options);
	return;
}

ggf.download(
	res.input,
	{
		outputDir: res.output,
	     	 path: res.path,
		  cssFile: res.css,
		userAgent: res.useragent || dc.userAgent,
		  verbose: !Boolean(res.quiet),
	  overwriting: Boolean(res.overwriting),
	    strictSSL: !Boolean(res['non-strict-ssl']),
	       base64: Boolean(res.base64),
	     simulate: Boolean(res.simulate),
		 template: res.template
	}
).catch(e => {
	console.error(e)
})
