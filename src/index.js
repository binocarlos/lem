var EventEmitter = require('events').EventEmitter
var util = require('util')
var liveStream = require('level-live-stream');
var through = require('through');
var tools = require('./tools');

function Lem(db, options){
	var self = this

	EventEmitter.call(this)

	if(!db){
		throw new Error('db required')
	}

	options = options || {}

	this._db = db
	this._options = options

	this._livestream = liveStream(this._db);
	this._livestream.on('data', function(data){
		self.emit('data', data);
	})
	this.tools = tools;
}

util.inherits(Lem, EventEmitter)

module.exports = Lem;

Lem.prototype.index = function(key, meta, done){
	if(arguments.length<=2){
		done = meta;
		meta = null;
	}

	this._db.put(tools.parsedots('keys.' + key), meta || '', done);
}

Lem.prototype.remove = function(key, done){
	// tbc
	throw new Error('not done yet')
}

Lem.prototype.recorder = function(path){
	var self = this;
	path = tools.parsedots('values.' + (path || ''));
	return function(value, timestamp, done){
		if(arguments.length<=2){
			done = timestamp;
			timestamp = new Date().getTime();
		}
		var valpath = path + '~' + timestamp;
		self._db.put(valpath, value.toString(), done);
	}
}

Lem.prototype.valuestream = function(path, query){
	query = query || {};
	var dotpath = 'values.' + (path || '');
	var range = tools.querykeys(dotpath, query.start, query.end);

	return this._db.createReadStream(range)
	.pipe(through(function(data){
		
		var parts = data.key.toString().split('~');

		data.key = parseInt(parts[parts.length-1]);
		data.value = parseFloat(data.value.toString());
		
		this.queue(data);
	}))
}

Lem.prototype.keys = function(path){
	var self = this;
	var dotpath = 'keys.' + (path || '');
	var range = tools.querykeys(dotpath);
	return this._db.createReadStream(range)
	.pipe(through(function(data){
		data.key = tools.getdots(data.key.toString()).substr(dotpath.length+1);
		data.value = data.value.toString();
		if(data.value.charAt(0)=='{'){
			data.value = JSON.parse(data.value);
		}
		this.queue(data);
	}))
}

