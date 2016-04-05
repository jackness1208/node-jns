'use strict';
var 
    path = require('path'),
    fs = require('fs'),
    watch = require('node-watch'),
    fn = require('../lib/global'),
    config = require('../lib/config'),
    server = require('./w-server.js');
    


var 
    release = {
        
        optimize: function(callback){
            var 
                iDir = process.cwd(),
                isGrunt = fs.existsSync(path.join(iDir, 'Gruntfile.js')),
                isGulp = fs.existsSync(path.join(iDir, 'gulpfile.js')),
                isJns = fs.existsSync(path.join(iDir, 'jns-config.js'));
            if(isGrunt){
                fn.runCMD('grunt build', function(){
                    callback();

                }, process.cwd());

            } else if(isGulp){
                fn.runCMD('gulp build', function(){
                    callback();

                }, process.cwd());
                
            } else if(isJns){
                fn.msg.notice('sorry, jns-node >= 2.0.0 is not support the jns-config.js, please turn jns-node to 1.2.0');
                callback();

            } else {
                fn.msg.notice('not any optimize configfile');
                callback();
            }
            //TODO
        },
        
        init: function(op){///{
            op = op || {};
               
            new fn.Promise(function(next){ // optimize
                if(op.optimize){
                    release.optimize(function(){
                        next();
                    });
                } else {
                    next();
                }
                
                
            }).then(function(NEXT){ // base static server build
                if(op.create || op.live){
                    var myArgv = ['start'];

                    if(op.live){
                        myArgv.push('-l');
                    }

                    if(op.create){
                        myArgv.push('-p');
                        myArgv.push(config.projectPath);
                    }

                    myArgv.push('-callback');
                    myArgv.push(function(){
                        NEXT();
                    });

                    server.apply(server,myArgv);

                } else {
                    NEXT();
                }

            }).then(function(next){ // watch files
                if(op.watch){
                    
                    var fileArr = [],
                        watchTimeoutKey,
                        watchInterval = 1000,
                        isRunning = false,
                        watchHandle = function(){///{
                            new fn.Promise().then(function(next){
                                if(!fileArr.length || isRunning){
                                    return;
                                } else {
                                    isRunning = true;
                                    next();
                                }

                            }).then(function(next){ // optimize
                                if(op.optimize){
                                    release.optimize(function(){
                                        next();
                                    });
                                } else {
                                    next();
                                }

                            }).then(function(next){ // copy to local server
                                if(op.create && op.live && fileArr.length){

                                    server('add','-p', config.projectPath, '-callback', function(){
                                        fn.msg.line().success(fileArr.length + ' files copied ['+ fn.timer.getNow() +']');
                                        next();

                                    });

                                } else {
                                    next();
                                }

                            }).then(function(next){
                                fn.timer.end();
                                next();

                            }).then(function(next){
                                setTimeout(function(){
                                    fileArr = [];
                                    isRunning = false;
                                    next();
                                }, 500);

                            }).start();
                        };///}
                    
                    watchTimeoutKey = setInterval(watchHandle, watchInterval);
                    watch(config.projectPath, function(file){
                        if(!file.match(config.filterPath) && !~fileArr.indexOf(file)){
                            fileArr.push(file);
                        }

                    });
                    
                    fn.msg.notice('start to watch');
                }

                next();

            }).start();

        },

        help: function(){
            fn.help({
                usage: 'jns release',
                commands: {
                    '-l': [
                            'web socket server start', 
                            'or just start the local server'
                    ],
                    '-o': 'optimize project',
                    '-w': 'watch project',
                    '-d': 'output the project',
                    '-c': 'create locate server',
                    '-g': 'run grunt task'
                },
                options: {
                    '-h, --help': 'output usage information'
                }
            });
            
        }
    };///}

module.exports = function() {
    var opt = {
            live: false,
            watch: false,
            dest: undefined,
            optimize: false,
            create: false
        },
        runInit,
        runGruntInit,
        runHelp;

    if(!arguments.length){
        runHelp = true;
    }

    for(var i = 0, myArgv, len = arguments.length; i < len; i++){
        myArgv = arguments[i];
        if(/^-[cowlp]+$/.test(myArgv)){
            if(~myArgv.indexOf('o')){
                opt.optimize = true;
            }
            if(~myArgv.indexOf('l')){
                opt.live = true;
            }
            if(~myArgv.indexOf('w')){
                opt.watch = true;
            }
            if(~myArgv.indexOf('c')){
                opt.create = true;
            }
            if(~myArgv.indexOf('d')){
                opt.dest = arguments[++i] || './';
            }
           
        } else {
            switch(myArgv){
                case '-o':
                    opt.optimize = true;
                    break;

                case '-c':
                    opt.create = true;
                    break;

                case '-w':
                    opt.watch = true;
                    break;

                case '-l':
                    opt.live = true;
                    break;

                case '-d':
                    opt.dest = arguments[++i] || './';
                    break;

                case 'init':
                    runInit = true;
                    break;

                case 'grunt':
                    runGruntInit = true;
                    break;

                case '-h':
                case '--h':
                    runHelp = true;
                    break;

                default:
                    runHelp = true;
                    break;
            }
        }
    }

    if(runInit){
        release.configFile.init();

    } else if(runGruntInit){
        release.gruntFile.init();

    } else if(runHelp){
        release.help();
        
    } else {
        release.init(opt);
    }

};

