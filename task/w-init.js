'use strict';

var 
    inquirer = require("inquirer"),
    fn = require('../lib/global'),
    config = require('../lib/config'),
    path = require('path'),
    fs = require('fs');

var 
    fn = {
        copyFiles: function(p){
            new fn.Promise(function(next){
                fn.timer.start({
                    onMark: function(file){
                        fn.msg.create(path.relative(config.projectPath, file));
                    },
                    onEnd: function(data){
                        fn.msg.line().success('初始化完成。共创建 ' + data.source.length + ' 个文件, 耗时 ' + data.time + ' ms');
                    }
                });
                fn.copyFiles(
                    path.join(config.basePath, p),
                    path.join(config.projectPath),
                    function(){
                        next();
                    }
                );


            }).then(function(next){
                fn.timer.end();
                next();

            }).start();

        }

    };

var 
    attributes = {
        // 帮助文件
        help: function(){
            fn.help({
                usage: 'jns init',
                commands: {
                    'grunt': 'init doc paths with grunt',
                    'grunt-requirejs': 'init doc paths with grunt-require',
                    'gulp': 'init doc paths with gulp',
                    'gulp-component': 'init doc paths with gulp-component',
                    'rename': 'init rename pluins',
                    'reptile': 'init reptile pluins'
                },
                options: {
                    '-h, --help': 'output usage information'
                }
            });

        },
        grunt: function(){
            fn.copyFiles('init-files/grunt');
        },
        gruntRequirejs: function(){
            fn.copyFiles('init-files/grunt-requirejs');
        },

        gulp: function(){
            fn.copyFiles('init-files/gulp');
        },
        gulpComponent: function(){
            fn.copyFiles('init-files/gulp-component');
        },
        // 爬虫
        reptile: function(){
            fn.copyFiles('init-files/reptile');
        },

        // 重命名
        rename: function(){
            var 
                projectPath = process.cwd(),
                dirname = projectPath.split(/[\\/]+/).pop();


            new fn.Promise(function(next){
                inquirer.prompt([
                    {
                        type: 'input',
                        name:'name',
                        message:'请输入文件名称',
                        default: dirname
                    }
                ], next);

            }).then(function(answer, next){
                var name = answer.name;
                fs.readdir(projectPath, function(err, list){
                    next(name, list);
                });

            }).then(function(name, list, next){
                var 
                    total = list.length,
                    count = 0,
                    okCount = 0,
                    errCount = 0,
                    exitCheck = function(){
                        if(total == count){
                            fn.msg.line().notice('共修改文件 ' + (okCount + errCount) + ' 个');
                            fn.msg.notice('成功：' + okCount + ' , 失败：' + errCount);
                        }
                    };

                list.forEach(function(file){
                    var 
                        iPath = path.join( projectPath, file),
                        iStat = fs.statSync(iPath),
                        num, ext, nPath;

                    if(!iStat.isDirectory()){
                        ext = path.extname(file);
                        num = file.replace(/^.*\[(\d+)\].*$/g, '$1');

                        if(/mp4|rmvb|mkv|avi/ig.test(ext)){
                            if(num){
                                nPath = path.join(projectPath, name + num + ext);
                                fs.renameSync(iPath, nPath);
                                fn.msg.success(nPath + ' 修改成功 √');
                                okCount++;

                            } else {
                                fn.msg.error(file + ' 修改失败');
                                errCount++;
                            }
                        }
                        
                    }

                    count++;
                    exitCheck();

                });
                next();


            }).start();
        }
    };


module.exports = function(type){
    switch(type){
        case '-h':
        case 'help':
            attributes.help();
            break;

        case 'grunt':
            attributes.grunt();
            break;

        case 'grunt-requirejs':
            attributes.gruntRequirejs();
            break;

        case 'gulp':
            attributes.gulp();
            break;

        case 'gulp-component':
            attributes.gulpComponent();
            break;

        case 'rename':
            attributes.rename();
            break;

        case 'reptile':
            attributes.reptile();
            break;

        default:
            attributes.help();
            break;
    }

};
