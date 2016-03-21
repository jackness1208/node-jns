#!/usr/bin/env node
"use strict";

var myArgv = process.argv.splice(2),
    domain = require('domain'),
    d = domain.create();

d.on('error', function(err){
    console.error('domain error catch\n', err.stack);
});

process.on('uncaughtException', function (err) {
    console.error('Uncaught exception:\n', err.stack);
});
process.on('exit', function(code){
    console.error('fuck the exit: ' + code);
});

d.run(function(){

switch(myArgv[0]){
    
    case 'server':
        require(__dirname.replace("\\","/") + '/../task/w-server.js').apply(global, myArgv.slice(1));
        break;
    
    case 'release':
        require(__dirname.replace("\\","/") + '/../task/w-release.js').apply(global, myArgv.slice(1));
        break;

    case 'init':
        require(__dirname.replace("\\","/") + '/../task/w-init.js').apply(global, myArgv.slice(1));
        break;

    case '-v': 
    case '--version': 
    case '-h':
    case '--help':
        require(__dirname.replace("\\","/") + '/../task/w-base.js').apply(global, myArgv);
        break;

    default:
        require(__dirname.replace("\\","/") + '/../task/w-base.js').apply(global, myArgv);
        break;
}


});
