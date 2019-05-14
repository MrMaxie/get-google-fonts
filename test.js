#!/usr/bin/env node
const Q = require('q')
const ggf = require('./main.js')
const DEFAULT_GGF = new ggf({
	verbose: true,
	simulate: false,
	overwriting: false,
})

// For testing purposes
process.on('uncaughtException', (err) => {
	console.log(err);
});

process.on('unhandledRejection', (err) => {
	console.log(err);
});

let tests = [
	// String @import
	'https://fonts.googleapis.com/css?family=Roboto:400,700&subset=cyrillic',
	// String <link> (with special characters)
	'https://fonts.googleapis.com/css?family=Lobster&amp;subset=vietnamese',
	// Constructed
	ggf.constructUrl({
		Rajdhani: [700]
	}, [
		'devanagari'
	]),
	// Pass array for construct
	[{
		'Alegreya Sans SC': ['700', '700i'],
		'Alegreya+Sans+SC': ['400', '400i']
	}, [
		'greek'
	]],
	// Non-google's
	'http://weloveiconfonts.com/api/?family=entypo',
	// For Base64 comparison
	'https://fonts.googleapis.com/css?family=Lobster&amp;subset=vietnamese',
]

let res = Q()
tests.forEach((x, i) => {
	res = res.then(DEFAULT_GGF.download.bind(DEFAULT_GGF, x, {
		outputDir: `./fonts/test${i+1}/`,
		base64: i === 5
	}))
})
res.then(() => {
	require('child_process').spawn('start',['.\\test.html'], {
		shell: true
	})
})
