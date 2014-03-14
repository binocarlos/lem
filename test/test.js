var Lem = require('../src/index');
var level = require('level');
var hyperquest = require('hyperquest');
var concat = require('concat-stream');
var through = require('through');
var http = require('http');
var async = require('async');
var wrench = require('wrench');

describe('lem', function(){

  var db;

  before(function(done){
    this.timeout(1000);
    wrench.rmdirSyncRecursive('/tmp/lemtesttempdb', true);
    level('/tmp/lemtesttempdb', {}, function(err, ldb){
      if (err) throw err
      db = ldb
      done();
    });
  })

  describe('constructor', function(){
  
    it('should be a function', function(){
      Lem.should.be.type('function');
    })

    it('should throw if no leveldb or options', function(){
      (function(){
        var lem = Lem();  
      }).should.throw('db required');
    })

    it('should create a lem server which should be an event emitter', function(done){
      var lem = Lem(db);

      lem.on('apples', done);
      lem.emit('apples');
    })

  })

  describe('keys', function(){

    it('should convert dots to level keys', function(){
      var lem = Lem(db);
      var key = lem.key('address.house');
      key.should.equal(address + '\xff' + house);
    })

  })

  describe('index', function(){
    

    it('should list all the nodes', function(done){
      var lem = Lem(db);

      async.series([
        function(next){
          lem.save('cars.red5.speed', 10, next);
        },

        function(next){
          lem.save('cars.red5.height', 11, next);
        },

        function(next){
          lem.save('cars.red5.weight', 12, next);
        },

        function(next){
          var nodes = {};
          lem.index('cars.red5').pipe(through(function(data){
            var parts = data.split(':');
            var path = parts[0];
            var count = parts[1];
            nodes[path] = count;
          }, function(){
            nodes['speed'].should.equal(1);
            nodes['height'].should.equal(1);
            nodes['weight'].should.equal(1);
            Object.keys(nodes).length.should.equal(3);
            done();
          }))
        }
      ], done)
      
    })

  })

  describe('field', function(){

    

    it('should have the right key', function(done){
      var lem = Lem(db);
      
      var node = lem.field('cars.red5.speed');
      var field = node.field('speed');
      field.key().should.equal(cars + '\xff' + red5);
      
    })

  })


  describe('http server', function(){

    var server;
    var lem;

    before(function(done){
      this.timeout(1000);
      lem = Lem(db);
      server = http.createServer(lem.http());
      server.listen(8080, done)
    })

    it('should save serve the meta data', function(done){
      
      lem.meta('hello lem', function(err){
        if(err) throw err

        hyperquest('http://127.0.0.1:8080/v1/meta')
        .pipe(concat(function(meta){
          meta.should.equal('hello lem');
          done();
        }))
        
      })
    })

  })
	
})


