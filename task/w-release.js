

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
        canWatch: true,
        configFile: {
            init: function(){
                if(fs.existsSync(config.userConfigFile)){
                    fn.msg.error(config.userConfigFile + ' 已经存在，初始化失败');
                } else {
                    

                    fn.copyFiles(config.basePath + 'init-files/config/jns-config.js', config.userConfigFile);
                    fn.msg.line().create('jns-config.js 创建完成');
                }
                
            }
        },
        watchTaskRunning: false,
        optimize: function(callback){
            
            if(typeof userConfig == 'object'){
                console.log(userConfig)

            } else if(fs.existsSync(config.projectPath + 'Gruntfile.js') && fs.existsSync(config.projectPath + 'package.json')){
                !function(){
                    var grunt = require('grunt');
                    
                    var myGrunt = {
                            loadNpmTasks: function(){},
                            registerTask: function(){},
                            registerMultiTask: function(){},
                            file: grunt.file,
                            task: grunt.task,
                            initConfig: function(config){
                                this.config = config;
                            },
                            util: grunt.util,
                            fail: grunt.fail,
                            log: grunt.log,
                            option: grunt.option,
                            template: grunt.template
                        };


                    require(config.projectPath + 'Gruntfile.js')(myGrunt);

                    userConfig = {
                        devDependencies: JSON.parse(fs.readFileSync(config.projectPath + 'package.json')).devDependencies,
                        optimize: myGrunt.config
                    };
                    delete userConfig.optimize.pkg;
                }();

            } else {
                fn.msg.error(config.userConfigFile + ' is not work');
                return callback && callback();
            }


            var promise = new fn.promise();
            
            promise.then(function(next){
                if(userConfig.devDependencies && userConfig.devDependencies.length){
                    var myPackage = [];
                    userConfig.devDependencies.forEach(function(item, i){
                        if(!fs.existsSync(config.basePath + 'node_modules/' + item)){
                            myPackage.push(item);
                        }
                    });
                    if(myPackage.length){
                        fn.runCMD('npm install ' + myPackage.join(' ') + ' --save-dev', function(){
                            next(myPackage);
                        }, config.basePath);
                    } else {
                        next(false);
                    }
                } else {
                    next(false);
                }

            }).then(function(packages, next){
                process.chdir(config.basePath);
            
                var grunt = require('grunt'),
                    gruntConfig = {
                    pkg: grunt.file.readJSON(config.basePath + 'package.json' )
                };

                
                for(var key in gruntConfig.pkg.devDependencies){
                    if( gruntConfig.pkg.devDependencies.hasOwnProperty(key) ){
                        ~key.indexOf('grunt-') && grunt.loadNpmTasks(key);
                    }
                }

                packages && packages.forEach(function(name, i){
                    grunt.loadNpmTasks(name);
                });

                process.chdir(config.projectPath);
                
                // 数据处理
                var optimizeConfig = userConfig.optimize;

                var taskArr = [];
                for(var key in optimizeConfig){
                    optimizeConfig.hasOwnProperty(key) && (
                        taskArr.push(key),
                        gruntConfig[key] = optimizeConfig[key]
                    );
                }
                grunt.option('force', true);
                grunt.initConfig(gruntConfig);
                grunt.file.setBase(config.projectPath);
                grunt.task.run(taskArr);
                grunt.task.options({
                    error: function(er){
                        fn.msg.error(er);
                        return false;
                    },
                    done: function(){
                        fn.msg.success('optimize is done');
                        callback && callback();
                    }
                });
                // grunt.task.options.done = function(){
                //     fn.msg.success('optimize is done');
                //     callback && callback();
                // };
                grunt.task.start();
                next();


            }).start();

            

        },
        
        staticServer: function(op){///{
            op = op || {};
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
                                'serverAddress': config.serverAdress
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
            
            
            promise.then(function(next){ // websocket server start
                op.live && wsServer.init();
                next();

            }).then(function(next){ // optimize
                if(op.optimize){
                    release.optimize(function(){
                        next();
                    });
                } else {
                    next();
                }
                
                
            }).then(function(NEXT){ // base static server build
                if(op.create){
                    fn.timer.start();
                    var myPromise = new fn.promise();

                    myPromise.then(function(next){
                        if (!fs.existsSync(serverDoc)) {
                            fs.mkdirSync(serverDoc);
                        }
                        next();
                    }).then(function(next){
                        fn.copyFiles(config.basePath + 'init-files/local-server/', config.serverPath, function() {
                            next();
                        });
                    }).then(function(next){
                        serverPath2Path(config.projectPath, config.serverPath + 'static/', function(){
                            next();
                        });

                    }).then(function(next){
                        fn.msg.nowrap('', true);
                        fn.runCMD('npm install', function(){
                            next();

                        }, config.serverPath);

                    }).then(function(next){
                        fn.runCMD('node app', function(){
                        }, config.serverPath);
                        next();

                    }).then(function(next){
                        fn.timer.end();
                        fn.msg.line().success('release ok');

                        NEXT();

                    }).start();
                    

                } else {
                    NEXT();
                }

            }).then(function(next){ // watch files
                if(op.watch){
                    fn.msg.notice('start to watch');

                    watch(config.projectPath, function(filename){
                        if(release.watchTaskRunning){
                            return;
                        }
                        release.watchTaskRunning = true;
                        fn.timer.start();

                        var myFile = fn.formatPath(filename).replace(config.projectPath,'');

                        var promise = new fn.promise();

                        promise.then(function(next){
                            if(op.optimize){
                                release.optimize(function(){
                                    next();
                                });

                            } else {
                                next();
                            }

                        }).then(function(next){
                            if(op.create){
                                serverPath2Path(config.projectPath + myFile, config.serverPath + 'static/' + myFile, function(){
                                    next();
                                });
                            } else {
                                next();
                            }
                            
                        }).then(function(next){
                            if(op.live){
                                wsServer.send('reload', 'reload it!');
                                next();

                            } else {
                                next();
                            }
                        }).then(function(next){
                            fn.timer.end();
                            clearTimeout(release.watchTaskKey);
                            release.watchTaskKey = setTimeout(function(){
                                release.watchTaskRunning = false;

                            }, 1000);
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

