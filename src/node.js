var EventEmitter = require('events').EventEmitter
var util = require('util')

function Node(db, path){
	EventEmitter.call(this)

	if(!db){
		throw new Error('db required')
	}

	if(!path){
		throw new Error('path required')
	}

	this._db = db
	this._path = path
}

util.inherits(Node, EventEmitter)

module.exports = Node

Node.prototype.meta = function(value, timestamp){
	this._db.get()
}

Node.prototype.destroy = function(){
	this.removeAllListeners();
}