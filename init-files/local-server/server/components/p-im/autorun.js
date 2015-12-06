var 
    fn = require('../../libs/global.js'),
	config = require('../../config.js');


module.exports = function (app, done) {
    var iPort = config.tool.im.websocket.port;

    // miniIM init
    var wsServer = {
        enable: false,
        server: undefined,
        io: undefined,
        sockets: [],
        port: iPort,
        init: function(){
            var she = this;

            she.server = require('http').createServer();
            she.io = require('socket.io')(she.server);
            she.server.listen(she.port);
            she.io.on('connection', function(socket){
                
                she.sockets.push(socket);

                var header = socket.handshake.headers;

                socket.emit('connect', {
                    'time': new Date(),
                    'address': header.address
                });

                socket.on('disconnect', function () {

                    // 广播 此用户已下线
                    she.send('disconnect', {
                        'time': new Date(),
                        'address': header.address
                    });

                    var index = she.sockets.indexOf(socket);
                    ~index && she.sockets.splice(index, 1);
                });

                socket.on('message', function(data){
                    she.send('message', {
                        'time': new Date(),
                        'address': header.address,
                        'message': data
                    });
                });
            });

            fn.msg.notice('miniIM websocket server start');
            fn.msg.notice('http://'+ config.serverAdress +':'+ iPort);

            she.enable = true;
            done();
        },
        send: function(event, txt){
            var she = this;
            if(!she.sockets.length){
                return;
            }
            she.sockets.forEach(function(socket){
                socket.emit(event, txt);
            });
        } 
    };

    // 执行
    wsServer.init();
};
