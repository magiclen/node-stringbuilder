const Buffer2 = require('buffer');
const stringBuilder = require('bindings')('node-stringbuilder');
const StringBuilder = stringBuilder.StringBuilder;
const fs = require('fs');

function readFileStream(source) {
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
  return content;
}

function indexOfRegExp(regExp, str, offset, limit = 0) {
  if (!(regExp instanceof RegExp)) {
    regExp = new RegExp(regExp.toString());
  }
  var match;
  var resultIndexList = [];
  var resultLastIndexList = [];
  if (regExp.global) {
    while (match = regExp.exec(str)) {
      let index = match.index + offset;
      resultIndexList.push(index);
      resultLastIndexList.push(index + match[0].length);
      if (limit > 0 && resultIndexList.length === limit) {
        break;
      }
    }
  } else if (match = regExp.exec(str)) {
    let index = match.index + offset;
    resultIndexList.push(index);
    resultLastIndexList.push(index + match[0].length);
  }
  return {
    index: resultIndexList,
    lastIndex: resultLastIndexList
  };
}

stringBuilder._initialize(fs.ReadStream, readFileStream, indexOfRegExp);

/**
 * Append data from ReadStream into this StringBuilder.
 * <br/>
 * <b>#Async</b>
 * @param {ReadStream!} readStream The read stream you want to append.
 * @returns {Promise<StringBuilder>}
 */
StringBuilder.prototype.appendReadStream = async function(readStream) {
  readStream.setEncoding('utf8');
  var promise = new Promise(function(resolve, reject) {
    readStream.on('error', function(err) {
      reject(err);
    });
    readStream.on('data', function(text) {
      self.append(text);
    });
    readStream.on('close', function() {
      resolve();
    });
  });
  await promise.then();
  return this;
};

module.exports = StringBuilder;
