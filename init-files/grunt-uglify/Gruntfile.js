module.exports = function(grunt) {
    var fs = require("fs"),
        chalk = require('chalk'),
        initHandle = require('./tasks/init.js'),
        global = {
            onlinePath:'../../../static.kugou.com-线上/',
            source:{
                'public':{
                    'path':{
                        test:'',
                        yufabu:'../../../www2.kugou.com-预发布2/fm2/static/'
                    },
                    'js':[
                        {
                            src:['js/fm.js'],
                            dest:'js/min/fm-min.js'
                        },
                        'js/min/supercall-min.js',
                        'js/min/supercall.2.0-min.js'
                    ],
                    'css':[
                        'css/fm.css'
                    ],
                    'img':[
                        'images/*.*',
                        'images/recommend/**'
                    ],
                    'tpl':[
                        '../app/public/static/tpl/public/index.html',
                        '../index.html'
                    ],
                    'html':[]
                },

                'public-locate':{
                    'path':{
                        test:'',
                        yufabu:'../../../www2.kugou.com-预发布2/fm2/static/'
                    },
                    'js':[
                        {
                            src:[
                                '../app/public/static/js/supercall.2.0-min.js',
                                '../app/public/static/js/base-min.js',
                                '../app/public/static/js/fm-1stPage.js'
                            ],
                            dest:'../app/public/static/js/dist/fm-1stPage-min.js'
                        },{
                            src:[
                                '../app/public/static/js/lazyload-min.js',
                                '../app/public/static/js/dialogBox-min.js',
                                '../app/public/static/js/mixFm.js',
                                '../app/public/static/js/fm.js'
                            ],

                            dest:'../app/public/static/js/dist/fm-others-min.js'
                        }
                    ],
                    'css':[
                        '../app/public/static/css/fm.css'
                    ],
                    'img':[
                        '../app/public/static/images/recommend/*.*'
                    ],
                    'tpl':[
                        '../app/public/static/tpl/public/index_locate.html',
                        '../index.html'
                    ],
                    'html':[
                        '../app/public/static/html/public/index.html'
                    ]
                }
            }
        };


    // 项目配置
    grunt.initConfig(initHandle({
        pkg: grunt.file.readJSON('package.json'),
        copy:{
            //同步线上base 等文件
            "public-locate-base-sync":{
                files:[
                    {
                        src:[global.onlinePath + "common/js/min/dialogBox-min.js"],
                        dest:"../app/public/static/js/dialogBox-min.js"
                    },{
                        src: [global.onlinePath + "common/js-lib/min/supercall.2.0-min.js"],
                        dest:"../app/public/static/js/supercall.2.0-min.js"
                    },{
                        src:[ global.onlinePath + "common/js-lib/min/base-min.js"],
                        dest:"../app/public/static/js/base-min.js"
                    },{
                        src:[ global.onlinePath + "common/js-lib/min/lazyload-min.js"],
                        dest:"../app/public/static/js/lazyload-min.js"
                    },
                    
                ]
            }
        }
    },global.source,grunt));
    

    // 加载提供"uglify"任务的插件
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 加载提供"concat"任务的插件
    grunt.loadNpmTasks('grunt-contrib-concat');

    // 加载提供"watch"任务的插件
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 加载提供"copy"任务的插件
    grunt.loadNpmTasks('grunt-contrib-copy');


    // 注册任务
    grunt.registerTask('build', function(name) {
        if (name) {
            grunt.task.run(['uglify:' + name]);

        } else {
            grunt.task.run(['uglify']);

        }
    }
    grunt.registerTask('default', function() {

        var myConfig = grunt.config.get(),
            helpArr = [],
            fAttr, fargu;
        
        helpArr.push('# ==============');

        for(var key in myConfig){
            if(myConfig.hasOwnProperty(key) && !/^pkg$/.test(key)){
                fAttr = myConfig[key];
                helpArr.push('# 函 数 名 - grunt ' + key);
                helpArr.push('# 参数列表');
                for(fargu in fAttr){
                    if(fAttr.hasOwnProperty(fargu)){
                        helpArr.push('# :' + fargu);
                    }
                }

                helpArr.push('# ==============');
            }
        }

        helpArr.push('# 函 数 名 - grunt build');
        helpArr.push('# 参数列表 - 同uglify一致');

        // 其他自定义方法需手动自己加 help

        console.log(helpArr.join("\n"))
        


    });

    grunt.registerTask('commit', function(name,type,msg) {

        msg = msg || "";

        //变成同步执行
        var done = this.async(),
            spawn = require('child_process').spawn,
            exec = require('child_process').exec,
            src2Arr = function(srcs){
                var r = [],
                    i, len, key, src,
                    mySrcs;

                if(!srcs){
                    mySrcs = [];
                } else {
                    mySrcs = srcs;
                }

                if(!/Array/.test(Object.prototype.toString.call(srcs))){
                    mySrcs = [srcs];
                }

                for(i = 0, len = mySrcs.length; i < len; i++){
                    src = mySrcs[i];
                    r.push(src);
                }

                return r;
            },
            getUrls = function(obj, type){
                var r = [];
                for(var attr in obj){
                    if(obj.hasOwnProperty(attr) && attr != "path" ){

                            for(i = 0, len = obj[attr].length; i < len; i++){
                            fdata = obj[attr][i];
                            
                            if(typeof fdata == "object"){
                                r = r.concat(src2Arr(fdata.src));
                                r = r.concat(src2Arr(fdata.dest));                                
                            
                            } else {
                                r = r.concat(src2Arr(fdata));  
                                
                            }
                            
                        }
                        
                    }
                }
                return r;
            },
            commitFile = getUrls(global.source[name]),

            commitHandle = function(type){
                var commandPath = global.source[name].path[type],
                    r = [];

                for(var i = 0, len = commitFile.length; i < len; i++){
                    r.push(commandPath + commitFile[i]);
                }
                

                for(var i = 0, len = r.length; i < len; i++){
                    spawn('svn',["add",r[i]], {"cwd":commandPath});
                }
                
                var ctrl = ['commit','-m',msg].concat(r);

                spawn('svn',ctrl, {
                    "cwd":commandPath,
                    "stdio": [process.stdin, process.stdout, process.stderr]
                });

            };

        if(commitFile.length == 0){
            console.log(chalk.red(name + " 没有相关文件可进行更新"));

        } else {
            commitHandle();
        }
        

        
    });
}