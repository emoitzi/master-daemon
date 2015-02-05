"use strict";
/**
 * Created by emoitzi on 2/3/15.
 */
var cluster = require('cluster');
var fs      = require('fs');


fs.writeFileSync('master.log', 'Started master process\n');



if (typeof process.send === 'function') {
  process.on('message', function (options) {
    fs.appendFileSync('master.log', 'master.js: ' + options.file + '\n');

    //no feedback requested, so we can detach from our parent
    //process here.
    if (!options.report_success) {
      process.disconnect();
    }
    createCluster(options);

  });
}
else {
  fs.appendFileSync('master.log', 'Not a child process with ipc\n');
  throw new Error('Not started as child process.');
}



function forkChild(options) {
  fs.appendFileSync('master.log', 'forkChild\n');
  var child = cluster.fork();

  if (options.report_success === true) {
    child.on('message', function (message) {
      
      process.send(message);
      //die here
      if (message.error) {
        process.disconnect();
        child.kill();
      }
      else {
        //success,  detach from own parent
        process.disconnect();         
      }
      
    });
  }
  
  child.send({message: options.message});
}



function createCluster(options) {
  fs.appendFileSync('master.log', 'createCluster\n');
  var file = options.file;
  cluster.setupMaster({
    exec: file
  });

  if (options.restart === true) {
    cluster.on('exit', function () {
      forkChild(options);
    });
  }


  for (var i = 0; i < options.instances; i++) {
    forkChild(options);

  }


}