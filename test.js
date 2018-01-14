const ggf     = require('./main.js')
const Promise = require('bluebird')

Promise.all([
	ggf.byObject({
		'Joti One': [],
		'Roboto': [100,300,400,'900i']
	},
	['cyrillic-ext','latin-ext'],	{
		output: './test_result/fontsByObject',
		verbose: true
	}),
	ggf.byQuery('family=Macondo|Oswald:400,600,700|Roboto+Condensed:400,700i&subset=greek,greek-ext', {
		output: './test_result/fontsByQuery',
		verbose: true
	}),
	ggf.byUrl('https://fonts.googleapis.com/css?family=Macondo|Oswald:400,600,700|Roboto+Condensed:400,700i&subset=greek,greek-ext', {
		output: './test_result/fontsByUrl',
		verbose: true
	})
])