var EventEmitter = require('events').EventEmitter
var util = require('util')
var Node = require('./node')
var liveStream = require('level-live-stream');

function Lem(db, options){
	EventEmitter.call(this)

	if(!db){
		throw new Error('db required')
	}

	options = options || {}
	options.sep = options.sep || '\xff'

	this._db = db
	this._options = options

	this._livestream = liveStream(this._db);

	this._livestram.on('data', this.livedata.bind(this));
}

util.inherits(Lem, EventEmitter)

module.exports = Lem

Lem.prototype.livedata = function(data){
	console.log('-------------------------------------------');
	console.dir(data);
}

Lem.prototype.save = function(path, value, done){
	this._db.put(path, value.toString(), done);
}

Lem.prototype.node = function(path){
	var node = new Node(db, this._optionsthis._path(path));
}

Lem.prototype.key = function(path){
	return (path || '').replace(/\./g, '\xff');
}