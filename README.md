# master-daemon
A node.js module to start scripts as child processes of a daemonized master process using nodes cluster package


Usage
-----

If this process is not started as a child process, childDaemon will call its callback immediately
### In the child:
    var childDeamon = require('master-daemon').childDaemon;
    
    function codeToRun(error, message, callback) {
      if(error) {
        //currently always null 
      }
      
      //only required when startMaster() is called with a callback.
      if(/*child error*/) {
        callback(new Error('failed'));
      }
      else {
        callback(null, {some: 'message'});
      }
      
      
    }
    
    childDaemon(codeToRun);


This process running this script will exit when master is spawned or when a response from the child is received.
### In the master:
    var startMaster = require('master-daemon').startMaster;
    
    startMaster({
      file: 'child.js',
      instances: 1,        //number of instances to start, 1 if omitted
      retry: true          //restart instance after stop
      message: { }         //will be send to child
    },
    function (error, message) {    //optional callback. If present this process will
                                   //wait for a response from the child script.
    });