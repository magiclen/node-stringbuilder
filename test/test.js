'use strict';

const expect = require('chai').expect;

const StringBuilder = require('../index');

describe('#append', function() {
    it('should append text', function() {
    	var sb = new StringBuilder('First');
    	sb.append(', Second').append(', Third');
        var result = sb.toString();
        expect(result).to.equal('First, Second, Third');
    });

    it('should append text', function() {
    	var sb = new StringBuilder('');
    	sb.append('First').append(', Second').append(', Third');
        var result = sb.toString();
        expect(result).to.equal('First, Second, Third');
    });

    it('should append text and line, and finally trim the whitespace', function() {
    	var sb = new StringBuilder('');
    	sb.appendLine('First').appendLine('Second').appendLine('Third');
        var result = sb.trim().toString();
        expect(result).to.equal('First\nSecond\nThird');
    });

    it('should append text repeatedly, finally delete the last two characters', function() {
    	var sb = new StringBuilder('');
    	sb.appendRepeat('Three, ', 3).delete(-2);
        var result = sb.trim().toString();
        expect(result).to.equal('Three, Three, Three');
    });
});

describe('#insert', function() {
    it('should insert text at head', function() {
    	var sb = new StringBuilder(', Second');
    	sb.insert('First').append(', Third');
        var result = sb.toString();
        expect(result).to.equal('First, Second, Third');
    });

    it('should insert text at middle', function() {
    	var sb = new StringBuilder('First');
    	sb.append(', Third').insert(5, ', Second');
        var result = sb.toString();
        expect(result).to.equal('First, Second, Third');
    });

    it('should insert text at end', function() {
    	var sb = new StringBuilder('First');
    	sb.insert(sb.length(), ', Second').insert(sb.length() , ', Third');
        var result = sb.toString();
        expect(result).to.equal('First, Second, Third');
    });
});
