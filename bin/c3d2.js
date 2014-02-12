#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var version = require('../package.json').version;
var C3D2 = require('../src');
var async = require('async');
var prompt = require('cli-prompt');
var path = require('path');
var fs = require('fs');

program
  .option('-d, --dir <string>', 'where to create the android app', '.')
  .option('-a, --assets <string>', 'where to copy the HTML5 app from')
  .option('-n, --name <string>', 'the folder name of the app')
  .option('-t, --title <string>', 'the title of the app')
  .option('-p, --package <string>', 'the package name of the app')
  .version(version)



program
  .command('create [dir]')
  .description('convert the big images to small ones')
  .action(function(dir){

    function get_setting(name, eg, done){
      var value = program[name];

      if(value){
        done(null, value);
      }
      else{
        prompt(name + ' (e.g. ' + eg + '): ', function (val) {
          done(null, val);
        })
      }
    }

    function get_dir(st){
      if(st.indexOf('/')!=0){
        st = process.cwd() + '/' + st;
      }
      st = path.normalize(st);
      return st;
    }

    async.series({
      dir:function(next){
        dir = get_dir(dir || program.dir);
        next(null, dir);
      },
      assets:function(next){
        if(program.assets){
          next(null, get_dir(program.assets));
        }
        else{
          next();
        }
      },
      name:function(next){
        get_setting('name', 'MyApp', next);
      },
      title:function(next){
        get_setting('title', 'My App', next);
      },
      package:function(next){
        get_setting('package', 'com.me.myapp', next);
      }
    }, function(error, settings){

      var maker = new C3D2(settings);

      function finish(){
        console.log('-------------------------------------------');
        console.log('android application built: ');  
        console.log(settings.dir);
      }

      function inject_assets(done){
        maker.inject_assets(settings.assets, done);
      }

      maker.create(function(){
        if(settings.assets){
          inject_assets(finish);
        }
        else{
          finish();
        }
      })
      
    })
  })

program
  .command('*')
  .action(function(command){
    console.log('command: "%s" not found', command);
  })

program.parse(process.argv);