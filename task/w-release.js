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
        optimize: function(callback){///{
            
            if(typeof userConfig == 'object'){

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


            var promise = new fn.Promise();
            
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
        release.init(opt);
    }

};

