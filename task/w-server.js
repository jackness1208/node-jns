var inquirer = require("inquirer"),
    readline = require('readline'),
    fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');


var sv = {
    start: function(){

        //..TODO
        // fn.timer.start();
        // fn.runCMD('npm install', function(r){
        //     if(r.status == 1){
        //         fn.runCMD('node app', function(){
        //             fn.timer.end();

        //         }, config.serverPath);
        //     }
        // }, config.serverPath);
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
        fn.timer.start();
        fn.removeFiles(config.serverPath, function(){
            fn.timer.end();
            fn.msg.line().success('clean is done');
        });
        
    },
    
    add: function(path){
        //..TODO
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
    var iArgv = Array.prototype.slice.call(arguments),
        op = {},
        i, len;

    iArgv.shift();

    switch(type){

        case 'start':
            for(i = 0, len = iArgv.length; i < len; i++){
                switch(iArgv[i]){
                    case '-l': 
                        op.live = true; 
                        break;

                    case '-p': 
                        op.path = iArgv[++i]; 
                        break;

                    case '-callback':
                        op.callback = iArgv[++i];
                        break;
                }

            }
            sv.start(op);
            break;

        case 'open':
            for(i = 0, len = iArgv.length; i < len; i++){
                switch(iArgv[i]){
                    case '-p': 
                        op.path = iArgv[++i]; 
                        break;

                    case '-callback':
                        op.callback = iArgv[++i];
                        break;
                }

            }
            sv.start(op);
            sv.open();
            break;

        case 'clear':
            sv.clear();
            break;

        case 'add':
            sv.add();
            break;

        case '-h':
        case '-help':
        default:
            sv.help();
            break;

    }
};
