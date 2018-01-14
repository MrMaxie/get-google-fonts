/**
 * Testing unit
 */
const ggf     = require('./main.js')
const Promise = require('bluebird')
const fs      = require('fs')
let passedTests = 0
/**
 * Remove nested directories; Used after tests
 * @param {String} path
 */
function rmDir(path) {
	if(fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index){
			let curPath = path + '/' + file;
			if(fs.lstatSync(curPath).isDirectory())
				rmDir(curPath);
			else
				fs.unlinkSync(curPath)
		})
		fs.rmdirSync(path)
	}
}
/**
 * Log array of strings, one by one
 * @param {Array} array
 */
function log(array) {
	console.log('======')
	for(let x of array)
		console.log(x)
	console.log('======')
}
/**
 * Test if result files count looks fine
 * @param  {Object} list
 * @param  {Object} config
 * @param  {Int}    count
 */
function test(list, config, count) {
	let items = Object.keys(list).length
	return (new Promise((resolve, reject) => {
		fs.readdir(config.output, (err, files) => {
			if(err)
				reject(err)
			resolve([files.length])
		})
	})).spread(files => {
		let ok = (files === count + 1 && items === count)
		if(ok) passedTests++
		log([
			`Listed ${items} items of ${count} expected`,
			`Downloaded ${files} files of ${count+1} expected`,
			`Test ${ok?'Passed!':'Failed!'}`
		])
		rmDir(config.output)
	})
}
/**
 * Tests factories array
 */
let config = {
	output: './test_result',
	verbose: true
}
let tests = [
	// Tests ignoring invalid font name / font type
	() => ggf.byObject({
			'not-existing-test~~~!': ['>??'],
			'Roboto': [100,300,400,'900i']
		},
		['cyrillic-ext','latin-ext'],
		config).spread((list, config) => {
			return test(list, config, 28)
		}),
	// Tests rejecting all invalid
	() => ggf.byObject({
		'not-existing-test~~~!': ['>??']
	},[],config).spread((list, config) => {
		log([
			'Got response other than 400',
			'Failed!'
		])
	}).catch(function(e) {
		console.log('lol')
		if(e.message === '400 Bad Request') {
			log([
				'Got 400 response',
				'Passed!'
			])
			passedTests++
		} else {
			log([
				'Got error other than 400',
				'Failed!'
			])
		}
		return false
	})
]

let lastStep = Promise.try(() => {})
for(let step of tests)
	lastStep = lastStep.then(step)
lastStep.then(() => {
	console.log(`Passed ${passedTests} of ${tests.length}`)
})

if(false)
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