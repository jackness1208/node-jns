var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    color = require('../lib/colors'),
    wsServer = require('../lib/wsServer'),
    fn = require('../lib/global'),
    config = require('../lib/config');


var render = {
        init: function(filename, content){
            var she = this,
                myExt = filename.split('.').pop();

            switch(myExt){
                case 'html':
                    return render.html(content);

                default:
                    return content + '';
            }
        },
        html: function(content){
            return content + '';
        }

    },
    
    release = {
        optimize: function(callback){
            // TODO load jns-config
            callback && callback();
        },
        
        staticServer: function(op){///{
            op = op || {};
            console.log(op);
            fn.timer.start();
            var she = this,
                serverDoc = config.serverPath.replace(/\/$/, ''),
                // server 环境搭建
                serverBuild = function(callback){
                    if (!fs.existsSync(serverDoc)) {
                        fs.mkdirSync(serverDoc);
                    }

                    fn.copyFiles(config.basePath + 'init-files/local-server/', config.serverPath, function() {
                        callback && callback();
                        
                    });
                },
                
                // 监控操作
                watchHandle = function(){
                    if(op.watch){
                        watch(config.projectPath, function(filename){
                            fn.timer.start();
                            var myFile = fn.formatPath(filename).replace(config.projectPath,'');

                            fn.copyFiles(config.projectPath + myFile, config.serverPath + 'static/' + myFile, function(){
                                docTreeBuild(function(){
                                    optimizeHandle(function(){
                                        wsServer.send('reload', 'reload it!');
                                        fn.timer.end();
                                    });
                                });

                            }, function(filename, textcontent){
                                return render.init(filename, textcontent);
                            });
                        });
                    }
                },

                // 目录搭建
                docTreeBuild = function(callback){
                    fn.getPaths(config.projectPath, function(err, list){
                        var targetFile = config.serverPath + 'tpl/main/home.html',
                            sourceFile = config.basePath + 'init-files/local-server/tpl/main/home.html',
                            options = {
                                'treeData': fn.pathsFormat(list, '/'),
                            },
                            myRender = function(content, op){
                                var myContent = render.init(targetFile, content),
                                    str;
                                for(var key in op){
                                    if(op.hasOwnProperty(key)){
                                        switch(typeof op[key]){
                                            case 'object':
                                                str = JSON.stringify(op[key]);
                                                break;

                                            case 'string':
                                            default:
                                                str = op[key];
                                                break;
                                        }
                                        myContent = myContent.replace(new RegExp('{{'+ key +'}}', 'g'), str);
                                    }
                                }
                                return myContent;
                            };
                            
                        fs.writeFileSync(targetFile, myRender(fs.readFileSync(sourceFile), options));
                        callback && callback();
                    });
                };

            op.live && wsServer.init();

            serverBuild(function(){
                // 文件拷贝
                fn.copyFiles(config.projectPath, config.serverPath + 'static/', function(){
                    docTreeBuild(function(){
                        she.optimize(function(){
                            fn.timer.end();
                            fn.msg.line().success('release ok');
                            op.watch && fn.msg.notice('start to watch');
                            
                            watchHandle();
                        });
                        
                    });
                    
                },/node_modules$/ig, function(filename, textcontent){
                    var r = render.init(filename, textcontent);
                    if(wsServer.enable){
                        r = wsServer.render(filename, r);
                    }
                    return r;
                    
                });
            });
            
        },

        help: function(){
            fn.help({
                usage: 'jns release',
                commands: {
                    'init': 'create the config file',
                    '-l': 'release project to localserver with livereload',
                    '-o': 'optimize project',
                    '-w': 'watch project',
                    '-d': 'output the project'
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
            optimize: false
        },
        runInit,
        runHelp;

    for(var i = 0, myArgv, len = arguments.length; i < len; i++){
        myArgv = arguments[i];
        if(/^-[owlp]+$/.test(myArgv)){
            ~myArgv.indexOf('o') && (opt.optimize = true);
            ~myArgv.indexOf('l') && (opt.live = true);
            ~myArgv.indexOf('w') && (opt.watch = true);
            ~myArgv.indexOf('d') && (
                opt.dest = arguments[++i] || './'
            );
           
        } else {
            switch(myArgv){
                case '-o':
                    opt.optimize = true;
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

                case '-h':
                case '--h':
                default:
                    runHelp = true;
                    break;
            }
        }
    }

    if(runInit){
        release.init();

    } else if(runHelp){
        release.help();
        
    } else {
        release.staticServer(opt);
    }

};

