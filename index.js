'use strict';

const Buffer2 = require('buffer');
const fs = require('fs');

var blockSize = 256;

/**
 * Build strings in memory.
 * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)?} [content = ''] The text you want to initialize.
 * @constructor StringBuilder
 */
var StringBuilder = function (content = '') {
    var self = this;

    // TODO -----Variables-----
    var length = 0;
    var capacity = blockSize;
    var buffer;

    // TODO -----Initializer-----
    if (arguments.length > 1) {
        [length, capacity, buffer] = arguments;
        content = '';
    } else {
        buffer = Buffer.allocUnsafe(blockSize);
    }

    // TODO -----Functions-----
    /**
     * Re-allocate space.
     * @param {Number} newSize The new size you need to re-allocate. The final capacity will bigger than this value.
     */
    var reAlloc = function (newSize) {
        if (capacity < newSize) {
            let count = Math.ceil((newSize - capacity) / blockSize);
            let sizeToAdd = count * blockSize;
            let emptyBuffer = Buffer.allocUnsafe(sizeToAdd);
            buffer = Buffer.concat([buffer, emptyBuffer]);
            capacity += sizeToAdd;
        }
    };

    /**
     * Get a buffer of UTF-16LE data from the outside source.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} source The source of data.
     * @returns {Buffer|undefined}
     */
    var getBufferFromOutside = function (source) {
        var type = typeof source;
        var dataBuffer;
        switch (type) {
            case 'object':
                if (Buffer.isBuffer(source)) {
                    dataBuffer = Buffer2.transcode(source, 'utf8', 'utf16le');
                    break;
                } else if (source instanceof StringBuilder) {
                    let sourceBuffer = source._getBuffer();
                    let sourceLength = source._getLength();
                    dataBuffer = sourceBuffer.slice(0, sourceLength);
                    break;
                } else if (source instanceof fs.ReadStream) {
                    source.close();
                    let path = source.path;
                    let encoding = source._readableState.encoding;
                    if (typeof encoding !== 'string') {
                        encoding = 'utf8';
                    }
                    let content = fs.readFileSync(path);
                    if (encoding !== 'utf16le') {
                        content = Buffer2.transcode(content, encoding, 'utf16le');
                    }
                    dataBuffer = content;
                    break;
                }
            // no break here
            case 'boolean':
            case 'number':
                dataBuffer = Buffer.from(source.toString(), 'utf16le');
                break;
            case 'string':
                dataBuffer = Buffer.from(source, 'utf16le');
                break;
            default:
                return undefined;
        }
        return dataBuffer;
    };

    /**
     * Get the real index from outside.
     * @param {Number} index
     */
    var getRealIndex = function (index) {
        if (index < 0) {
            index = length / 2 + index;
        }
        if (index < 0) {
            index = 0;
        } else if (index > length / 2) {
            index = length;
        } else {
            index *= 2;
        }
        return index;
    };

    /**
     * Whether the input buffer matches the specific position of this StringBuilder or not.
     * @param {Buffer!} patternBuffer
     * @param {Number?} [offset = 0]
     * @returns {Boolean}
     */
    var isMatchWithBuffer = function (patternBuffer, offset = 0) {
        let patternBufferLength = patternBuffer.length;
        if (offset < 0 || patternBufferLength + offset > length) {
            return false;
        }
        for (let i = 0; i < patternBufferLength; ++i) {
            if (patternBuffer[i] !== buffer[i + offset]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Whether the character can be trimmed or not.
     * @param {Number} characterCode
     */
    var isTrimmable = function (characterCode) {
        return characterCode <= 32 || characterCode === 12288;
    };

    // TODO -----Getters-----
    /**
     * Please don't use this function.
     * @returns {Buffer}
     * @private
     */
    this._getBuffer = function () {
        return buffer;
    };

    /**
     * Please don't use this function.
     * @returns {Number}
     * @private
     */
    this._getLength = function () {
        return length;
    };

    /**
     * Get the length.
     * <br/>
     * <b>#Sync</b>
     * @returns {Number} The current length of this string.
     */
    this.length = function () {
        return length / 2;
    };

    /**
     * Get the capacity.
     * <br/>
     * <b>#Sync</b>
     * @returns {Number} The current capacity of this StringBuilder.
     */
    this.capacity = function () {
        return capacity / 2;
    };

    // TODO -----Changers-----
    /**
     * Replace the characters in the specific range in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [start = 0] The start index.
     * @param {Number?} [end = length] The end index.
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to replace.
     * @returns {StringBuilder}
     */
    this.replace = function (start = 0, end = length / 2, content) {
        start = getRealIndex(start);
        end = getRealIndex(end);
        if (start > end) {
            return this;
        }
        var contentBuffer = getBufferFromOutside(content);
        if (contentBuffer === undefined) {
            return this;
        }
        var contentBufferLength = contentBuffer.length;
        var replaceLength = end - start;
        var concatLength = length + contentBufferLength - replaceLength;
        reAlloc(concatLength);
        if (end === length || contentBufferLength === replaceLength) {
            contentBuffer.copy(buffer, start);
        } else {
            let b = Buffer.allocUnsafe(length - end);
            buffer.copy(b, 0, end);
            contentBuffer.copy(buffer, start);
            b.copy(buffer, start + contentBufferLength);
        }
        length = concatLength;
        return this;
    };

    /**
     * Insert text into this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [offset = 0] The index you want to start to insert.
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to insert.
     * @returns {StringBuilder}
     */
    this.insert = function (offset = 0, content) {
        if (arguments.length < 2) {
            content = offset;
            offset = 0;
        } else {
            offset = getRealIndex(offset);
        }
        var contentBuffer = getBufferFromOutside(content);
        if (contentBuffer === undefined) {
            return this;
        }
        var contentBufferLength = contentBuffer.length;
        var concatLength = length + contentBufferLength;
        reAlloc(concatLength);
        if (offset === length) {
            contentBuffer.copy(buffer, length);
        } else {
            let bs = Buffer.allocUnsafe(offset);
            buffer.copy(bs, 0, 0, offset);
            let be = Buffer.allocUnsafe(length - offset);
            buffer.copy(be, 0, offset, length);
            bs.copy(buffer, 0);
            contentBuffer.copy(buffer, offset);
            be.copy(buffer, offset + contentBufferLength);
        }
        length = concatLength;
        return this;
    };

    /**
     * Remove the characters in a substring of this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [start = 0] The start index.
     * @param {Number?} [end = length] The end index.
     * @returns {StringBuilder}
     */
    this.delete = function (start = 0, end = length / 2) {
        start = getRealIndex(start);
        end = getRealIndex(end);
        if (start >= end) {
            return this;
        }
        if (end === length) {
            length = start;
        } else {
            let b = Buffer.allocUnsafe(length - end);
            buffer.copy(b, 0, end);
            b.copy(buffer, start);
            length -= (end - start);
        }
        return this;
    };

    /**
     * Remove the character at the specified position in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number!} index Index of char to remove.
     * @returns {StringBuilder}
     */
    this.deleteCharAt = function (index) {
        this.delete(index, index + 1);
        return this;
    };

    /**
     * Reserve the substring at the specified range in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [start = 0] The start index.
     * @param {Number?} [end = length] The end index.
     * @returns {StringBuilder}
     */
    this.substring = this.slice = function (start = 0, end = length / 2) {
        start = getRealIndex(start);
        end = getRealIndex(end);
        if (start >= end) {
            length = 0;
            return this;
        }
        if (start === 0) {
            length = end;
        } else {
            length = end - start;
            let b = Buffer.allocUnsafe(length);
            buffer.copy(b, 0, start, end);
            b.copy(buffer, 0);
        }
        return this;
    };

    /**
     * Reserve the substring at the specified position and length in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [start = 0] The start index.
     * @param {Number?} [length = length] The length of the substring.
     * @returns {StringBuilder}
     */
    this.substr = function (start = 0, length = length / 2) {
        start = getRealIndex(start);
        if (length = 0) {
            length = 0;
        }
        this.substring(start, start + length);
        return this;
    };

    /**
     * Append data from ReadStream into this StringBuilder.
     * <br/>
     * <b>#Async</b>
     * @param {ReadStream!} readStream The read stream you want to append.
     * @returns {Promise<StringBuilder>}
     */
    this.appendReadStream = async function (readStream) {
        readStream.setEncoding('utf8');
        var promise = new Promise(function (resolve, reject) {
            readStream.on('error', function (err) {
                reject(err);
            });
            readStream.on('data', function (text) {
                self.append(text);
            });
            readStream.on('close', function () {
                resolve();
            });
        });
        await promise.then();
        return this;
    };

    /**
     * Append text into this StringBuilder and add a new line.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to append.
     * @returns {StringBuilder}
     */
    this.appendLine = function (content) {
        this.insert(length / 2, content);
        if (length === capacity) {
            reAlloc(capacity + 2);
        }
        buffer.writeUInt16LE(10, length);
        length += 2;
        return this;
    };

    /**
     * Append text into this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to append.
     * @returns {StringBuilder}
     */
    this.append = this.concat = function (content) {
        this.insert(length / 2, content);
        return this;
    };

    /**
     * Reverse the text.
     * <br/>
     * <b>#Sync</b>
     * @returns {StringBuilder}
     */
    this.reverse = function () {
        reAlloc(length * 2);
        var capacity_dec_2 = capacity - 2;
        for (let i = 0; i < length; i += 2) {
            buffer.copy(buffer, capacity_dec_2 - i, i, i + 2);
        }
        buffer.copy(buffer, 0, capacity - length, capacity);
        return this;
    };

    /**
     * Convert the text into upper case.
     * <br/>
     * <b>#Sync</b>
     * @returns {StringBuilder}
     */
    this.upperCase = this.toUpperCase = function () {
        for (let i = 0; i < length; i += 2) {
            let v = buffer.readUInt16LE(i);
            if (v >= 97 && v <= 122) {
                buffer[i] -= 32;
            }
        }
        return this;
    };

    /**
     * Convert the text into lower case.
     * <br/>
     * <b>#Sync</b>
     * @returns {StringBuilder}
     */
    this.lowerCase = this.toLowerCase = function () {
        for (let i = 0; i < length; i += 2) {
            let v = buffer.readUInt16LE(i);
            if (v >= 65 && v <= 90) {
                buffer[i] += 32;
            }
        }
        return this;
    };

    /**
     * Replace the substrings in a specific pattern in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} pattern The pattern you want to search.
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to replace.
     * @param {Number?} [offset = 0] The number of characters you want to skip
     * @param {Number?} [limit = 1] The max number of characters you want to search.
     * @returns {StringBuilder}
     */
    this.replacePattern = function (pattern, content, offset = 0, limit = 1) {
        var sbPattern = new StringBuilder(pattern);
        var sbPatternLength = sbPattern.length();
        var index = this.indexOf(sbPattern, offset, limit);
        var indexLength = index.length;
        if (indexLength === 0) {
            return this;
        }
        var replaceStartIndex = [index[0]];
        var replaceEndIndex = [];
        var j = 0;
        for (let i = 1; i < indexLength; ++i) {
            var lastEndIndex = replaceStartIndex[j] + sbPatternLength;
            if (lastEndIndex <= index[i]) {
                replaceEndIndex.push(lastEndIndex);
                replaceStartIndex.push(index[i]);
                ++j;
            }
        }
        replaceEndIndex.push(replaceStartIndex[j] + sbPatternLength);
        for (; j >= 0; --j) {
            this.replace(replaceStartIndex[j], replaceEndIndex[j], content);
        }
        return this;
    };

    /**
     * Replace all the substrings in a specific pattern in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} pattern The pattern you want to search.
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to replace.
     * @returns {StringBuilder}
     */
    this.replaceAll = function (pattern, content) {
        this.replacePattern(pattern, content, 0, 0);
        return this;
    };

    /**
     * Remove any leading and trailing whitespace.
     * <br/>
     * <b>#Sync</b>
     * @returns {StringBuilder}
     */
    this.trim = function () {
        let start = 0;
        for (; start < length; start += 2) {
            let v = buffer.readUInt16LE(start);
            if (isTrimmable(v)) {
                continue;
            }
            break;
        }
        let end = length - 2;
        for (; end > start; end -= 2) {
            let v = buffer.readUInt16LE(end);
            if (isTrimmable(v)) {
                continue;
            }
            break;
        }
        this.substring(start / 2, end / 2 + 1);
        return this;
    };

    /**
     * Expand the capacity. If the length of the string is predictable, you can use this function to pre-allocate the space for the string in memory.
     * <br/>
     * <b>#Sync</b>
     * @param {Number!} newCapacity The new capacity you want to set.
     * @returns {Number} The updated capacity.
     */
    this.expandCapacity = function (newCapacity) {
        reAlloc(newCapacity * 2);
        return capacity / 2;
    };

    /**
     * Shrink the capacity.
     * <br/>
     * <b>#Sync</b>
     * @returns {Number} The updated capacity.
     */
    this.shrinkCapacity = function () {
        let count = Math.ceil(length / blockSize);
        capacity = count * blockSize;
        let emptyBuffer = Buffer.allocUnsafe(capacity);
        buffer.copy(emptyBuffer, 0, 0, length);
        buffer = emptyBuffer;
        return capacity / 2;
    };

    // TODO -----Unchangers-----
    /**
     * Get the character at the specified position in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number!} index The specified position.
     * @returns {String}
     */
    this.charAt = function (index) {
        if (index < 0) {
            index = length / 2 - start;
        }
        if (index < 0) {
            index = 0;
        } else if (index > length / 2) {
            index = length;
        } else {
            index *= 2;
        }
        return buffer.slice(index, index + 2).toString('utf16le');
    };

    /**
     * Search the substrings in the source text by using Boyer-Moore-MagicLen algorithm.
     * See '[this page]{@link https://magiclen.org/boyer-moore-magiclen/}' for more details.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} pattern The pattern you want to search.
     * @param {Number?} [offset = 0] The number of characters you want to skip
     * @param {Number?} [limit = 0] The max number of substrings you want to search.
     * @returns {Array.<Number>} Return an array of searched indices.
     */
    this.indexOf = function (pattern, offset = 0, limit = 0) {
        var patternUTF16Buffer = getBufferFromOutside(pattern);
        if (patternUTF16Buffer === undefined) {
            return [];
        }
        var sourceLength = length / 2;
        var patternLength = patternUTF16Buffer.length / 2;
        if (patternLength === 0 || offset < 0 || sourceLength - offset < patternLength) {
            return [];
        }
        var sourceLength_dec = sourceLength - 1;
        var patternLength_dec = patternLength - 1;
        var resultList = [];
        var badCharShiftMap = new Array(65536).fill(patternLength);
        var patternUTF16 = [];
        for (let i = 0; i < patternLength_dec; ++i) {
            let index = patternUTF16Buffer.readUInt16LE(i * 2);
            patternUTF16.push(index);
            badCharShiftMap[index] = patternLength_dec - i;
        }
        patternUTF16.push(patternUTF16Buffer.readUInt16LE(patternLength_dec * 2));
        var specialChar = patternUTF16[patternLength_dec];
        var specialShift = badCharShiftMap[specialChar];
        badCharShiftMap[specialChar] = 0;
        var sourcePointer = offset + patternLength_dec;
        var patternPointer;
        while (sourcePointer < sourceLength) {
            patternPointer = patternLength_dec;
            while (patternPointer >= 0) {
                if (buffer.readUInt16LE(sourcePointer * 2) !== patternUTF16[patternPointer]) {
                    break;
                }
                --sourcePointer;
                --patternPointer;
            }
            let starePointer = sourcePointer;
            let goodSuffixLength_inc = patternLength - patternPointer;
            sourcePointer += goodSuffixLength_inc;
            if (patternPointer < 0) {
                resultList.push(starePointer + 1);
                if (sourcePointer > sourceLength_dec || limit > 0 && resultList.length === limit) {
                    break;
                } else {
                    sourcePointer += badCharShiftMap[buffer.readUInt16LE(sourcePointer * 2)];
                    continue;
                }
            }
            let shift1 = (sourcePointer <= sourceLength_dec) ? badCharShiftMap[buffer.readUInt16LE(sourcePointer * 2)] : 0;
            if (shift1 >= patternLength_dec) {
                sourcePointer += shift1;
            } else {
                let c = buffer.readUInt16LE(starePointer * 2);
                let shift2 = ((c === specialChar) ? specialShift : badCharShiftMap[c]) - goodSuffixLength_inc;
                sourcePointer += (shift1 >= shift2) ? shift1 : shift2;
            }
        }
        return resultList;
    };

    /**
     * Search the substrings in the source text by using Boyer-Moore-MagicLen algorithm.
     * See '[this page]{@link https://magiclen.org/boyer-moore-magiclen/}' for more details.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} pattern The pattern you want to search.
     * @param {Number?} [offset = 0] The number of characters you want to skip
     * @param {Number?} [limit = 0] The max number of substrings you want to search.
     * @returns {Array.<Number>} Return an array of searched indices.
     */
     this.lastIndexOf = function (pattern, offset = 0, limit = 0) {
         var patternUTF16Buffer = getBufferFromOutside(pattern);
         if (patternUTF16Buffer === undefined) {
             return [];
         }
         var sourceLength = length / 2;
         var patternLength = patternUTF16Buffer.length / 2;
         if (patternLength === 0 || offset < 0 || sourceLength - offset < patternLength) {
             return [];
         }
         var sourceLength_dec = sourceLength - 1;
         var patternLength_dec = patternLength - 1;
         var resultList = [];
         var badCharShiftMap = new Array(65536).fill(patternLength);
         var patternUTF16 = [];
         for (let i = patternLength_dec; i > 0; --i) {
             let index = patternUTF16Buffer.readUInt16LE(i * 2);
             patternUTF16.push(index);
             badCharShiftMap[index] = i;
         }
         patternUTF16.push(patternUTF16Buffer.readUInt16LE(0));
         patternUTF16.reverse();
         var specialChar = patternUTF16[patternLength_dec];
         var specialShift = badCharShiftMap[specialChar];
         badCharShiftMap[specialChar] = 0;
         var sourcePointer = sourceLength_dec - patternLength_dec;
         var patternPointer;
         while (sourcePointer >= offset) {
             patternPointer = 0;
             while (patternPointer < patternLength) {
                 if (buffer.readUInt16LE(sourcePointer * 2) !== patternUTF16[patternPointer]) {
                     break;
                 }
                 ++sourcePointer;
                 ++patternPointer;
             }
             let starePointer = sourcePointer;
             let goodSuffixLength_inc = patternPointer + 1;
             sourcePointer -= goodSuffixLength_inc;
             if (patternPointer >= patternLength) {
                 resultList.push(sourcePointer + 1);
                 if (sourcePointer < 0 || limit > 0 && resultList.length === limit) {
                     break;
                 } else {
                     sourcePointer -= badCharShiftMap[buffer.readUInt16LE(sourcePointer * 2)];
                     continue;
                 }
             }
             let shift1 = (sourcePointer >= 0) ? badCharShiftMap[buffer.readUInt16LE(sourcePointer * 2)] : 0;
             if (shift1 >= patternLength_dec) {
                 sourcePointer -= shift1;
             } else {
                 let c = buffer.readUInt16LE(starePointer * 2);
                 let shift2 = ((c === specialChar) ? specialShift : badCharShiftMap[c]) - goodSuffixLength_inc;
                 sourcePointer -= (shift1 >= shift2) ? shift1 : shift2;
             }
         }
         return resultList;
     };

    /**
     * Check the StringBuilder whether it starts with a specific pattern.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} pattern The pattern you want to search.
     * @returns {Boolean}
     */
    this.startsWith = function (pattern) {
        var patternUTF16Buffer = getBufferFromOutside(pattern);
        if (patternUTF16Buffer === undefined) {
            return false;
        }
        return isMatchWithBuffer(patternUTF16Buffer, 0);
    };

    /**
     * Check the StringBuilder whether it ends with a specific pattern.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} pattern The pattern you want to search.
     * @returns {Boolean}
     */
    this.endsWith = function (pattern) {
        var patternUTF16Buffer = getBufferFromOutside(pattern);
        if (patternUTF16Buffer === undefined) {
            return false;
        }
        return isMatchWithBuffer(patternUTF16Buffer, length - patternUTF16Buffer.length);
    };

    /**
     * Check the StringBuilder whether it logically equals with another data.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} data
     * @returns {Boolean}
     */
    this.equals = function (data) {
        var dataBuffer = getBufferFromOutside(data);
        if (dataBuffer === undefined) {
            return false;
        }
        if (dataBuffer.length !== length) {
            return false;
        }
        for (let i = 0; i < length; ++i) {
            if (dataBuffer[i] !== buffer[i]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Check the StringBuilder whether it logically equals with another data.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} data
     * @returns {Boolean}
     */
    this.equalsIgnoreCase = function (data) {
        var dataBuffer = getBufferFromOutside(data);
        if (dataBuffer === undefined) {
            return false;
        }
        if (dataBuffer.length !== length) {
            return false;
        }
        for (let i = 0; i < length; i += 2) {
            let v1 = buffer.readUInt16LE(i);
            let v2 = dataBuffer.readUInt16LE(i);
            if (v1 >= 97 && v1 <= 122) {
                v1 -= 32;
            }
            if (v2 >= 97 && v2 <= 122) {
                v2 -= 32;
            }
            if (v1 !== v2) {
                return false;
            }
        }
        return true;
    };

    /**
     * Build a string.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [start = 0] The start index.
     * @param {Number?} [end = length] The end index.
     * @returns {String}
     */
    this.toString = function (start = 0, end = length / 2) {
        start = getRealIndex(start);
        end = getRealIndex(end);
        return buffer.slice(start, end).toString('utf16le');
    };

    /**
     * Build a UTF-8 buffer.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [start = 0] The start index.
     * @param {Number?} [end = length] The end index.
     * @returns {Buffer}
     */
    this.toBuffer = function (start = 0, end = length / 2) {
        start = getRealIndex(start);
        end = getRealIndex(end);
        return Buffer2.transcode(buffer.slice(start, end), 'utf16le', 'utf8');
    };

    /**
     * Clone this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @returns {StringBuilder} Return a new StringBuilder.
     */
    this.clone = function () {
        var newBuffer = Buffer.allocUnsafe(capacity);
        buffer.copy(newBuffer, 0, 0, length);
        return new StringBuilder(length, capacity, newBuffer);
    };

    /**
     * Count the words.
     * <br/>
     * <b>#Sync</b>
     * @returns {Number}
     */
    this.count = function () {
        var mode = 0; //0: nornal, 1: appending, 2: integer, 3: prefloat, 4: float
        var sum = 0;
        for (let i = 0; i < length; i += 2) {
            let v = buffer.readUInt16LE(i);
            if (v >= 48 && v <= 57) {
                switch (mode) {
                    case 0:
                        mode = 2;
                        break;
                    case 3:
                        mode = 4;
                        break;
                    default:
                        break;
                }
            } else if (v >= 65 && v <= 90 || v >= 97 && v <= 122) {
                switch (mode) {
                    case 0:
                        mode = 1;
                        break;
                    case 2:
                        mode = 1;
                        break;
                    case 3:
                    case 4:
                        ++sum;
                        mode = 1;
                        break;
                    default:
                        break;
                }
            } else if (v > 127) {
                switch (mode) {
                    case 0:
                        ++sum;
                        break;
                    default:
                        sum += 2;
                        mode = 0;
                        break;
                }
            } else {
                switch (mode) {
                    case 0:
                        break;
                    case 2:
                        if (v === 46) {
                            mode = 3;
                        } else {
                            ++sum;
                            mode = 0;
                        }
                        break;
                    default:
                        ++sum;
                        mode = 0;
                        break;
                }
            }
        }
        if (mode !== 0) {
            ++sum;
        }
        return sum;
    };

    // TODO -----Initialize-----
    this.append(content);
};

StringBuilder.prototype.inspect = function () {
    return this.toString();
};

module.exports = StringBuilder;
