'use strict';

const Buffer2 = require('buffer');
const fs = require('fs');

var blockSize = 256;

/**
 * Build strings in memory.
 * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)?} [content = ''] The text you want to initialize.
 * @param {Number?} [initialCapacity = 128] The initial capacity.
 * @constructor StringBuilder
 */
var StringBuilder = function (content = '', initialCapacity = blockSize / 2) {
    var self = this;

    // TODO -----Variables-----
    var length;
    var capacity;
    var buffer;

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
        var halfLength = length / 2;
        if (index < 0) {
            index += halfLength;
        }
        if (index < 0) {
            index = 0;
        } else if (index > halfLength) {
            index = length;
        } else {
            index *= 2;
        }
        return index;
    };

    /**
     * Whether the character can be trimmed or not.
     * @param {Number} characterCode
     */
    var isTrimmable = function (characterCode) {
        return characterCode <= 32 || characterCode === 12288;
    };

    /**
     * Compute Floor(log2(n)).
     * @param {Number} n
     * @returns {Number}
     */
    var log2Floor = function (n) {
        return Math.floor(Math.log(n) / Math.log(2));
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
            buffer.copy(buffer, start + contentBufferLength, end, length);
            contentBuffer.copy(buffer, start);
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
            buffer.copy(buffer, offset + contentBufferLength, offset, length);
            contentBuffer.copy(buffer, offset);
        }
        length = concatLength;
        return this;
    };

    /**
     * Clear this StringBuilder but preserve the capacity.
     * <br/>
     * <b>#Sync</b>
     * @returns {StringBuilder}
     */
    this.clear = function () {
        length = 0;
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
            buffer.copy(buffer, start, end, length);
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
    this.substring = function (start = 0, end = length / 2) {
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
            buffer.copy(buffer, 0, start, end);
        }
        return this;
    };
    this.slice = this.substring;

    /**
     * Reserve the substring at the specified position and length in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [start = 0] The start index.
     * @param {Number?} [length = length] The length of the substring.
     * @returns {StringBuilder}
     */
    this.substr = function (start = 0, length = length / 2) {
        start = getRealIndex(start) / 2;
        if (length < 0) {
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
        this.append(content);
        if (length === capacity) {
            reAlloc(capacity + 2);
        }
        buffer.writeUInt16LE(10, length);
        length += 2;
        return this;
    };

    /**
     * Append text into this StringBuilder repeatedly.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to append.
     * @param {Number?} [repeatCount = 1] The count you want to repeat.
     * @returns {StringBuilder}
     */
    this.appendRepeat = function (content, repeatCount = 1) {
        if (repeatCount < 1) {
            repeatCount = 1;
        }
        var contentBuffer = getBufferFromOutside(content);
        if (contentBuffer === undefined) {
            return this;
        }
        var contentBufferLength = contentBuffer.length;
        var concatLength = length + (contentBufferLength * repeatCount);
        reAlloc(concatLength);
        // log2 copy
        var log2Count = log2Floor(repeatCount);
        contentBuffer.copy(buffer, length);
        for (let i = 1; i <= log2Count; ++i) {
            let addedLength = Math.pow(2, i - 1) * contentBufferLength;
            buffer.copy(buffer, length + addedLength, length, length + addedLength);
        }
        var realAddedCount = Math.pow(2, log2Count);
        length += contentBufferLength * realAddedCount;
        // normal copy
        var remainCount = repeatCount - realAddedCount;
        for (let i = 0; i < remainCount; ++i) {
            contentBuffer.copy(buffer, length);
            length += contentBufferLength;
        }
        return this;
    };

    /**
     * Append text into this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to append.
     * @returns {StringBuilder}
     */
    this.append = function (content) {
        var contentBuffer = getBufferFromOutside(content);
        if (contentBuffer === undefined) {
            return this;
        }
        var contentBufferLength = contentBuffer.length;
        var concatLength = length + contentBufferLength;
        reAlloc(concatLength);
        contentBuffer.copy(buffer, length);
        length = concatLength;
        return this;
    };
    this.concat = this.append;

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
    this.upperCase = function () {
        for (let i = 0; i < length; i += 2) {
            let v = buffer.readUInt16LE(i);
            if (v >= 97 && v <= 122) {
                buffer[i] -= 32;
            }
        }
        return this;
    };
    this.toUpperCase = this.upperCase;

    /**
     * Convert the text into lower case.
     * <br/>
     * <b>#Sync</b>
     * @returns {StringBuilder}
     */
    this.lowerCase = function () {
        for (let i = 0; i < length; i += 2) {
            let v = buffer.readUInt16LE(i);
            if (v >= 65 && v <= 90) {
                buffer[i] += 32;
            }
        }
        return this;
    };
    this.toLowerCase = this.lowerCase;

    /**
     * Replace the substrings in a specific pattern in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream|RegExp)!} pattern The pattern you want to search.
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} content The text you want to replace.
     * @param {Number?} [offset = 0] The number of characters you want to skip
     * @param {Number?} [limit = 1] The max number of characters you want to search.
     * @returns {StringBuilder}
     */
    this.replacePattern = function (pattern, content, offset = 0, limit = 1) {
        if (pattern instanceof RegExp) {
            let searched = this.indexOfRegExp(pattern, offset, limit);
            let indexArray = searched.index;
            let lastIndexArray = searched.lastIndex;
            for (let i = indexArray.length - 1; i >= 0; --i) {
                this.replace(indexArray[i], lastIndexArray[i], content);
            }
        } else {
            let sbPattern = new StringBuilder(pattern);
            let sbPatternLength = sbPattern.length();
            let index = this.indexOf(sbPattern, offset, limit);
            let indexLength = index.length;
            if (indexLength === 0) {
                return this;
            }
            let replaceStartIndex = [index[0]];
            let replaceEndIndex = [];
            let j = 0;
            for (let i = 1; i < indexLength; ++i) {
                let lastEndIndex = replaceStartIndex[j] + sbPatternLength;
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
        }
        return this;
    };

    /**
     * Replace all the substrings in a specific pattern in this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream|RegExp)!} pattern The pattern you want to search.
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
     * @param {Boolean?} [returnUpdatedCapacity = false] Return the updated capacity or the reference of this StringBuilder.
     * @returns {Number|StringBuilder} The updated capacity or the reference of this StringBuilder.
     */
    this.expandCapacity = function (newCapacity, returnUpdatedCapacity = false) {
        reAlloc(newCapacity * 2);
        if (returnUpdatedCapacity) {
            return capacity / 2;
        }
        return this;
    };

    /**
     * Shrink the capacity.
     * <br/>
     * <b>#Sync</b>
     * @param {Boolean?} [returnUpdatedCapacity = false] Return the updated capacity or the reference of this StringBuilder.
     * @returns {Number|StringBuilder} The updated capacity or the reference of this StringBuilder.
     */
    this.shrinkCapacity = function (returnUpdatedCapacity = false) {
        let count = Math.ceil(length / blockSize);
        if (count === 0) {
            count = 1;
        }
        let newCapacity = count * blockSize;
        if (newCapacity < capacity) {
            let emptyBuffer = Buffer.allocUnsafe(newCapacity);
            buffer.copy(emptyBuffer, 0, 0, length);
            buffer = emptyBuffer;
            capacity = newCapacity;
        }
        if (returnUpdatedCapacity) {
            return capacity / 2;
        }
        return this;
    };

    /**
     * Repeat this StringBuilder.
     * <br/>
     * <b>#Sync</b>
     * @param {Number?} [repeatCount = 1] The count you want to repeat.
     * @returns {StringBuilder}
     */
    this.repeat = function (repeatCount = 1) {
        if (repeatCount <= 0) {
            return this;
        }
        var finalLength = length * repeatCount;
        var originalLength = length;
        reAlloc(finalLength);
        // log2 copy
        var log2Count = log2Floor(repeatCount);
        buffer.copy(buffer, originalLength);
        for (let i = 1; i <= log2Count; ++i) {
            let addedLength = Math.pow(2, i - 1) * originalLength;
            buffer.copy(buffer, originalLength + addedLength, originalLength, originalLength + addedLength);
        }
        var realAddedCount = Math.pow(2, log2Count);
        length += originalLength * realAddedCount;
        // normal copy
        var remainCount = repeatCount - realAddedCount;
        for (let i = 0; i < remainCount; ++i) {
            buffer.copy(buffer, length, 0, originalLength);
            length += originalLength;
        }
        return this;
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
     * Search the substrings in the source text by using RegExp. This function needs to build the string.
     * <br/>
     * <b>#Sync</b>
     * @param {RegExp!} regExp The regular expression pattern you want to use.
     * @param {Number?} [offset = 0] The number of characters you want to skip
     * @param {Number?} [limit = 0] The max number of substrings you want to search.
     * @returns {{index: Array.<Number>, lastIndex: Array.<Number>}} Return two arrays of searched indices.
     */
    this.indexOfRegExp = function (regExp, offset = 0, limit = 0) {
        if (!(regExp instanceof RegExp)) {
            regExp = new RegExp(regExp.toString());
        }
        offset = getRealIndex(offset);
        var str = buffer.slice(offset, length).toString('utf16le');
        var match;
        var resultIndexList = [];
        var resultLastIndexList = [];
        if (regExp.global) {
            while (match = regExp.exec(str)) {
                let index = match.index;
                resultIndexList.push(index);
                resultLastIndexList.push(index + match[0].length);
                if (limit > 0 && resultIndexList.length === limit) {
                    break;
                }
            }
        } else if (match = regExp.exec(str)) {
            let index = match.index;
            resultIndexList.push(index);
            resultLastIndexList.push(index + match[0].length);
        }
        return {
            index: resultIndexList,
            lastIndex: resultLastIndexList
        };
    };

    /**
     * Search the substrings in the source text by using Boyer-Moore-MagicLen algorithm.
     * See '[this page]{@link https://magiclen.org/boyer-moore-magiclen/}' for more details.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream|RegExp)!} pattern The pattern you want to search.
     * @param {Number?} [offset = 0] The number of characters you want to skip
     * @param {Number?} [limit = 0] The max number of substrings you want to search.
     * @returns {Array.<Number>} Return an array of searched indices.
     */
    this.indexOf = function (pattern, offset = 0, limit = 0) {
        if (pattern instanceof RegExp) {
            return this.indexOfRegExp(pattern, offset, limit).index;
        }
        var patternBuffer = getBufferFromOutside(pattern);
        if (patternBuffer === undefined) {
            return [];
        }
        var sourceLength = length;
        var patternLength = patternBuffer.length;
        offset = getRealIndex(offset);
        if (patternLength === 0 || offset < 0 || sourceLength - offset < patternLength) {
            return [];
        }
        var sourceLength_dec = sourceLength - 1;
        var patternLength_dec = patternLength - 1;
        var resultList = [];
        var badCharShiftMap = new Array(256).fill(patternLength);
        for (let i = 0; i < patternLength_dec; ++i) {
            let index = patternBuffer[i];
            badCharShiftMap[index] = patternLength_dec - i;
        }
        var specialChar = patternBuffer[patternLength_dec];
        var specialShift = badCharShiftMap[specialChar];
        badCharShiftMap[specialChar] = 0;
        var sourcePointer = offset + patternLength_dec;
        var patternPointer;
        while (sourcePointer < sourceLength) {
            patternPointer = patternLength_dec;
            while (patternPointer >= 0) {
                if (buffer[sourcePointer] !== patternBuffer[patternPointer]) {
                    break;
                }
                --sourcePointer;
                --patternPointer;
            }
            let starePointer = sourcePointer;
            let goodSuffixLength_inc = patternLength - patternPointer;
            sourcePointer += goodSuffixLength_inc;
            if (patternPointer < 0) {
                resultList.push((starePointer + 1) / 2);
                if (sourcePointer > sourceLength_dec || limit > 0 && resultList.length === limit) {
                    break;
                } else {
                    sourcePointer += badCharShiftMap[buffer[sourcePointer]];
                    continue;
                }
            }
            let shift1 = (sourcePointer <= sourceLength_dec) ? badCharShiftMap[buffer[sourcePointer]] : 0;
            if (shift1 >= patternLength_dec) {
                sourcePointer += shift1;
            } else {
                let c = buffer[starePointer];
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
        var patternBuffer = getBufferFromOutside(pattern);
        if (patternBuffer === undefined) {
            return [];
        }
        var sourceLength = length;
        var patternLength = patternBuffer.length;
        offset = getRealIndex(offset);
        if (patternLength === 0 || offset < 0 || sourceLength - offset < patternLength) {
            return [];
        }
        var sourceLength_dec = sourceLength - 1;
        var patternLength_dec = patternLength - 1;
        var resultList = [];
        var badCharShiftMap = new Array(256).fill(patternLength);
        for (let i = patternLength_dec; i > 0; --i) {
            let index = patternBuffer[i];
            badCharShiftMap[index] = i;
        }
        var specialChar = patternBuffer[patternLength_dec];
        var specialShift = badCharShiftMap[specialChar];
        badCharShiftMap[specialChar] = 0;
        var sourcePointer = sourceLength_dec - patternLength_dec;
        var patternPointer;
        while (sourcePointer >= offset) {
            patternPointer = 0;
            while (patternPointer < patternLength) {
                if (buffer[sourcePointer] !== patternBuffer[patternPointer]) {
                    break;
                }
                ++sourcePointer;
                ++patternPointer;
            }
            let starePointer = sourcePointer;
            let goodSuffixLength_inc = patternPointer + 1;
            sourcePointer -= goodSuffixLength_inc;
            if (patternPointer >= patternLength) {
                resultList.push((sourcePointer + 1) / 2);
                if (sourcePointer < 0 || limit > 0 && resultList.length === limit) {
                    break;
                } else {
                    sourcePointer -= badCharShiftMap[buffer[sourcePointer]];
                    continue;
                }
            }
            let shift1 = (sourcePointer >= 0) ? badCharShiftMap[buffer[sourcePointer]] : 0;
            if (shift1 >= patternLength_dec) {
                sourcePointer -= shift1;
            } else {
                let c = buffer[starePointer];
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
        var patternBuffer = getBufferFromOutside(pattern);
        if (patternBuffer === undefined) {
            return false;
        }
        let patternBufferLength = patternBuffer.length;
        if (patternBufferLength > length) {
            return false;
        }
        for (let i = 0; i < patternBufferLength; ++i) {
            if (patternBuffer[i] !== buffer[i]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Check the StringBuilder whether it ends with a specific pattern.
     * <br/>
     * <b>#Sync</b>
     * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)!} pattern The pattern you want to search.
     * @returns {Boolean}
     */
    this.endsWith = function (pattern) {
        var patternBuffer = getBufferFromOutside(pattern);
        if (patternBuffer === undefined) {
            return false;
        }
        let offset = length - patternBuffer.length;
        if (offset < 0) {
            return false;
        }
        return buffer.includes(patternBuffer, offset);
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
        return buffer.includes(dataBuffer);
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

    // TODO -----Initializer-----
    if (arguments.length > 2) {
        [length, capacity, buffer] = arguments;
    } else {
        let contentBuffer = getBufferFromOutside(content);
        if (contentBuffer === undefined) {
            return this;
        }
        length = contentBuffer.length;
        let capacityLength = Math.max(initialCapacity * 2, length);
        let count = Math.ceil(capacityLength / blockSize);
        if (count === 0) {
            count = 1;
        }
        capacity = count * blockSize;
        buffer = Buffer.allocUnsafe(capacity);
        contentBuffer.copy(buffer, 0);
    }
};

StringBuilder.prototype.inspect = function () {
    return this.toString();
};

/**
 * Build strings in memory.
 * @param {(String|Buffer|Number|Boolean|StringBuilder|ReadStream)?} [content = ''] The text you want to initialize.
 * @param {Number?} [initialCapacity = 128] The initial capacity.
 * @returns {StringBuilder}
 */
StringBuilder.from = function (content, initialCapacity = blockSize / 2) {
    return new StringBuilder(content, initialCapacity);
};

module.exports = StringBuilder;
