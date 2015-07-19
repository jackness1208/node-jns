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

        init: function(){
            var she = this;
            she.server = require('http').createServer(function(req, res){
                if(req.url == '/livereload.js'){
                    res.writeHead(200, { 
                        'Content-Type': 'application/x-javascript'
                    });
                    res.write(fs.readFileSync(config.basePath + 'lib/livereload.js'));
                    res.end();
                }
            });
            she.io = require('socket.io')(she.server);
            she.server.listen(she.port);
            she.io.on('connection', function(socket){
                she.socket = socket;
            });
            fn.msg.line().success('websocket server start');
            she.scripts.forEach(function(src){
                fn.msg.notice(src);
            });
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
                    break;
            }
            
            return content;
        }
    };

module.exports = wsServer;
