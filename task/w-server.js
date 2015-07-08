var inquirer = require("inquirer"),
    readline = require('readline'),
    fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');


var sv = {
    start: function(){
        fn.runCMD('node app', function(){}, config.serverPath);
    },
    open: function(){
        var cmdStr;
        if(config.isWindows){
            cmdStr = 'explorer .';
            
        } else {
            cmdStr = 'open .';
            
        }
        fn.runCMD( cmdStr, function(){
            console.log(color.green('[PATH] ' + config.serverPath));
        }, config.serverPath, false);

    },
    path: function(){
        console.log(color.green('[PATH] ' + config.serverPath));
    },
    clear: function(){
        fn.removePathFiles(config.serverPath, function(){
            fn.msg.line().success('clean is done');
        });
    },
    help: function(){
        fn.help({
            usage: 'jns server',
            commands: {
                'start': 'start the local server',
                'open': 'open the local server path',
                'path': 'show the local server path',
                'clear': 'clear the local server files'
            },
            options: {
                '-h, --help': 'output usage information'
            }
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
