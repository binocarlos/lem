var lem = require('../src/index');
var level = require('level');
var hyperquest = require('hyperquest');
var concat = require('concat-stream');
var through = require('through');
var http = require('http');
var async = require('async');
var wrench = require('wrench');

describe('lem', function(){

  var leveldb;

  beforeEach(function(done){
    this.timeout(1000);
    wrench.rmdirSyncRecursive('/tmp/lemtesttempdb', true);
    level('/tmp/lemtesttempdb', {}, function(err, ldb){
      if (err) throw err
      leveldb = ldb
      done();
    });
  })

  afterEach(function(done){
    this.timeout(1000);
    leveldb.close(done);
  })

  describe('constructor', function(){
  
    it('should be a function', function(){
      lem.should.be.type('function');
    })

    it('should throw if no leveldb or options', function(){
      (function(){
        var lemdb = lem();
      }).should.throw('db required');
    })

    it('should create a lem server which should be an event emitter', function(done){
      var lemdb = lem(leveldb);

      lemdb.on('apples', done);
      lemdb.emit('apples');
    })

  })


  describe('keys', function(){
    

    it('should list all the nodes that have been indexed', function(done){
      var lemdb = lem(leveldb);



      async.series([
        function(next){
          lemdb.index('cars.red5.speed', 10, next);
        },

        function(next){
          lemdb.index('cars.red5.address.postcode', 'sw10', next);
        },

        function(next){
          lemdb.index('cars.red5.height', 11, next);
        },

        function(next){
          lemdb.index('cars.red5.weight', 12, next);
        },

        function(next){
          var nodes = {};
          lemdb.keys('cars.red5').pipe(through(function(data){
            nodes[data.key] = data.value;
          }, function(){
            nodes['speed'].should.equal('10');
            nodes['height'].should.equal('11');
            nodes['weight'].should.equal('12');
            nodes['address.postcode'].should.equal('sw10');
            Object.keys(nodes).length.should.equal(4);
            done();
          }))
        }
      ], done)
      
    })

  })

  describe('events', function(){
    

    it('should emit events as data is written', function(done){
      var lemdb = lem(leveldb);

      var hit = {};
      var index = {};

      lemdb.on('data', function(data){
        hit[data.key] = data;
      })

      lemdb.on('index', function(key, data){
        index[key] = data;
      })

      async.series([
        function(next){
          lemdb.index('cars.red5.speed', 10, next);
        },

        function(next){
          lemdb.index('cars.red5.address.postcode', 'sw10', next);
        },

        function(next){
          lemdb.index('cars.red5.height', 11, next);
        },

        function(next){
          lemdb.index('cars.red5.weight', 12, next);
        },

        function(next){
          hit['keys.cars.red5.speed'].value.should.equal(10);
          hit['keys.cars.red5.address.postcode'].value.should.equal('sw10');
          hit['keys.cars.red5.height'].value.should.equal(11);
          hit['keys.cars.red5.weight'].value.should.equal(12);
          index['cars.red5.speed'].should.equal(10);
          next();
        }
      ], done)
      
    })

  })

  describe('recorder', function(){

    this.timeout(5000);

    it('should save and load values', function(done){
      var lemdb = lem(leveldb);

      var recorder = lemdb.recorder('cars.red5.speed');

      var counter = 0;
      var total = 0;
      var midtotal = 0;

      var midtime = null;
      var endtime = null;

      function docheckrange(){
        var hitc = 0;
        var hitt = 0;
        lemdb.valuestream('cars.red5.speed', {          
          start:midtime,
          end:endtime
        }).pipe(through(function(data){
          hitc++;
          hitt += data.value;
        }, function(){
          hitc.should.equal(5);
          hitt.should.equal(midtotal);
          done();
        }))
      }

      function docheckall(){
        var hitc = 0;
        var hitt = 0;
        lemdb.valuestream('cars.red5.speed', {          

        }).pipe(through(function(data){
          hitc++;
          hitt += data.value;
        }, function(){
          hitc.should.equal(10);
          hitt.should.equal(total);
          docheckrange();
        }))
      }

      function dorecord(){
        if(counter>=10){
          endtime = new Date().getTime();
          docheckall();
          return;
        }
        var speed = 50 + Math.round(Math.random()*50);
        total += speed;
        counter++;
        if(counter==6){
          midtime = new Date().getTime();
        }
        if(counter>=6){
          midtotal += speed;
        }
        recorder(speed, function(){
          setTimeout(dorecord, 100);
        })

      }
      
      dorecord();
      
    })

  })

	
})


