var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    color = require('../lib/colors'),
    wsServer = require('../lib/wsServer'),
    fn = require('../lib/global'),
    config = require('../lib/config');


var render = {
        init: function(filename, content){
            var she = this,
                myExt = filename.split('.').pop();

            switch(myExt){
                case 'html':
                    return render.html(content);

                default:
                    return content;
            }
        },
        html: function(content){
            return wsServer.render(content);
        }

    },
    
    release = {
        init: function(){
            var serverDoc = config.serverPath.replace(/\/$/, ''),
                // server 环境搭建
                serverBuild = function(callback){
                    if (!fs.existsSync(serverDoc)) {
                        fs.mkdirSync(serverDoc);
                    }

                    if(fs.readdirSync(serverDoc).length == 0){
                        fn.copyPathFiles(config.basePath + 'init-files/local-server/', config.serverPath, function() {
                            fn.runCMD('npm install', function(r){
                                if(r.status == 1){
                                    fn.msg.nowrap('_');
                                    callback && callback();
                                }
                            }, config.serverPath);
                        });
                    } else {
                        callback && callback();
                    }
                };

            wsServer.init();

            serverBuild(function(){
                // 文件拷贝
                fn.copyPathFiles(config.projectPath, config.serverPath + 'static/', function(){
                    fn.msg.line().success('release ok, start to watch');
                    watch(config.projectPath, function(filename){
                        var myFile = fn.formatPath(filename).replace(config.projectPath,'');
                        var nowTime = new Date();
                        fn.copyPathFiles(config.projectPath + myFile, config.serverPath + 'static/' + myFile, function(){
                            wsServer.send('reload', 'reload it!');
                        });
                    });
                    
                },/node_modules$/ig, function(filename, textcontent){
                    return render.init(filename, textcontent);
                    
                });
            });
            
        },

        help: function(){
            fn.help({
                usage: 'jns release',
                commands: {
                    '-l': 'release project to localserver with livereload'
                },
                options: {
                    '-h, --help': 'output usage information'
                }
            });
            
        }
    };

module.exports = function(type) {
    switch (type) {
        case '-l':
            release.init();
            break;
       
        case '-h':
        case '--help':
        default:
            release.help();
            break;
        
    }


};

