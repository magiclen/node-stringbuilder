StringBuilder for Node.js
=========

[![CI](https://github.com/magiclen/node-stringbuilder/actions/workflows/ci.yml/badge.svg)](https://github.com/magiclen/node-stringbuilder/actions/workflows/ci.yml)

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
console.log(sb.indexOf('is')); // Uint32Array [ 43, 72 ]
console.log(sb.indexOfSkip('is')); // Uint32Array [ 43, 72 ]
console.log(sb.lastIndexOf('is')); // Uint32Array [ 72, 43 ]
console.log(sb.indexOfRegExp(/is/g)); // { index: [ 43, 72 ], lastIndex: [ 45, 74 ] }
console.log(sb.repeat().indexOf('is')); // Uint32Array [ 43, 72, 129, 158 ]
sb.substring(11, 37);
console.log(sb.toString()); // be added into any position
console.log(sb.equalsIgnoreCase('be Added into Any position')); // true
console.log(sb.toBuffer()); // UTF-8 encoded
```

## Features

  * Implemented with N-API.
  * Operating strings in a scalable buffer.
  * Multiple types of data are allowed to input.
    * Strings
    * Buffers(UTF-8 encoded)
    * Instances of this StringBuilder module
    * ReadStream(to read file)
    * Numbers, booleans, other objects
  * Fast string search algorithm([Boyer-Moore-MagicLen](https://magiclen.org/boyer-moore-magiclen/))
  * Clonable

## Usage

### Initiaiizing

Import this module by using `require` function.

```javascript
const StringBuilder = require('node-stringbuilder');
```

Use `new` operator or `from` function to create a StringBuilder instance.

```javascript
var sb1 = new StringBuilder();
// or
var sb2 = StringBuilder.from();
```

When creating an instance of StringBuilder, you can initialize the text and capacity.

```javascript
var sb = StringBuilder.from('First', 4096);
```

By default, a block of buffer space used by StringBuilder is 128 characters. The space of the buffer can be expanded or shrinked by blocks.

```javascript
// To expand
var newCapacity = 65536;
sb.expandCapacity(newCapacity);
// To shrink
sb.shrinkCapacity();
```

If some text are added into StringBuilder, StringBuilder will check its space. And if the space is too small, it will re-alloc a bigger one automatically. This re-allocation has overheads, if it does this frequently, your program may be slowed down. Therefore, if you can predict the length of your text, please set the capacity when creating a StringBuilder instance.

### Append

Concat text.

```javascript
sb.append('string').append(123).append(false).append(fs.createReadStream(path));
```

Add a new line after append.

```javascript
sb.appendLine('string');
```

Append text repeatedly.

```javascript
sb.appendRepeat('string', 3);
```

Append a file asynchronizely.

```javascript
await sb.appendReadStream(fs.createReadStream(path));
```

### Insert

Insert text to any position.

```javascript
sb.insert('string'); // To the head.
sb.insert(5, 'string');
```

### Replace

Replace text to the position in a range of index.

```javascript
sb.replace(4, 15, 'string');
```

Replace existing substrings to another.

```javascript
sb.replacePattern('old', 'new');
sb.replacePattern('old', 'new', offset, limit);
```

Replace all existing substrings to another.

```javascript
sb.replaceAll('old', 'new');
```

### Delete

Delete text from a range of index.

```javascript
sb.delete(4, 15);
```

Delete a character at a index.

```javascript
sb.deleteCharAt(4);
```

Clear all text, but preserve the capacity.

```javascript
sb.clear();
```

### Substring

Reserve text in a range of index.

```javascript
sb.substring(1, 5); // input the start and end index
```

```javascript
sb.substr(1, 5); // input the start index and length
```

### Reverse

Reverse text.

```javascript
sb.reverse();
```

### Upper/Lower Case

Convert text to upper or lower case.

```javascript
sb.upperCase();
sb.lowerCase();
```

### Trim

Remove any leading and trailing whitespace.

```javascript
sb.trim();
```

### Repeat

Repeat current text for specific count.

```javascript
sb.repeat(1);
```

### Expand Capacity

Expand the capacity of this StringBuilder.

```javascript
sb.expandCapacity(4096).append('string');
```

Expand and get the updated capacity,

```javascript
var capacity = sb.expandCapacity(4096, true);
```

### Shrink Capacity

Shrink the capacity of this StringBuilder.

```javascript
sb.shrinkCapacity().clone().append('string');
```

Shrink and get the updated capacity,

```javascript
var capacity = sb.shrinkCapacity(true);
```

### Get Current Text Length

To get the length of this StringBuilder,

```javascript
var length = sb.length();
```

### Get Current Capacity

To get the length of this StringBuilder,

```javascript
var capacity = sb.capacity();
```

### Count the words

To count the words,

```javascript
var words = sb.count();
```

### Build String

Build a string of a specific range of index.

```javascript
var str = sb.toString(4, 10);
```

Build a UTF-8 buffer of a specific range of index.

```javascript
var buffer = sb.toBuffer(4, 10);
```

To get the full text,

```javascript
var text = sb.toString();
var buffer = sb.toBuffer();
```

To get one character at a specific index,

```javascript
var c = sb.charAt(4);
```

### Search String

Search substrings from the head,

```javascript
var indexArray = sb.indexOf('string');
var indexArray2 = sb.indexOf('string', offset, limit);
```

Search substrings from the head by using RegExp,

```javascript
var indexArray = sb.indexOf(/string/g);
```

Search substrings from the end,

```javascript
var indexArray = sb.lastIndexOf('string');
```

### Equals

Determine whether the two strings are the same.

```javascript
var equal = sb.equals('string');
```

To ignore the case of letters,

```javascript
var equal = sb.equalsIgnoreCase('string');
```

Determine whether it starts or ends with a specific pattern.

```javascript
var start = sb.startsWith('string');
var end = sb.endsWith('string');
```

RegExp is not supported in `startsWith` and `endsWith` methods.

### Clone

Clone this StringBuilder.

```javascript
var newSB = sb.clone();
```

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
npm test
```

## Benchmark

To run the benchmark suite, first install the dependencies, then run `npm run benchmark`:

```bash
npm install
npm run benchmark
```

Here is my result,

```bash
Append
  - 43 milliseconds
  ✓ Natively append text 1000000 times (43ms)
  - 567 milliseconds
  ✓ Use StringBuilder to append text 1000000 times (567ms)
  - 1278 milliseconds
  ✓ Use StringBuilder to insert text 1000000 times at the end (1287ms)
  - 17 milliseconds
  ✓ Use StringBuilder to append text 1000000 times repeatly

Insert
  - 92 milliseconds
  ✓ Natively insert text 10000 times (92ms)
  - 10 milliseconds
  ✓ Use StringBuilder to insert text 10000 times

Delete
  - 1427 milliseconds
  ✓ Natively delete text 5000 times (1429ms)
  - 87 milliseconds
  ✓ Use StringBuilder to delete text 5000 times (88ms)

Replace
  - 1511 milliseconds
  ✓ Natively replace text 5000 times (1513ms)
  - 85 milliseconds
  ✓ Use StringBuilder to replace text 5000 times (86ms)

Replace Pattern
  - 37 milliseconds
  ✓ Natively replace text with the same length by using a RegExp pattern
  - 20 milliseconds
  ✓ Use StringBuilder to replace text with the same length by using a pattern
  - 35 milliseconds
  ✓ Natively replace text by using a RegExp pattern
  - 29 milliseconds
  ✓ Use StringBuilder to replace text by using a pattern

Equals
  - 2 milliseconds
  ✓ Natively check the equal 50000 times
  - 13 milliseconds
  ✓ Use StringBuilder to check the equal 50000 times

EqualsIgnoreCase
  - 21 milliseconds
  ✓ Natively check the equal 50000 times
  - 19 milliseconds
  ✓ Use StringBuilder to check the equal 50000 times

IndexOf
  - 65 milliseconds
  ✓ Natively search text (65ms)
  - 2 milliseconds
  ✓ Use StringBuilder to search text

Reverse
  - 516 milliseconds
  ✓ Natively reverse text (516ms)
  - 14 milliseconds
  ✓ Use StringBuilder to reverse text
```

According to the result of benchmark, if you just want to append a few different strings, please append them by using native operator `+` instead of this module.

## License

[MIT](LICENSE)

## To Do

 * More test cases

If you can help me do this as collaborators, I will be grateful.
