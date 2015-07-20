var fs = require('fs'),
    fn = require('./global'),
    config = require('./config');
var wsServer = {
        enable: false,
        server: undefined,
        io: undefined,
        socket: undefined,
        port: config.webSocket.port,
        
        scripts: [
            'http://'+ config.serverAdress +':'+ config.webSocket.port +'/socket.io/socket.io.js',
            'http://'+ config.serverAdress +':'+ config.webSocket.port +'/livereload.js'
        ],

        proxyAPI: '/proxy',

        init: function(){
            var she = this;
            she.server = require('http').createServer(function(req, res){
                
                if(req.url == '/livereload.js'){ // liveload.js 文件
                    res.writeHead(200, { 
                        'Content-Type': 'application/x-javascript'
                    });
                    res.write(fs.readFileSync(config.basePath + 'lib/livereload.js'));
                    res.end();
                

                } else if(String(req.url).replace(/\?.*$/g, '') == wsServer.proxyAPI){ // 代理接口
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    var proxyUrl = req.url.replace(/^[^?]*[?]/g,'');

                    if(/^http[s]?:\/\//.test(proxyUrl)){
                        fn.get(proxyUrl, {}, function(content){
                            res.write(wsServer.render(proxyUrl, content));
                            res.end();
                        });

                    } else {
                        res.write(proxyUrl + ' 代理失败，地址格式不正确');
                        res.end();
                    }

                } else { // 404
                    res.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
                    res.end();
                }
                
                
            });
            she.io = require('socket.io')(she.server);
            she.server.listen(she.port);
            she.io.on('connection', function(socket){
                she.socket = socket;
            });
            // she.scripts.forEach(function(src){
            //     fn.msg.notice(src);
            // });
            fn.msg.success('websocket server start');
            fn.msg.notice('代理地址：');
            fn.msg.notice('http://'+ config.serverAdress +':'+ config.webSocket.port + wsServer.proxyAPI + '?http://www.jackness.org');
            she.enable = true;
        },
        send: function(event, txt){
            var she = this;
            if(!she.socket){
                return;
            }
            she.socket.emit(event, txt);
        },
        render: function(file, content){
            var she = this,
                fileExt = file.split('.').pop();
            
            switch(fileExt){
                case 'html':
                    she.scripts.forEach(function(src){
                        content += '\n<script src="'+ src +'"></script>';
                    });
                    break;

                default:
                    if(/^http[s]?:\/\//.test(file)){
                        she.scripts.forEach(function(src){
                            content += '\n<script src="'+ src +'"></script>';
                        });
                    }
                    break;
            }
            
            return content;
        }
    };

module.exports = wsServer;
