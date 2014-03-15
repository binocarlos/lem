var EventEmitter = require('events').EventEmitter
var util = require('util')
var Node = require('./node')
var liveStream = require('level-live-stream');
var through = require('through');

function Lem(db, options){
	EventEmitter.call(this)

	if(!db){
		throw new Error('db required')
	}

	options = options || {}
	options.sep = options.sep || '\xff'

	var self = this

	this._db = db
	this._options = options

	this._livestream = liveStream(this._db);
	this._livestream.on('data', function(data){
		self.emit('data', data);
	})
}

util.inherits(Lem, EventEmitter)

module.exports = Lem;


Lem.prototype.removeNode = function(key, done){
	// tbc
	throw new Error('not done yet')
}

Lem.prototype.record = function(path, value, done){
	this._db.put(path, value.toString(), done);
}

Lem.prototype.recorder = function(path){
	var self = this;
	return function(value, done){
		self.record(path, value, done);
	}
}

Lem.prototype.values = function(path, time_window){
	path = 'data.' + path;
	var start = path;
	var end = path;
	if(time_window && time_window.from){
		start += '.' + time_window.from;
	}
	if(time_window && time_window.to){
		end += '.' + time_window.to;
	}
	if(!time_window){
		end += '\xff';
	}
	console.log('-------------------------------------------');
	console.dir(start);
	return this._db.createReadStream({
		/*
		keyEncoding:'ascii',
		start:start,
		end:end
		*/
	})
}

Lem.prototype.index = function(path){
	var self = this;
	path = path || '';
	path = 'nodes' + (path ? '.' + path  : '');
	return this._db.createReadStream({
		keyEncoding:'ascii',
		start:path,
		end:path + '\xff'
	}).pipe(through(function(data){
		console.log(data.key.toString());
		data.key = data.key.toString().substr(path.length+1);
		data.value = data.value.toString();
		if(data.value.charAt(0)=='{'){
			data.value = JSON.parse(data.value);
		}
		this.queue(data);
	}))
}

Lem.prototype.indexNode = function(key, meta, done){
	if(arguments.length<=2){
		done = meta;
		meta = null;
	}

	if(typeof(meta)!='string'){
		meta = JSON.stringify(meta);
	}

	this._db.put('nodes.' + key, meta || '', done);
}
