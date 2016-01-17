var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config'),
    server = require('./w-server.js'),
    userConfig = (function(){
        try{
            return require(config.userConfigFile);
        } catch(er){
            console.log(er)
            return undefined;
        }
    })();


var 
    
    release = {
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
        gruntFile: {
            init: function(){
                if(fs.existsSync(config.userGruntFile)){
                    fn.msg.error(config.userGruntFile + ' 已经存在，初始化失败');

                } else {
                    fn.copyFiles(config.basePath + 'init-files/gruntfile/Gruntfile.js', config.userGruntFile);
                    fn.msg.line().create('Gruntfile.js 创建完成');
                }

                if(fs.existsSync(config.userPkgFile)){
                    fn.msg.error(config.userPkgFile + ' 已经存在，创建失败');

                } else {
                    fn.copyFiles(config.basePath + 'init-files/gruntfile/package.json', config.userPkgFile);
                    fn.msg.line().create('package.json 创建完成');
                }
            }
        },
        grunt: {
            
            init: function(){
                var grunt = require('grunt');
                    
                var myGrunt = {
                        loadNpmTasks: function(){},
                        registerTask: function(){},
                        registerMultiTask: function(){},
                        file: grunt.file,
                        task: grunt.task,
                        initConfig: function(config){
                            this.config = {};
                            for(var key in config){
                                if(config.hasOwnProperty(key)){
                                    !~key.indexOf('watch') && (this.config[key] = config[key]);
                                }
                            }
                        },
                        util: grunt.util,
                        fail: grunt.fail,
                        log: grunt.log,
                        option: grunt.option,
                        template: grunt.template
                    };


                require(config.projectPath + 'Gruntfile.js')(myGrunt);

                var iDevDependencies = JSON.parse(fs.readFileSync(config.projectPath + 'package.json')).devDependencies;

                var userConfig = {
                    type: 'grunt',
                    devDependencies: iDevDependencies,
                    optimize: myGrunt.config
                };
                delete userConfig.optimize.pkg;

                return userConfig;

            },
            build: function(optimizeConfig, callback){
                process.chdir(config.basePath);
            
                var grunt = require('grunt'),
                    gruntConfig;

                if(fs.existsSync(config.projectPath + 'package.json')){
                    gruntConfig = {
                        pkg: grunt.file.readJSON(config.projectPath + 'package.json' )
                    };

                } else {
                    gruntConfig = {
                        pkg: grunt.file.readJSON(config.basePath + 'package.json' )
                    };

                }

                for(var key in gruntConfig.pkg.devDependencies){
                    if( gruntConfig.pkg.devDependencies.hasOwnProperty(key) ){
                        ~key.indexOf('grunt-') && grunt.loadNpmTasks(key);
                    }
                }


                // packages && packages.forEach(function(name, i){
                //     grunt.loadNpmTasks(name);
                // });

                process.chdir(config.projectPath);
                
                // 数据处理
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
            }
        },
        gulp: {
            load: function(){

            },

            build: function(){
                
            }
        },
        optimize: function(callback){///{
            var she = this;
            if(typeof userConfig == 'object'){

            } else if(fs.existsSync(config.projectPath + 'Gruntfile.js') && fs.existsSync(config.projectPath + 'package.json')){
                userConfig = she.grunt.init();

            } else if(fs.existsSync(config.projectPath + 'gulpfile.js') && fs.existsSync(config.projectPath + 'package.json')){
                userConfig = she.gulp.init();
                
            } else {
                console.log(fs.existsSync(config.projectPath + 'Gruntfile.js'))
                console.log(fs.existsSync(config.projectPath + 'package.json'))
                fn.msg.error('no configfile can work');
                return callback && callback();

            }


            new fn.Promise(function(next){ // init package

                var iPackage = [],
                    iAttr = '',
                    iPath = '';
                switch(fn.type(userConfig.devDependencies)){
                    case 'array':
                        userConfig.devDependencies.forEach(function(item, i){
                            if(!fs.existsSync(config.basePath + 'node_modules/' + item)){
                                iPackage.push(item);
                            }
                        });
                        break;

                    case 'object':
                        for(var key in userConfig.devDependencies){
                            if(userConfig.devDependencies.hasOwnProperty(key)){
                                iPath = config.basePath + 'node_modules/' + key;

                                if(!fs.existsSync(iPath)){
                                    iPackage.push(key);

                                }
                            }
                        }
                        break;

                    default:
                        break;
                }

                if(iPackage.length){
                    fn.runCMD('npm install ' + iPackage.join(' ') + ' --save-dev', function(){
                        next(iPackage);
                    }, config.basePath);

                } else {
                    next(false);
                }

            }).then(function(next){
                switch(userConfig.type){
                    case 'gulp':
                        she.gulp.build(userConfig.optimize, callback);
                        break;

                    case 'grunt':
                    default:
                        she.grunt.build(userConfig.optimize, callback);
                        break;
                }

            }).start();

            
            // if(typeof userConfig == 'object'){

            // } else if(fs.existsSync(config.projectPath + 'Gruntfile.js') && fs.existsSync(config.projectPath + 'package.json')){
            //     she.gulp.load();
                

            // } else {
            //     fn.msg.error(config.userConfigFile + ' is not work');
            //     return callback && callback();
            // }


            // var promise = new fn.Promise();
            
            // promise.then(function(next){
            //     if(userConfig.devDependencies && userConfig.devDependencies.length){
            //         var myPackage = [];
            //         userConfig.devDependencies.forEach(function(item, i){
            //             if(!fs.existsSync(config.basePath + 'node_modules/' + item)){
            //                 myPackage.push(item);
            //             }
            //         });
            //         if(myPackage.length){
            //             fn.runCMD('npm install ' + myPackage.join(' ') + ' --save-dev', function(){
            //                 next(myPackage);
            //             }, config.basePath);
            //         } else {
            //             next(false);
            //         }
            //     } else {
            //         next(false);
            //     }

            // }).then(function(packages, next){
            //     process.chdir(config.basePath);
            
            //     var grunt = require('grunt'),
            //         gruntConfig = {
            //         pkg: grunt.file.readJSON(config.basePath + 'package.json' )
            //     };

                
            //     for(var key in gruntConfig.pkg.devDependencies){
            //         if( gruntConfig.pkg.devDependencies.hasOwnProperty(key) ){
            //             ~key.indexOf('grunt-') && grunt.loadNpmTasks(key);
            //         }
            //     }

            //     packages && packages.forEach(function(name, i){
            //         grunt.loadNpmTasks(name);
            //     });

            //     process.chdir(config.projectPath);
                
            //     // 数据处理
            //     var optimizeConfig = userConfig.optimize;

            //     var taskArr = [];
            //     for(var key in optimizeConfig){
            //         optimizeConfig.hasOwnProperty(key) && (
            //             taskArr.push(key),
            //             gruntConfig[key] = optimizeConfig[key]
            //         );
            //     }
            //     grunt.option('force', true);
            //     grunt.initConfig(gruntConfig);
            //     grunt.file.setBase(config.projectPath);
            //     grunt.task.run(taskArr);
            //     grunt.task.options({
            //         error: function(er){
            //             fn.msg.error(er);
            //             return false;
            //         },
            //         done: function(){
            //             fn.msg.success('optimize is done');
            //             callback && callback();
            //         }
            //     });
            //     // grunt.task.options.done = function(){
            //     //     fn.msg.success('optimize is done');
            //     //     callback && callback();
            //     // };
            //     grunt.task.start();
            //     next();


            // }).start();

            

        },///}
        
        init: function(op){///{
            op = op || {};
            var she = this,
                serverDoc = config.serverPath.replace(/\/$/, '');
               
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
                        !file.match(config.filterPath) && !~fileArr.indexOf(file) && fileArr.push(file);
                        
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
                    'init': 'create the config file',
                    'grunt': 'create the gruntfile and package.json',
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

                case 'grunt':
                    runGruntInit = true;
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

    } else if(runGruntInit){
        release.gruntFile.init();

    } else if(runHelp){
        release.help();
        
    } else {
        release.init(opt);
    }

};

