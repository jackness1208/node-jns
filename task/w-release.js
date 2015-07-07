var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    global = require('../lib/global'),
    color = require('../lib/colors'),
    fn = global.fn,
    pg = global.pg;


var render = {
        html: function(content){
            content += '\n' + [
                '<script src="http://'+ pg.serverAdress +':'+ pg.livereload.serverPort +'/socket.io/socket.io.js"></script>',
                '<script src="http://'+ pg.serverAdress +':'+ pg.livereload.serverPort +'/livereload.js"></script>'
            ].join("\n");
            return content;
        }

    },
    release = {
        init: function(){
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
                serverDoc = pg.serverPath.replace(/\/$/, ''),
                // server 环境搭建
                serverBuild = function(callback){
                    if (!fs.existsSync(serverDoc)) {
                        fs.mkdirSync(serverDoc);
                    }

                    if(fs.readdirSync(serverDoc).length == 0){
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

            server.listen(pg.livereload.serverPort);

            serverBuild(function(){
                // 文件拷贝
                fn.copyPathFiles(pg.projectPath, pg.serverPath + 'static/', function(){
                    fn.msg.line().success('release ok, start to watch');
                    watch(pg.projectPath, function(filename){
                        var myFile = fn.formatPath(filename).replace(pg.projectPath,'');
                        
                        var nowTime = new Date();
                        fn.copyPathFiles(pg.projectPath + myFile, pg.serverPath + myFile, function(){
                            io.emit('reload');
                        });
                    });
                    
                },/node_modules$/ig, function(filename, textcontent){
                    if(/\.html$/.test(filename)){
                        return render.html(textcontent);
                    
                    } else {
                        return textcontent;
                    }
                });
            });
            
        },

        help: function(){
            console.log([
                '',
                '  Usage: jns release <command>',
                '',
                '  Commands:',
                '    -l   release project to localserver with livereload',
                '',
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

