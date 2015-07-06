var inquirer = require("inquirer"),
    readline = require('readline'),
    fs = require('fs'),
    global = require('../lib/global'),
    color = require('../lib/colors'),
    fn = global.fn,
    pg = global.pg;


var sv = {
    start: function(){
        fn.runCMD('node app', function(){}, pg.serverPath);
    },
    open: function(){
        var cmdStr;
        if(pg.isWindows){
            cmdStr = 'explorer .';
            
        } else {
            cmdStr = 'open .';
            
        }
        fn.runCMD( cmdStr, function(){
            console.log(color.green('[PATH] ' + pg.serverPath));
        }, pg.serverPath);

    },
    path: function(){
        console.log(color.green('[PATH] ' + pg.serverPath));
    },
    clear: function(){
        fn.removePathFiles(pg.serverPath, function(){
            
        });
    }
};

module.exports = function(type){
    switch(type){
        case 'start':
            sv.start();
            break;

        case 'open':
            sv.open();
            break;

        case 'clear':
            sv.clear();
            break;

        case '-h':
        case '-help':
        default:
            sv.help();
            break;

    }
};
