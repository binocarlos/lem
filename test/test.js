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
    wrench.rmdirSyncRecursive(__dirname + './tempdb', true);
    levelup(__dirname + './tempdb', {}, function(error, ldb){
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

    var lem = Lem();
  
    it('should convert dots to level keys', function(){
      var key = lem.key('address.house');
      key.should.equal(address + '\xff' + house);
    })

  })

  describe('meta data', function(){

    it('should save meta fields', function(done){
      var lem = Lem(db);

      async.series([
        function(next){
          lem.meta('2.3.5', next);
        },
        function(next){
          lem.meta(function(err, meta){
            if(err) throw err
            meta.should.equal('2.3.5');
            next();
          });
        }
      ], done)

    })

  })

  describe('node index', function(){
    var lem = Lem(db);

    it('should list all the nodes', function(done){

      async.series([
        function(next){
          lem.node('cars.red5', 'red5', next);
        },

        function(next){
          lem.node('cars.red6', next);
        },

        function(next){
          lem.node('cars.red7', 'red7', next);
        },

        function(next){
          var nodes = {};
          lem.index().pipe(through(function(id){
            cars[id] = true;
          }, function(){
            nodes['cars.red5'].should.equal(true);
            nodes['cars.red6'].should.equal(true);
            nodes['cars.red7'].should.equal(true);
            Object.keys(nodes).length.should.equal(3);
            done();
          })
        }
      ]
      
    })

  })

  describe('node', function(){

    var lem = Lem(db);

    it('should have the right key', function(done){
      
      var node = lem.node('cars.red5');
      node.key().should.equal(cars + '\xff' + red5);
      
    })

    it('should auto create with meta data', function(done){
      
      lem.node('cars.red5', 'red5', function(err, node){
        if(err) throw err

        node.meta(function(err, meta){
          if(err) throw err
          meta.should.equal('red5');
          done();
        })

      });

    })

    it('should save meta data', function(done){
      
      var node = lem.node('cars.red5');
        
      node.meta('hello red5', function(err){
        if(err) throw err

        node.meta(function(err, meta){
          if(err) throw err
          meta.should.equal('hello red5');
          done();
        })
      })

    })

  })

  describe('session', function(done){

    var lem = Lem(db);

    it('should save with meta data', function(done){
      
      var node = lem.node('cars.red5');
      var session = node.session('10/3/2014 morning3');

      session.meta('wet', function(err){
        if(err) throw err
        session.meta(function(err, meta){
          meta.should.equal('wet');
          done();
        })
      })

    })

    it('should auto create with meta data', function(done){
      
      var node = lem.node('cars.red5');
      node.session('10/3/2014 morning3', 'wet', function(err, session){
        session.meta(function(err, meta){
          meta.should.equal('wet');
          done();
        })
      })

    })

    it('should start and stop', function(done){
      
      var node = lem.node('cars.red5');
      var session = node.session('10/03/2014 morning3');

      session.start(function(err){
        if(err) throw err;

        setTimeout(function(){
          session.stop(function(err){
            if(err) throw err;
            session.timings(function(err, timings){
              if(err) throw err;
              var gap = (timings.end - timings.start);
              gap.should.equal(200);
              done();
            })
          })
        }, 200)

      })

    })


    it('should list all the session', function(done){

      var node = lem.node('cars.red5');

      async.series([
        function(next){
          node.session('10/03/2014 morning1', '1', next);
        },

        function(next){
          node.session('10/03/2014 morning2', '2', next);
        },

        function(next){
          node.session('10/03/2014 morning3', '3', next);
        },

        function(next){
          var sessions = {};
          node.sessions().pipe(through(function(session){
            sessions[session.id] = session;
          }, function(){
            nodes['10/03/2014 morning1'].meta.should.equal('1');
            nodes['10/03/2014 morning2'].meta.should.equal('2');
            nodes['10/03/2014 morning3'].meta.should.equal('3');
            Object.keys(nodes).length.should.equal(3);
            done();
          })
        }
      ]
      
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


