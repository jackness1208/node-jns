var fs = require('fs'),
    fn = require('./global'),
    config = require('./config');
var wsServer = {
        server: undefined,
        io: undefined,
        socket: undefined,
        port: config.watch.port,
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
        },
        send: function(event, txt){
            var she = this;
            if(!she.socket){
                return;
            }
            she.socket.emit(event, txt);
        },
        render: function(content){
            var she = this;
            content += '\n' + [
                '<script src="http://'+ config.serverAdress +':'+ she.port +'/socket.io/socket.io.js"></script>',
                '<script src="http://'+ config.serverAdress +':'+ she.port +'/livereload.js"></script>'
            ].join("\n");
            return content;
        }
    };

module.exports = wsServer;
