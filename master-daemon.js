/**
 * Created by emoitzi on 2/3/15.
 */
"use strict";
var spawn   = require('child_process').spawn;
var fs      = require('fs');


/*
options
  .file         String      Filename of js file to start
  .message      Object      Will be send to child instances on start
  .instances    Number      Number of child instances to start. Default 1
  .retry        Boolean     If true childDeamon will be restarted on exit.   
 */

function startMaster(options, callback) {
    if (!options || !options.file) {
      throw new Error('ClusterMaster: file parameter required');
    }
    if (typeof options.instances !== 'number') {
      options.instances = 1;
    }
    options.cwd = process.cwd();

    var spawn_options = {
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        execPath: process.execPath,
        detached: true
    };

    var child = spawn(process.execPath, [__dirname + '/lib/master.js'], spawn_options);
    
    child.on('error', function (error) {
        if (typeof callback === 'function') {
            callback(error);
        }
        else {
            throw error;
        }
        
    });
    
    
    if (typeof callback === 'function') {
        options.report_success = true;
        child.on('message', function (message) {
            fs.writeFileSync('master.log', JSON.stringify(message) + '\n');
            var error;
            if (typeof message.error === 'string') {
                fs.appendFileSync('master.log', 'error is object');
                error = new Error(message.error);
            }
            child.unref();
            callback(error, message.message);
        });
        child.send(options);
    }
    else {
        child.send(options);
        child.unref();
        
    }

};

function childFeedback(error, message) {
    var feedback = {
        message: message
    }
    if (error instanceof Error) {
        fs.writeFileSync('child.log', 'Error instance\n');
        fs.appendFileSync('child.log', error);
        feedback.error = error.message;
    }
    
    process.send(feedback);
}


function childDaemon(callback) {
  if (typeof process.send === 'function') {
    process.on('message', function (message) {
      callback(null, message.message, childFeedback);
    });
  }
  else {
    callback(null, {}, function () {});
  }
}



exports.startMaster = startMaster;
exports.childDaemon  = childDaemon;