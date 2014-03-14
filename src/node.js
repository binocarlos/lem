var EventEmitter = require('events').EventEmitter
var util = require('util')

function Node(path){
	EventEmitter.call(this)

	if(!db){
		throw new Error('db required')
	}

	options = options || {}
	options.sep = options.sep || '\xff'

	this._db = db
	this._options = options
}

util.inherits(Node, EventEmitter)

module.exports = Node

Node.prototype.record = function(value, timestamp){
	
}