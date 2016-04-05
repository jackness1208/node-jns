'use strict';
module.exports = function(grunt) {
    var path = require('path');

    path.joinFormat = function(){
        var iArgv = Array.prototype.slice.call(arguments);
        var r = path.join.apply(path, iArgv);
        return r
            .replace(/\\+/g, '/')
            .replace(/(^http[s]?:)[\/]+/g, '$1//');
    };

    var 
        iConfig = require('./config.js'),
        lrPort = 35729,

        fn = {
            keyPrase: function(config, handle){
                var r = {};
                for(var key in config){
                    if(config.hasOwnProperty(key)){
                        r[key] = handle(config[key], key);
                    }
                }
                return r;
            },
            varRender: function(str, op){
                return str
                    .replace(/\{\$src\}/g, op.src)
                    .replace(/\{\$dest\}/g, op.dest);
            }
        },
        gruntConfig = {
            pkg: grunt.file.readJSON('package.json'),

            // uglify 压缩
            uglify: fn.keyPrase(iConfig, function(config){
                return {
                    options: {
                        // 放在生成后的压缩文件的头部注释文案
                        banner: '/*! builded <%= grunt.template.today() %> */\n',
                        sourceMap: true,
                        sourceMapName: function(p){
                            var 
                                f = p.split("/"),
                                filename = f.pop(),
                                nav = f.join("/") + "/";
                            return nav + "map/" +  filename.replace('.js','.map');
                        },
                        sourceMapIncludeSources: true

                    },
                    files: [{
                        expand: true,
                        cwd: path.join(config.src, 'js'),
                        src: '**/*.js',
                        dest: path.join(config.dest, 'js')
                    }]
                };

            }),

            // sass
            sass: fn.keyPrase(iConfig, function(config){
                return {
                    options: {
                        sourcemap: 'none'

                    },
                    files: [{
                        expand: true,
                        cwd: path.join(config.src, 'sass'),
                        src: ['*.scss'],
                        dest: path.join(config.src, 'css'),
                        ext: '.css'
                    }]

                };
            }),
            

            // jade
            jade: fn.keyPrase(iConfig, function(config){
                return {
                    options: {
                        pretty: true,
                        client: false,
                        runtime: false
                    },
                    files: (function(){
                        var r = {};
                        r[path.join(config.src, 'html')] = [path.join(config.src, 'jade/*.jade')];
                        return r;
                    })()
                };

            }),
            concat: fn.keyPrase(iConfig, function(config){
                var 
                    r = {},
                    pushFiles = function(src, dest){
                        var iKey = fn.varRender(src, config);
                        r[iKey] = [];
                        dest.forEach(function(item){
                            r[iKey].push(fn.varRender(item, config));
                        });
                    };
                if(config.concat){
                    for(var key in config.concat){
                        if(config.concat.hasOwnProperty(key)){
                            pushFiles(key, config.concat[key]);
                        }
                    }
                }
                
                return {
                    files: r
                };
            }),

            // copy
            copy: fn.keyPrase(iConfig, function(config){
                var 
                    pushFiles = function(src, dest){
                        return {
                            expand: true, 
                            cwd: src,
                            src: ['**'], 
                            dest: dest
                        };
                    },
                    r = [
                        pushFiles(
                            path.join(config.src, 'html'), 
                            path.join(config.dest, 'html')
                        ),
                        pushFiles(
                            path.join(config.src, 'css'),
                            path.join(config.dest, 'css')
                        ),
                        pushFiles(
                            path.join(config.src, 'images'), 
                            path.join(config.dest, 'images')
                        )
                    ],
                    i, key;



                for(key in config.copy){
                    if(config.copy.hasOwnProperty(key)){
                        for(i = 0; i < config.copy[key].length; i++){
                            r.push(
                                pushFiles(
                                    fn.varRender(key, config), 
                                    fn.varRender(config.copy[key][i], config)
                                )
                            );
                        }

                    }
                }
                return {
                    files: r
                };
            }),
            connect: {
                server: {
                    options: {
                        // 服务器端口
                        port: 5000,
                        // 服务器地址
                        hostname: 'localhost',
                        // open: true,
                        // 物理路径
                        base: process.cwd(),
                        livereload: lrPort
                    }

                }
                
            },
            
            
            
            watch: (function(){

                var 
                    r = {
                        options: {
                            livereload: lrPort
                        }

                    },
                    param = fn.keyPrase(iConfig, function(config, name){
                            
                            return {
                                sass: {
                                    files: path.join(config.src, 'sass', '**/*.scss'),
                                    tasks: ['sass:' + name, 'copy:' + name]
                                },
                                js: {
                                    files: path.join(config.src, 'js', '**/*.js'),
                                    tasks: ['js:' + name, 'copy:' + name]
                                },
                                jade: {
                                    files: path.join(config.src, 'jade', '**/*.jade'),
                                    tasks: ['jade:' + name, 'copy:' + name]
                                },
                                img: {
                                    files: path.join(config.src, 'images', '**/*.*'),
                                    tasks: ['copy:' + name]

                                }
                            };

                        });

                    var key, key2;

                    for(key in param){
                        if(param.hasOwnProperty(key)){
                            for(key2 in param[key]){
                                if(param[key].hasOwnProperty(key2)){
                                    r[key + '-' + key2] = param[key][key2];
                                }
                            }
                        }
                    }
                    return r;

            })()

        };

    var 
        taskArr = [],
        key;
    for(key in gruntConfig){
        if(gruntConfig.hasOwnProperty(key) && key != 'pkg' && key != 'watch' && key != 'connect'){
            taskArr.push(key);
        }
    }

    // 项目配置
    grunt.initConfig(gruntConfig);

    // 加载任务插件
    for(key in gruntConfig.pkg.devDependencies){
        if(gruntConfig.pkg.devDependencies.hasOwnProperty(key) && key != 'grunt' && /^grunt/.test(key)){
            grunt.loadNpmTasks(key);

        }
    }

    // help 
    var helpFile = function(){
        console.log([
            '',
            ' Usage: grunt <command>',
            ' ',
            ' Commands:',
            '   build      run the Optimize task',
            '',
            ' Options:',
            '   -h         output usage information',
            '',
            ''
        ].join('\n'));
    };
    // grunt.loadTasks('tasks');

    // 注册任务
    grunt.registerTask('build', function(name) {
        var r = [];
        if (name) {
            taskArr.forEach(function(taskName){
                r.push(taskName + ":" + name);
            });

        } else {
            r = taskArr;
        }
        grunt.task.run(r);
    });

    grunt.registerTask('live', ['connect', 'watch'])

    
    grunt.registerTask('default', helpFile);
    grunt.registerTask('-h', helpFile);

};

