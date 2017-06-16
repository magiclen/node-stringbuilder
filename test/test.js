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
});

describe('#insert', function() {
    it('should insert text', function() {
    	var sb = new StringBuilder(', Second');
    	sb.insert('First').append(', Third');
        var result = sb.toString();
        expect(result).to.equal('First, Second, Third');
    });
});
