var lem = require('../src/index');

describe('lem', function(){

  it('should return the api as a collection of functions', function(){
    lem.should.be.type('object');
    lem.server.should.be.type('function');
    lem.client.should.be.type('function');
  })
	
})


