'use strict';

const expect = require('chai').expect;
const mlog = require('mocha-logger');

const StringBuilder = require('../index');

describe('Append', function() {
  var a = 'The first string.'
  var b = 'The second string.'
  var c = 'The third string.'
  var startTime, endTime;

  it('Natively append text 1000000 times', function() {
    var s = '';
    startTime = Date.now();
    var t = a + b + c;
    for (let i = 0; i < 1000000; ++i) {
      s += t;
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to append text 1000000 times', function() {
    var sb = new StringBuilder('', 52000000);
    startTime = Date.now();
    for (let i = 0; i < 1000000; ++i) {
      sb.append(a).append(b).append(c);
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to insert text 1000000 times at the end', function() {
    var sb = new StringBuilder('', 52000000);
    startTime = Date.now();
    for (let i = 0; i < 1000000; ++i) {
      sb.insert(sb.length(), a).insert(sb.length(), b).insert(sb.length(), c);
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to append text 1000000 times repeatly', function() {
    var sb = new StringBuilder('', 52000000);
    startTime = Date.now();
    sb.append(a).append(b).append(c).appendRepeat(sb.toString(), 999999);
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });
});

describe('Insert', function() {
  var a = 'This is a simple example demonstrating how to use this module.';
  var b = '12345';
  var startTime, endTime;

  it('Natively insert text 10000 times', function() {
    var s;
    var insert = function(index, str1, str2) {
      return str1.slice(0, index) + str2 + str1.slice(index);
    };
    startTime = Date.now();
    s = a;
    for (let i = 1; i < 10000; ++i) {
      s = insert(s.length / 2, s, b);
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to insert text 10000 times', function() {
    var sb = new StringBuilder('', 50176);
    startTime = Date.now();
    sb.insert(a);
    for (let i = 1; i < 10000; ++i) {
      sb.insert(sb.length() / 2, b);
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });
});

describe('Delete', function() {
  var a = '';
  for (let i = 0; i < 10000; ++i) {
    a += 'This is a simple example demonstrating how to use this module.';
  }
  var startTime, endTime;

  it('Natively delete text 5000 times', function() {
    var s = a;
    var deleteT = function(start, end, str) {
      return str.slice(0, start) + str.slice(end);
    };
    startTime = Date.now();
    for (let i = 0; i < 5000; ++i) {
      let l = s.length / 2;
      s = deleteT(l, l + 10, s);
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to delete text 5000 times', function() {
    var sb = new StringBuilder(a);
    startTime = Date.now();
    for (let i = 0; i < 5000; ++i) {
      let l = sb.length() / 2;
      sb.delete(l, l + 10);
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });
});

describe('Replace', function() {
  var a = '';
  for (let i = 0; i < 10000; ++i) {
    a += 'This is a simple example demonstrating how to use this module.';
  }
  var b = 'hello, this is a long text';
  var c = 'short txt';
  var startTime, endTime;

  it('Natively replace text 5000 times', function() {
    var s = a;
    var replace = function(start, end, str1, str2) {
      return str1.slice(0, start) + str2 + str1.slice(end);
    };
    startTime = Date.now();
    for (let i = 0; i < 5000; ++i) {
      let l = s.length / 2;
      s = replace(l, l + 10, s, (i % 2 === 0) ? b : c);
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to replace text 5000 times', function() {
    var sb = new StringBuilder(a, 657536);
    startTime = Date.now();
    for (let i = 0; i < 5000; ++i) {
      let l = sb.length() / 2;
      sb.replace(l, l + 10, (i % 2 === 0) ? b : c);
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });
});

describe('Replace Pattern', function() {
    var a = '';
    for(let i = 0; i < 1000000; ++i){
        a += 'This text.';
    }
    var b = '';
    for(let i = 0; i < 1000000; ++i){
        b += 'This text.';
    }
    var startTime, endTime;

    it('Natively replace text with the same length by using a RegExp pattern', function() {
        var s = a;
        startTime = Date.now();
        s = s.replace(/This/g, 'this');
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Use StringBuilder to replace text with the same length by using a pattern', function() {
        var sb = new StringBuilder(a);
        startTime = Date.now();
        sb.replaceAll('This', 'this');
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Natively replace text by using a RegExp pattern', function() {
        var s = b;
        startTime = Date.now();
        s = s.replace(/This/g, 'The');
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Use StringBuilder to replace text by using a pattern', function() {
        var sb = new StringBuilder(b);
        startTime = Date.now();
        sb.replaceAll('This', 'The');
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });
});

describe('Equals', function() {
  var a = 'The first string.'
  var b = 'The second string.'
  var c = 'The third string.'
  var d = a + b + c;
  var startTime, endTime;

  it('Natively check the equal 50000 times', function() {
    var s = a + b + c;
    startTime = Date.now();
    let sum = 0;
    for (let i = 0; i < 50000; ++i) {
      let p;
      switch (i % 4) {
        case 0:
          p = a;
          break;
        case 1:
          p = b;
          break;
        case 2:
          p = c;
          break;
        case 3:
          p = d;
          break;
      }
      if (s === p) {
        ++sum;
      }
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to check the equal 50000 times', function() {
    var s = a + b + c;
    var sb = new StringBuilder(s);
    startTime = Date.now();
    let sum = 0;
    for (let i = 0; i < 50000; ++i) {
      let p;
      switch (i % 4) {
        case 0:
          p = a;
          break;
        case 1:
          p = b;
          break;
        case 2:
          p = c;
          break;
        case 3:
          p = d;
          break;
      }
      if (sb.equals(p)) {
        ++sum;
      }
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });
});

describe('EqualsIgnoreCase', function() {
  var a = 'The first string.'
  var b = 'The second string.'
  var c = 'The third string.'
  var d = a + b + c;
  d = d.toLowerCase();
  var startTime, endTime;

  it('Natively check the equal 50000 times', function() {
    var s = a + b + c;
    startTime = Date.now();
    let sum = 0;
    for (let i = 0; i < 50000; ++i) {
      let p;
      switch (i % 4) {
        case 0:
          p = a;
          break;
        case 1:
          p = b;
          break;
        case 2:
          p = c;
          break;
        case 3:
          p = d;
          break;
      }
      if (s.toLowerCase() === p.toLowerCase()) {
        ++sum;
      }
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to check the equal 50000 times', function() {
    var s = a + b + c;
    var sb = new StringBuilder(s);
    startTime = Date.now();
    let sum = 0;
    for (let i = 0; i < 50000; ++i) {
      let p;
      switch (i % 4) {
        case 0:
          p = a;
          break;
        case 1:
          p = b;
          break;
        case 2:
          p = c;
          break;
        case 3:
          p = d;
          break;
      }
      if (sb.equalsIgnoreCase(p)) {
        ++sum;
      }
    }
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });
});

describe('IndexOf', function() {
  var a = '';
  for (let i = 0; i < 1000000; ++i) {
    a += 'COO';
  }
  var p = 'OOCOO';
  var startTime, endTime;

  it('Natively search text', function() {
    var s = a;
    startTime = Date.now();
    var sum = 0;
    var index;
    var offset = 0;
    var indexArray = [];
    while (true) {
      index = s.indexOf(p, offset);
      if (index < 0) {
        break;
      }
      indexArray.push(index);
      offset = index + 1;
    }
    var sum = indexArray.length;
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });

  it('Use StringBuilder to search text', function() {
    var sb = new StringBuilder(a);
    startTime = Date.now();
    var indexArray = sb.indexOf(p, 0, 400000);
    var sum = indexArray.length;
    endTime = Date.now();
    mlog.log(endTime - startTime, 'milliseconds');
  });
});

describe('Reverse', function() {
    var a = '';
    for(let i = 0; i < 100000; ++i){
        a += 'HERE IS A SIMPLE EXAMPLE, WHICH CONTAINS MULTIPLE EXAMPLES. SIXLEE IS A WRONG WORD. EXAMPLEEXAMPLE';
    }
    var p = 'EXAMPLE';
    var startTime, endTime;

    it('Natively reverse text', function() {
        var s = a;
        startTime = Date.now();
        var reverse = s.split('').reverse().join('');
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Use StringBuilder to reverse text', function() {
        var sb = new StringBuilder(a);
        startTime = Date.now();
        var reverse = sb.reverse();
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });
});
