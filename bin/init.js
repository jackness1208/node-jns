#!/usr/bin/env node
var myArgv = process.argv.splice(2);

switch(myArgv[0]){
    case 'grunt':
        require(__dirname.replace("\\","/") + '/../task/w-grunt.js').apply(global, myArgv.slice(1));
        break;
    
    case 'test':
        require(__dirname.replace("\\","/") + '/../task/w-test.js').apply(global, myArgv.slice(1));
        break;

    case 'mod':
        require(__dirname.replace("\\","/") + '/../task/w-mod.js').apply(global, myArgv.slice(1));
        break;
    
    case 'rename':
        require(__dirname.replace("\\","/") + '/../task/w-rename.js').apply(global, myArgv.slice(1));
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
