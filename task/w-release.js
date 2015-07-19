var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    color = require('../lib/colors'),
    wsServer = require('../lib/wsServer'),
    fn = require('../lib/global'),
    config = require('../lib/config'),
    userConfig = (function(){
        try{
            return require(config.userConfigFile);
        } catch(er){
            return undefined;
        }
    })();


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
        configFile: {
            init: function(){
                fn.copyFiles(config.basePath + 'init-files/config/jns-config.js', config.userConfigFile);
                fn.msg.line().create('jns-config.js 创建完成');
            }
        },
        optimize: function(callback){
            // callback && callback();
            if(typeof userConfig != 'object'){
                fn.msg.error(config.userConfigFile + ' is not work');
                return callback && callback();
            }
            var grunt = require('grunt'),
                gruntConfig = {};
            
            // require(config.basePath + 'node_modules/grunt-contrib-requirejs')(grunt);
            grunt.loadNpmTasks('grunt-contrib-requirejs');
            // 数据处理
            var optimizeConfig = userConfig.optimize;
            if(optimizeConfig.requirejs){
                // TODO 
            }
            
            if(optimizeConfig.uglify){
                // TODO 

            }

            if(optimizeConfig.sass){
                //TODO
            }

            var taskArr = [];
            for(var key in optimizeConfig){
                optimizeConfig.hasOwnProperty(key) && taskArr.push(key);
            }
            grunt.task.run(taskArr);
        },
        
        staticServer: function(op){///{
            op = op || {};
            fn.timer.start();
            var she = this,
                serverDoc = config.serverPath.replace(/\/$/, ''),
                
                serverPath2Path = function(path, toPath, callback){
                    // 文件拷贝
                    fn.copyFiles(path, toPath, function(){
                        docTreeBuild(function(){
                            callback && callback();
                        });

                    },/node_modules$/ig, function(filename, textcontent){
                        var r = render.init(filename, textcontent);
                        if(wsServer.enable){
                            r = wsServer.render(filename, r);
                        }
                        return r;
                    });
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

            var promise = new fn.promise();
            
            
            promise.then(function(res, next){ // websocket server start
                op.live && wsServer.init();
                next();

            }).then(function(res, next){ // optimize
                release.optimize(function(){
                    next();
                });
                
            }).then(function(res, next){ // base static server build
                if(op.create){
                    if (!fs.existsSync(serverDoc)) {
                        fs.mkdirSync(serverDoc);
                    }

                    fn.copyFiles(config.basePath + 'init-files/local-server/', config.serverPath, function() {
                        
                        serverPath2Path(config.projectPath, config.serverPath + 'static/', function(){
                            fn.timer.end();
                            fn.msg.line().success('release ok');
                            next();
                        });
                        
                    });

                } else {
                    next();
                }

            }).then(function(res, next){ // watch file
                if(op.watch){
                    fn.msg.notice('start to watch');

                    watch(config.projectPath, function(filename){
                        fn.timer.start();
                        var myFile = fn.formatPath(filename).replace(config.projectPath,'');

                        var promise = new fn.promise();

                        promise.then(function(res, next){
                            if(op.optimize){
                                release.optimize(function(){
                                    next();
                                });

                            } else {
                                next();
                            }

                        }).then(function(res, next){
                            if(op.create){
                                serverPath2Path(config.projectPath + myFile, config.serverPath + 'static/' + myFile, function(){
                                    op.live && wsServer.send('reload', 'reload it!');
                                    next();
                                });
                            } else {
                                next();
                            }
                            
                        }).then(function(res, next){
                            fn.timer.end();
                            next();

                        }).start();

                        
                    });
                }

                next();

            }).start();

        },

        help: function(){
            fn.help({
                usage: 'jns release',
                commands: {
                    'init': 'create the config file',
                    '-l': 'web socket server start',
                    '-o': 'optimize project',
                    '-w': 'watch project',
                    '-d': 'output the project',
                    '-c': 'create locate server'
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
        runHelp;

    for(var i = 0, myArgv, len = arguments.length; i < len; i++){
        myArgv = arguments[i];
        if(/^-[cowlp]+$/.test(myArgv)){
            ~myArgv.indexOf('o') && (opt.optimize = true);
            ~myArgv.indexOf('l') && (opt.live = true);
            ~myArgv.indexOf('w') && (opt.watch = true);
            ~myArgv.indexOf('c') && (opt.create = true);
            ~myArgv.indexOf('d') && (
                opt.dest = arguments[++i] || './'
            );
           
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

                case '-h':
                case '--h':
                default:
                    runHelp = true;
                    break;
            }
        }
    }

    if(runInit){
        release.configFile.init();

    } else if(runHelp){
        release.help();
        
    } else {
        release.staticServer(opt);
    }

};

