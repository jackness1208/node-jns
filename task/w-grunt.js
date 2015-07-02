var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    global = require('../lib/global'),
    color = require('../lib/colors'),
    fn = global.fn,
    pg = global.pg;

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
                    fs.writeFile(pg.projectPath + '/package.js', JSON.stringify(packageConfig, null, 4), function(err) {
                        if (!err) {
                            fn.msg.success('文件创建成功 - package.js')
                        } else {
                            console.log('[error] ' + err.message);
                        }

                    });

                    fn.copyPathFiles(pg.basePath + 'init-files/grunt-uglify/', pg.projectPath, function(err) {
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

                    fs.writeFile(pg.projectPath + '/package.js', JSON.stringify(packageConfig, null, 4), function(err) {
                        if (!err) {
                            fn.msg.success('文件创建成功 - package.js')
                        } else {
                            console.log('[error] ' + err.message);
                        }

                    });


                    fn.copyPathFiles(pg.basePath + 'init-files/grunt-express/', pg.projectPath, function(err) {
                        if (!err) {
                            fn.msg.line().success('文件初始化完成');
                        } else {
                            fn.msg.error(err.message);
                        }
                    }, /node_module|package.js$/i);
                }
            };


        inquirer.prompt([{
                name: 'name',
                message: '项目名称',
                type: 'input',
                default: pg.projectPath.substr(0, pg.projectPath.length - 1).split('/').pop(),

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
                default: 'grunt for uglify',
                type: 'list',
                choices: ['grunt for uglify', 'grunt + express', ]
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

                default:
                    break;
            }
        });

    }, ///}


    release: function() {
        var server = require('http').createServer(function(req, res){
                if(req.url == '/livereload.js'){
                    res.writeHead(200, { 
                        'Content-Type': 'application/x-javascript'
                    });
                    res.write(fs.readFileSync(pg.basePath + 'lib/livereload.js'));
                    res.end();
                }
            }),
            io = require('socket.io')(server),
            serverPort = 8123,
            serverDoc = pg.serverPath.replace(/\/$/, ''),
            // server 环境搭建
            serverBuild = function(callback){
                if (!fs.existsSync(serverDoc)) {
                    fs.mkdirSync(serverDoc);
                    
                    fn.copyPathFiles(pg.basePath + 'init-files/local-server/', pg.serverPath, function() {
                        fn.runCMD('npm install', function(r){
                            if(r.status == 1){
                                fn.msg.nowrap('_');
                                callback && callback();
                            }
                        }, pg.serverPath);
                    });
                } else {
                    callback && callback();
                }
            };

        server.listen(serverPort);

        var nowTime = new Date();
            
        fn.msg.nowrap(color.green('* '), true);
        serverBuild(function(){
            // 文件拷贝
            fn.copyPathFiles(pg.projectPath, pg.serverPath + 'static/', function(){
                fn.msg.nowrap(color.green(' ' + (new Date() - nowTime) + 'ms\n'));
                watch(pg.projectPath, function(filename){
                    var myFile = fn.formatPath(filename).replace(pg.projectPath,'');
                    
                    var nowTime = new Date();
                    fn.copyPathFiles(pg.projectPath + myFile, pg.serverPath + myFile, function(){
                        fn.msg.nowrap(color.green(' ' + (new Date() - nowTime) + 'ms\n'));
                        io.emit('reload');
                    });
                });
                
            }, function(filename, textcontent){
                console.log(filename);
                if(/\.html$/.test(filename)){
                    textcontent += '\n' + [
                        '<script src="http://'+ pg.serverAdress +':'+ serverPort +'/socket.io/socket.io.js"></script>',
                        '<script src="http://'+ pg.serverAdress +':'+ serverPort +'/livereload.js"></script>'
                    ].join("\n");
                } else {
                    return textcontent;
                }
            });
        });
        
    },

    help: function() {
        console.log([
            '',
            '  Usage: jns grunt <command>',
            '',
            '  Commands:',
            '',
            '    init     project init',
            '    release  release project to the local server path',
            '',
            '  Options:',
            '',
            '    -h, --help      output usage information',
            ''
        ].join("\n"));

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
