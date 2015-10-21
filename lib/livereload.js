!function(){

    var mySrc = document.scripts[document.scripts.length - 1].src,
        myPort = '',
        myIp = mySrc.replace(/^http:\/\//,'').replace('/.+$','');

    mySrc.replace(/:\d+/, function(port){
        myPort = port;
    });

    // var socket = io('http://' + myIp + myPort);
    var socket = io(window.location.protocol + '//' + window.location.hostname + myPort);
    socket.on('reload', function(data){
        window.location.reload();
    });

    socket.on('news', function (data) {
        window.console && console.info(data);
    });

    socket.on('message', function (data) {
        ws.onresend && ws.onresend(data);
    });

    var ws = {
            onresend: undefined,
            send: function(data){
                socket.emit('message', data);

            },

            onmessage: function(fn){
                ws.onresend = fn;
            }

        };

    window.__websocket = ws;

}();
