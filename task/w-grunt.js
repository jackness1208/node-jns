var inquirer = require("inquirer"),
    readline = require('readline'),
    color = require('../lib/colors'),
    fs = require('fs'),
    global = require('../lib/global'),
    fn = global.fn,
    pg = global.pg;

var gn = {
        init: function(){
            var packageConfig = {
                    name: '',
                    version: '',
                    description: '',
                    author: '',
                    license: "MIT"
                },
                create = {
                    grunt4Uglify: function(){
                        packageConfig.devDependencies = {
                            "grunt": "~0.4.1",
                            "grunt-contrib-jshint": "~0.6.3",
                            "grunt-contrib-concat": "~0.3.0",
                            "grunt-contrib-uglify": "~0.2.1",
                            "grunt-contrib-requirejs": "~0.4.1",
                            "grunt-contrib-copy": "~0.4.1",
                            "grunt-contrib-clean": "~0.5.0",
                            "grunt-strip": "~0.2.1",
                            "chalk": "~0.5.1",
                            "grunt-contrib-watch": "~0.6.1"
                        };

                        packageConfig.dependencies = {
                            "express": "3.x"
                        };
                        fs.writeFile(pg.projectPath + '/package.js', JSON.stringify(packageConfig, null, 4), function(err){
                            if(!err){
                                fn.msg.success('文件创建成功 - package.js')
                            } else {
                                console.log('[error] ' + err.message);
                            }

                        });

                        fn.copyPathFiles(pg.basePath + 'init-files/grunt-uglify/', pg.projectPath, function(err){
                            if(!err){
                                fn.msg.line().success('文件初始化完成');
                            } else {
                                fn.msg.error(err.message);
                            }
                        });
                    },
                    seajs: function(){
                        //TODO
                    },
                    grunt4Express: function(){

                        packageConfig.dependencies = {
                            "express": "3.4.8",
                            "ejs": "*",
                            "mysql":"*"
                        };

                        fs.writeFile(pg.projectPath + '/package.js', JSON.stringify(packageConfig, null, 4), function(err){
                            if(!err){
                                fn.msg.success('文件创建成功 - package.js')
                            } else {
                                console.log('[error] ' + err.message);
                            }

                        });


                        fn.copyPathFiles(pg.basePath + 'init-files/grunt-express/', pg.projectPath, function(err){
                            if(!err){
                                fn.msg.line().success('文件初始化完成');
                            } else {
                                fn.msg.error(err.message);
                            }
                        },/node_module|package.js$/i);
                    }
                };
            

            inquirer.prompt([
                {
                    name: 'name',
                    message: '项目名称',
                    type: 'input',
                    default: pg.projectPath.substr(0, pg.projectPath.length - 1).split('/').pop(),
                     
                    filter: function(val){
                        return val.replace(/[-\.\\\/]/g, '');
                    }
                },{
                    name: 'version',
                    message: '版本',
                    default: '1.0.0',
                    type: 'input'
                },{
                    name: 'description',
                    message: '简介',
                    default: '',
                    type: 'input'
                },{
                    name: 'author',
                    message: '作者',
                    default: '',
                    type: 'input'
                },{
                    name: 'type',
                    message: '模板选择',
                    default: 'grunt for uglify',
                    type: 'list',
                    choices: ['grunt for uglify', 'grunt + express', ]
                }


            ], function(results){
                packageConfig.name = results.name;
                packageConfig.version = results.version;
                packageConfig.description = results.description;
                packageConfig.author= results.author;

                switch(results.type){
                    case 'grunt for uglify':
                        create.grunt4Uglify();
                        break;

                    case 'grunt + express':
                        create.grunt4Express();
                        break;
                    
                    default:
                        break;
                }
            });

        },

        help: function(){
            console.log([
                '',
                '  Usage: jns grunt <command>',
                '',
                '  Commands:',
                '',
                '    init   project init',
                '',
                '  Options:',
                '',
                '    -h, --help      output usage information',
                ''
            ].join("\n"));

        }
    };



module.exports = function(type){
    switch(type){
        case "init":
            gn.init();
            break;

        case '-h':
        case '--help':
        default:
            gn.help();
            break;
    }

    
};


