# Get Google Fonts

Script downloading CSS file with fonts and adapt it to working in closed environment/offline. Useful for example when project must to be ran in network without connection with internet or when you make application based on projects like [Electron](https://electron.atom.io/).

## Getting Started

Script can be "installed" manually by cloning `./main.js` file or with NPM:
```
npm install get-google-fonts
```

## Example Result

For example CSS with fonts used like this:
```html
<link href='https://fonts.googleapis.com/css?family=Roboto:400,700&amp;subset=cyrillic' rel='stylesheet'>
```

Can be replaced with:
```html
<link href='fonts/fonts.css' rel='stylesheet'>
```

## Using in command line

Using in command line it's possible when script is installed as `global` or you know full path to `cli.js` file. By default NPM will prefer to install script as global and after that scripts will share file in bin directory named `get-google-fonts`. Then you can just to use that command anywhere.

```
Usage:
  get-google-fonts [OPTIONS] [ARGS]

Options:
  -i, --input URL         Input URL of CSS with fonts
  -o, --output [STRING]   Output directory (Default is ./fonts)
  -p, --path [STRING]     Path placed before every source of font in CSS  (Default is ./)
  -c, --css [STRING]      Name of CSS file (Default is fonts.css)
  -t, --template [STRING] Template of font filename (Default is {_family}-{weight}-{comment}{i}.{ext})
  -u, --useragent STRING  User-agent used at every connection
  -q, --quiet             Don't displays a lot of useful information
  -b, --base64            Save fonts inside CSS file as base64 URIs
	  --non-strict-ssl    Force to accepts only valid SSL certificates; in some
						  cases,such proxy or self-signed certificates
						  should be turned off
  -w, --overwriting       Allows overwrite existing files
	  --print-options     Shows result options object without performing any
						  action
  -s, --simulate          Simulation; No file will be saved
  -h, --help              Display help and usage details
```

To get a result like in [Example](#Example-Result), just enter the command in the folder with the HTML file:

```
get-google-fonts -i "https://fonts.googleapis.com/css?family=Roboto:400,700&subset=cyrillic"
```

## Using in code

Get-google-fonts can be required as module.

```javascript
const GetGoogleFonts = require('get-google-fonts');
```

To get result like in [Example](#Example-Result), just create object and run `download` method.
```javascript
new GetGoogleFonts().download('https://fonts.googleapis.com/css?family=Roboto:400,700&subset=cyrillic')
// => Promise
```

There are three useful methods in all module.

### Constructor

Parameters:

- `config` Allows you to preconfigure all downloads done by this object. [See more...](#Config-object) **[optional]**

Example:

```javascript
let ggf_ttf = new GetGoogleFonts({
	userAgent: 'Wget/1.18'
})
let ggf_defaults = new GetGoogleFonts()
```
### download

Parameters:

- `url` URL to CSS as fonts object or plain string. Can be an array of arguments witch will be passed through [GetGoogleFonts.constructUrl()](#constructUrl).
- `config` Allows you to configure this one downloads. [See more...](#Config-object) **[optional]**

Example:

```javascript
ggf.download([
	{
		Roboto: [400, 700]
	},
	['cyrillic']
]).then(() => {
	console.log('Done!')
}).catch(() => {
	console.log('Whoops!')
})
// or
ggf.download('https://fonts.googleapis.com/css?family=Roboto:400,700&subset=cyrillic', {
	userAgent: 'Wget/1.18'
}).then(() => {
	console.log('Done!')
}).catch(() => {
	console.log('Whoops!')
})
```

### constructUrl

Generate URL of Google Fonts using given parameters.

Parameters:

- `families` Object of fonts names and weights
- `subsets` Array of subsets

Example:

```javascript
GetGoogleFonts.constructUrl([
	{
		Roboto: ['400', 700],
		'Roboto': [400, '700i'],
		'Alegreya Sans SC': [300]
	},
	['cyrillic']
])
// => https://fonts.googleapis.com/css?family=Roboto:400,700,700i|Alegreya+Sans+SC:300&subset=cyrillic
```

## Config object

Objects will be considered as follows:
Download config > GetGoogleFonts object config > Default config

```javascript
// Default config object
{
	// Output directory when where all files will be saved.
	// According to this path, relative paths will be resolved.
	outputDir:  './fonts',
	// Path placed before every source of font in CSS.
	// It's also can be URL of your website.
	path:       './',
	// Template of font filename.
	template:   '{_family}-{weight}-{comment}{i}.{ext}',
	// Name of CSS file. Like other files
	// will be placed relative to output directory
	cssFile:    'fonts.css',
	// User-agent used at every connection. Accordingly, Google Fonts will
	// send the appropriate fonts. For example, providing a wget's
	// user-agent will end with the download of .ttf fonts.
	// Default user-agent downloads .woff2 fonts.
	userAgent:  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
				'(KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
	// Save fonts inside CSS file as base64 URIs
	base64:      false,
	// Force to accepts only valid SSL certificates; in some cases,
	// such proxy or self-signed certificates should be turned off
	strictSSL:   true,
	// Allows overwrite existing files.
	overwriting: false,
	// Displays a lot of useful information.
	verbose:     false,
	// Simulation; No file will be saved.
	simulate:    false
}
```

## Template

Following variables can be used in the template:
- `{comment}` Text from comment placed before @font-face. Google place there name of subset e.g. latin
- `{family}` Font-family e.g. Source Sans Pro
- `{_family}` Font-family (whitespace will be replaced with underscore) e.g. Source_Sans_Pro
- `{weight}` Font-weight e.g. 400
- `{filename}` Name of original file e.g. ODelI1aHBYDBqgeIAH2zlC2Q8seG17bfDXYR_jUsrzg
- `{ext}` Original extension e.g. woff2
- `{i}` A number that is incremented one by one each time a font file is added. Useful to preserve the uniqueness of font names in case you are not sure if the previous variables are enough. **It starts from 1.**

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE.md](LICENSE.md) file for details
