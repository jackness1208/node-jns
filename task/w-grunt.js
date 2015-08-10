var inquirer = require("inquirer"),
    readline = require('readline'),
    fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');

var gn = {
    init: function() { ///{
        var packageConfig = {
                name: '',
                version: '',
                description: '',
                author: '',
                license: "MIT"
            },
            create = {
                grunt4Uglify: function() {
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
                    fs.writeFile(config.projectPath + '/package.json', JSON.stringify(packageConfig, null, 4), function(err) {
                        if (!err) {
                            fn.msg.success('文件创建成功 - package.json')
                        } else {
                            console.log('[error] ' + err.message);
                        }

                    });
                    
                    fn.copyFiles(config.basePath + 'init-files/grunt-uglify/', config.projectPath, function(err) {
                        if (!err) {
                            fn.msg.line().success('文件初始化完成');
                        } else {
                            fn.msg.error(err.message);
                        }
                    });
                },
                seajs: function() {
                    //TODO
                },
                grunt4Express: function() {

                    packageConfig.dependencies = {
                        "express": "3.4.8",
                        "ejs": "*",
                        "mysql": "*"
                    };

                    fs.writeFile(config.projectPath + '/package.json', JSON.stringify(packageConfig, null, 4), function(err) {
                        if (!err) {
                            fn.msg.success('文件创建成功 - package.json')
                        } else {
                            console.log('[error] ' + err.message);
                        }

                    });


                    fn.copyFiles(config.basePath + 'init-files/grunt-express/', config.projectPath, function(err) {
                        if (!err) {
                            fn.msg.line().success('文件初始化完成');
                        } else {
                            fn.msg.error(err.message);
                        }
                    }, /node_module|package.json$/i);
                },

                grunt4Optimize: function(){
                    fs.writeFile(config.projectPath + '/package.json', JSON.stringify(packageConfig, null, 4), function(err) {
                        if (!err) {
                            fn.msg.success('文件创建成功 - package.json')
                        } else {
                            console.log('[error] ' + err.message);
                        }

                    });


                    fn.copyFiles(config.basePath + 'init-files/grunt-optimize/', config.projectPath, function(err) {
                        if (!err) {
                            fn.msg.line().success('文件初始化完成');
                        } else {
                            fn.msg.error(err.message);
                        }
                    }, /node_module|package.json$/i);
                }
            };


        inquirer.prompt([{
                name: 'name',
                message: '项目名称',
                type: 'input',
                default: config.projectPath.substr(0, config.projectPath.length - 1).split('/').pop(),

                filter: function(val) {
                    return val.replace(/[-\.\\\/]/g, '');
                }
            }, {
                name: 'version',
                message: '版本',
                default: '1.0.0',
                type: 'input'
            }, {
                name: 'description',
                message: '简介',
                default: '',
                type: 'input'
            }, {
                name: 'author',
                message: '作者',
                default: '',
                type: 'input'
            }, {
                name: 'type',
                message: '模板选择',
                default: 'grunt orginal',
                type: 'list',
                choices: ['grunt for uglify', 'grunt + express', 'grunt orginal']
            }


        ], function(results) {
            packageConfig.name = results.name;
            packageConfig.version = results.version;
            packageConfig.description = results.description;
            packageConfig.author = results.author;

            switch (results.type) {
                case 'grunt for uglify':
                    create.grunt4Uglify();
                    break;

                case 'grunt + express':
                    create.grunt4Express();
                    break;

                case 'grunt orginal':
                    create.grunt4Optimize();
                    break;

                default:
                    break;
            }
        });

    }, ///}

    help: function() {
        fn.help({
            usage: 'jns grunt',
            commands: {
                'init': 'project init'
            },
            options: {
                '-h, --help': 'output usage information'
            }
        });

    }
};



module.exports = function(type) {
    switch (type) {
        case "init":
            gn.init();
            break;

        case "release":
            gn.release();
            break;

        case '-h':
        case '--help':
        default:
            gn.help();
            break;
    }


};
