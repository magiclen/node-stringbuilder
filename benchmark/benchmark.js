'use strict';

const expect = require('chai').expect;
const mlog = require('mocha-logger');

const StringBuilder = require('../index');

describe('Append', function() {
    var a = 'The first string.'
    var b = 'The second string.'
    var c = 'The third string.'
    var startTime, endTime;

    it('natively append text 1000000 times', function() {
        var s = '';
        startTime = Date.now();
        var t = a + b + c;
        for(let i = 0; i < 1000000; ++i){
            s += t;
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to append text 1000000 times', function() {
        var sb = new StringBuilder('', 52000000);
        startTime = Date.now();
        var sbT = new StringBuilder(a);
        sbT.append(b).append(c);
        for(let i = 0; i < 1000000; ++i){
            sb.append(sbT);
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to append text 1000000 times repeatly', function() {
        var sb = new StringBuilder('', 52000000);
        startTime = Date.now();
        sb.append(a).append(b).append(c).appendRepeat(sb, 999999);
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });
});

describe('Insert', function() {
    var a = 'This is a simple example demonstrating how to use this module.';
    var b = '12345';
    var startTime, endTime;

    it('natively insert text 10000 times', function() {
        var s;
        var insert = function(index, str1, str2){
            return str1.slice(0, index) + str2 + str1.slice(index);
        };
        startTime = Date.now();
        s = a;
        for(let i = 1; i < 10000; ++i){
            s = insert(s.length / 2, s, b);
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to insert text 10000 times', function() {
        var sb = new StringBuilder('', 50176);
        startTime = Date.now();
        var sbB = new StringBuilder(b);
        sb.append(a);
        for(let i = 1; i < 10000; ++i){
            sb.insert(sb.length() / 2, sbB);
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });
});

describe('Delete', function() {
    var a = '';
    for(let i = 0; i < 10000; ++i){
        a += 'This is a simple example demonstrating how to use this module.';
    }
    var startTime, endTime;

    it('natively delete text 5000 times', function() {
        var s = a;
        var deleteT = function(start, end, str){
            return str.slice(0, start) + str.slice(end);
        };
        startTime = Date.now();
        for(let i = 0; i < 5000; ++i){
            let l = s.length / 2;
            s = deleteT(l, l + 10, s);
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to delete text 5000 times', function() {
        var sb = new StringBuilder(a);
        startTime = Date.now();
        for(let i = 0; i < 5000; ++i){
            let l = sb.length() / 2;
            sb.delete(l, l + 10);
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });
});

describe('Replace', function() {
    var a = '';
    for(let i = 0; i < 10000; ++i){
        a += 'This is a simple example demonstrating how to use this module.';
    }
    var b = 'hello, this is a long text';
    var c = 'short txt';
    var startTime, endTime;

    it('natively replace text 5000 times', function() {
        var s = a;
        var replace = function(start, end, str1, str2){
            return str1.slice(0, start) + str2 + str1.slice(end);
        };
        startTime = Date.now();
        for(let i = 0; i < 5000; ++i){
            let l = s.length / 2;
            s = replace(l, l + 10, s, (i % 2 === 0) ? b : c);
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to replace text 5000 times', function() {
        var sb = new StringBuilder(a, 657536);
        startTime = Date.now();
        var sbB = new StringBuilder(b);
        var sbC = new StringBuilder(c);
        for(let i = 0; i < 5000; ++i){
            let l = sb.length() / 2;
            sb.replace(l, l + 10, (i % 2 === 0) ? sbB : sbC);
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
    var startTime, endTime;

    it('natively replace text by using a RegExp pattern', function() {
        var s = a;
        startTime = Date.now();
        s = s.replace(/This/g, 'this');
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to replace text by using a pattern', function() {
        var sb = new StringBuilder(a);
        startTime = Date.now();
        sb.replaceAll('This', 'this');
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

    it('natively check the equal 50000 times', function() {
        var s = a + b + c;
        startTime = Date.now();
        let sum = 0;
        for(let i = 0; i < 50000; ++i){
            let p;
            switch(i % 4){
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
            if(s === p){
                ++sum;
            }
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to check the equal 50000 times', function() {
        var s = a + b + c;
        var sb = new StringBuilder(s);
        startTime = Date.now();
        var sbA = new StringBuilder(a);
        var sbB = new StringBuilder(b);
        var sbC = new StringBuilder(c);
        var sbD = new StringBuilder(d);
        let sum = 0;
        for(let i = 0; i < 50000; ++i){
            let p;
            switch(i % 4){
               case 0:
                  p = sbA;
                  break;
               case 1:
                  p = sbB;
                  break;
               case 2:
                  p = sbC;
                  break;
               case 3:
                  p = sbD;
                  break;
            }
            if(sb.equals(p)){
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

    it('natively check the equal 50000 times', function() {
        var s = a + b + c;
        startTime = Date.now();
        let sum = 0;
        for(let i = 0; i < 50000; ++i){
            let p;
            switch(i % 4){
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
            if(s.toLowerCase() === p.toLowerCase()){
                ++sum;
            }
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to check the equal 50000 times', function() {
        var s = a + b + c;
        var sb = new StringBuilder(s);
        startTime = Date.now();
        var sbA = new StringBuilder(a);
        var sbB = new StringBuilder(b);
        var sbC = new StringBuilder(c);
        var sbD = new StringBuilder(d);
        let sum = 0;
        for(let i = 0; i < 50000; ++i){
            let p;
            switch(i % 4){
               case 0:
                  p = sbA;
                  break;
               case 1:
                  p = sbB;
                  break;
               case 2:
                  p = sbC;
                  break;
               case 3:
                  p = sbD;
                  break;
            }
            if(sb.equalsIgnoreCase(p)){
                ++sum;
            }
        }
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });
});

describe('IndexOf', function() {
    var a = '';
    for(let i = 0; i < 100000; ++i){
        a += 'HERE IS A SIMPLE EXAMPLE, WHICH CONTAINS MULTIPLE EXAMPLES. SIXLEE IS A WRONG WORD. EXAMPLEEXAMPLE';
    }
    var p = 'EXAMPLE';
    var startTime, endTime;

    it('natively search text', function() {
        var s = a;
        startTime = Date.now();
        var sum = 0;
        var index;
        var offset = 0;
        var indexArray = [];
        while(true){
            index = s.indexOf(p, offset);
            if(index < 0){
                break;
            }
            indexArray.push(index);
            offset = index + 1;
        }
        var sum = indexArray.length;
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to search text', function() {
        var sb = new StringBuilder(a);
        startTime = Date.now();
        var indexArray = sb.indexOf(p);
        var sum = indexArray.length;
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });
});

describe('Reverse', function() {
    var a = '';
    for(let i = 0; i < 1000; ++i){
        a += 'HERE IS A SIMPLE EXAMPLE, WHICH CONTAINS MULTIPLE EXAMPLES. SIXLEE IS A WRONG WORD. EXAMPLEEXAMPLE';
    }
    var p = 'EXAMPLE';
    var startTime, endTime;

    it('natively reverse text', function() {
        var s = a;
        startTime = Date.now();
        var reverse = s.split('').reverse().join('');
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });

    it('Using StringBuilder to reverse text', function() {
        var sb = new StringBuilder(a);
        startTime = Date.now();
        var reverse = sb.reverse();
        endTime = Date.now();
        mlog.log(endTime - startTime, 'milliseconds');
    });
});
