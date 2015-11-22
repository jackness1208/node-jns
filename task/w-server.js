var inquirer = require("inquirer"),
    readline = require('readline'),
    wsServer = require('../lib/wsServer'),
    fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');


var sv = {
    start: function(op){
        op = op || {};

        fn.timer.start(); // 开始计时
        new fn.Promise(function(next){ // live
            if(op.live){
                op.live && wsServer.init();
            }
            next();

        }).then(function(NEXT){ // 本地服务器搭建
            var serverDoc = config.serverPath.replace(/\/$/, ''),
                serverSource = config.basePath + 'init-files/local-server/';


                new fn.Promise(function(next){ // 判断目录是否存在
                    if (!fs.existsSync(serverDoc)) {
                        fs.mkdirSync(serverDoc);
                    }
                    next();

                }).then(function(next){// 拷贝 lib/color.js、lib/global.js 到 服务器 server/lib
                    var files = {};
                    files[config.basePath + 'lib/colors.js'] = serverSource + 'server/libs/colors.js';
                    files[config.basePath + 'lib/global.js'] = serverSource + 'server/libs/global.js';
                    fn.copyFiles(files, function(){
                        next();
                    });

                }).then(function(next){ // 清空文件夹内容
                    fn.removeFiles(config.serverPath + 'static/', function(){
                        fn.msg.nowrap('',true).success('clear the static file done');
                        next();
                    });

                }).then(function(next){ // 拷贝 服务器文件
                    fn.copyFiles(serverSource, config.serverPath, function() {
                        fn.msg.nowrap('',true).success('copy server files done');
                        next();
                    }, config.filterPath);


                }).then(function(next){
                    if(op.path){ // 将 path 路径里面的内容拷贝到 服务器的 static 文件夹里面
                        sv.add({
                            'path': config.projectPath, 
                            'callback': function(){
                                fn.msg.nowrap('',true).success('copy project files done');
                                next();

                            }
                        });
                        
                    } else {
                        next();
                    }
                }).then(function(next){
                    NEXT();

                }).start();

        }).then(function(next){ // server 初始化
            fn.runCMD('npm install', function(){
                next();

            }, config.serverPath);
        }).then(function(next){ // 运行服务器
            var iPackage = require(config.serverPath + 'package.json'),
                startBranch = iPackage.start || 'app',
                startPath = (config.serverPath + startBranch).replace(/[^\\\/]+$/,''),
                startName = (config.serverPath + startBranch).split('/').pop(); 

            fn.runCMD('node ' + startName, function(){
            }, startPath);

            next();

        }).then(function(){ // 完成
            fn.timer.end();
            fn.msg.line().success('release ok');
            op.callback && op.callback();

        }).start();

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
    
    add: function(op){
        op = op || {};

        if(op.path){
            new fn.Promise(function(next){
                fn.removeFiles(config.serverPath + 'static/', function(){
                    fn.msg.nowrap('',true).success('clear the static file done');
                    next();
                });

            }).then(function(next){
                fn.copyFiles(op.path, config.serverPath + 'static/', function(){
                    var now = new Date().toString().replace(/^(\w+\s\w+\s\d+\s\d+\s)(\d+\:\d+\:\d+)(.+)$/,'$2');

                    if(wsServer.enable){
                        wsServer.send('reload', 'reload it! ['+ now +']');
                    }

                    next();

                },/node_modules$/ig, function(filename, textcontent){
                    if(wsServer.enable){
                        return wsServer.render(filename, textcontent);
                    } else {
                        return textcontent;
                    }

                });
            }).then(function(next){
                op.callback && op.callback();

            }).start();
            

        }
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
            sv.open();
            break;

        case 'clear':
            sv.clear();
            break;

        case 'add':
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
            sv.add(op);
            break;

        case '-h':
        case '-help':
        default:
            sv.help();
            break;

    }
};
