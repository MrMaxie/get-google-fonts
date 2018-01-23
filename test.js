process.on('uncaughtException', e => {
	console.log(`%c ${e.stack}`, 'color: red;')
})

const Q = require('q')
const MAIN_SCRIPT = './main.js'
const DEFAULT_CONFIG = {
	verbose: false,
	simulate: false,
	overwriting: false,
}
const ggf = require(MAIN_SCRIPT)
const DEFAULT_GGF = new ggf()

let tests = [
	// String @import
	'https://fonts.googleapis.com/css?family=Lato:100i,400,700,900i|Roboto+Condensed:300,400,400i|Supermercado+One&subset=cyrillic,greek,vietnamese',
	// String <link> (with special characters)
	'https://fonts.googleapis.com/css?family=Lato:100i,400,700,900i|Roboto+Condensed:300,400,400i|Supermercado+One&amp;subset=cyrillic,greek,vietnamese',
	// Constructed
	ggf.constructUrl({
		Lato: ['100i','400','700','900i'],
		'Roboto Condensed': ['300','400','400i'],
		'Supermercado One': []
	}, [
		'cyrillic', 'greek', 'vietnamese'
	]),
	// Pass array for construct
	[{
		Lato: ['100i','400','700','900i'],
		'Roboto Condensed': '300,400',
		'Roboto+Condensed': ['400i'],
		'Supermercado One': []
	}, [
		'cyrillic', 'greek', 'vietnamese'
	]],
	// Non-google's
	'http://weloveiconfonts.com/api/?family=entypo|fontawesome|fontelico|maki|zocial'
]

let res = Q()
tests.forEach((x, i) => {
	res = res.then(DEFAULT_GGF.download.bind(DEFAULT_GGF, x, DEFAULT_CONFIG))
})
