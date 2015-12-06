#!/usr/bin/env node
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
    
    case 'test':
        require(__dirname.replace("\\","/") + '/../task/w-test.js').apply(global, myArgv.slice(1));
        break;

    case 'mod':
        require(__dirname.replace("\\","/") + '/../task/w-mod.js').apply(global, myArgv.slice(1));
        break;
    
    case 'reptile':
        require(__dirname.replace("\\","/") + '/../task/w-reptile.js').apply(global, myArgv.slice(1));
        break;

    case 'rename':
        require(__dirname.replace("\\","/") + '/../task/w-rename.js').apply(global, myArgv.slice(1));
        break;
    
    case 'server':
        require(__dirname.replace("\\","/") + '/../task/w-server.js').apply(global, myArgv.slice(1));
        break;
    
    case 'release':
        require(__dirname.replace("\\","/") + '/../task/w-release.js').apply(global, myArgv.slice(1));
        break;

    case '-v': 
    case '--version': 
        require(__dirname.replace("\\","/") + '/../task/w-version.js').apply(global, myArgv.slice(1));
        break;

    case '-h':
    case '--help':
    default:
        require(__dirname.replace("\\","/") + '/../task/w-help.js').apply(global, myArgv.slice(1));
        break;
}


});
