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
        staticServer: function(){
            fn.timer.start();
            var serverDoc = config.serverPath.replace(/\/$/, ''),
                // server 环境搭建
                serverBuild = function(callback){
                    if (!fs.existsSync(serverDoc)) {
                        fs.mkdirSync(serverDoc);
                    }

                    fn.copyFiles(config.basePath + 'init-files/local-server/', config.serverPath, function() {
                        callback && callback();
                        
                    });
                },
                docTreeBuild = function(callback){
                    fn.getPaths(config.projectPath, function(err, list){
                        var targetFile = config.serverPath + 'tpl/main/home.html',
                            sourceFile = config.basePath + 'init-files/local-server/tpl/main/home.html',
                            options = {
                                'treeData': fn.pathsFormat(list, '/'),
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

            wsServer.init();

            serverBuild(function(){
                // 文件拷贝
                fn.copyFiles(config.projectPath, config.serverPath + 'static/', function(){
                    docTreeBuild(function(){
                        fn.timer.end();
                        fn.msg.line().success('release ok, start to watch');
                        
                        watch(config.projectPath, function(filename){
                            fn.timer.start();
                            var myFile = fn.formatPath(filename).replace(config.projectPath,'');

                            fn.copyFiles(config.projectPath + myFile, config.serverPath + 'static/' + myFile, function(){
                                docTreeBuild(function(){
                                    wsServer.send('reload', 'reload it!');
                                    fn.timer.end();   
                                });

                            }, function(filename, textcontent){
                                return render.init(filename, textcontent);
                            });
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
            release.staticServer();
            break;
       
        case '-h':
        case '--help':
        default:
            release.help();
            break;
        
    }


};

