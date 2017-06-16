Node StringBuilder
=========

An easy and fast in-memory string builder for Node.js.

## Code Example

```javascript
const StringBuilder = require('node-stringbuilder');
var sb = new StringBuilder('Hi');
sb.appendLine(',').append('This is a simple example demonstrating how to use this module.');
console.log(sb.toString()); // Hi,
                            // This is a simple example demonstrating how to use this module.
sb.insert('Text can be added into any position of this builder.');
sb.replace(53, 118, 'Or replace the existing text.');
console.log(sb.toString()); // Text can be added into any position of this builder.HOr replace the existing text.
sb.deleteCharAt(52).insert(52, ' ');
console.log(sb.toString()); // Text can be added into any position of this builder. Or replace the existing text.
sb.toLowerCase().replaceAll('text', 'string');
console.log(sb.toString()); // string can be added into any position of this builder. or replace the existing string.
console.log(sb.clone().reverse().toString()); // .gnirts gnitsixe eht ecalper ro .redliub siht fo noitisop yna otni dedda eb nac gnirts
console.log(sb.toString(0, 19)); // string can be added
console.log(sb.length()); // 86
console.log(sb.count()); // 15
console.log(sb.indexOf('is')); // [ 43, 72 ]
console.log(sb.lastIndexOf('is')); // [ 72, 43 ]
sb.substring(11, 37);
console.log(sb.toString()); // be added into any position
console.log(sb.toBuffer()); // UTF-8 encoded
```

## Installation

```bash
npm install node-stringbuilder
```

## Features

  * Operating strings in a scalable buffer.
  * Multiple types of data are allowed to input.
  * * Strings
  * * Buffers(utf8 encoded)
  * * Instances of this StringBuilder module
  * * ReadStream(to read file)
  * * Numbers, booleans, other objects
  * Fast search algorithm([Boyer-Moore-MagicLen](https://magiclen.org/boyer-moore-magiclen/))
  * Clonable

## Usage

Comming soon...

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
npm test
```

## License

[MIT](LICENSE)

## To Do

 * Banchmark
 * More test cases
