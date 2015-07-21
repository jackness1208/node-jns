var mySrc = document.scripts[document.scripts.length - 1].src,
    myPort = '',
    myIp = mySrc.replace(/^http:\/\//,'').replace('/.+$','');

mySrc.replace(/:\d+/, function(port){
    myPort = port;
});

setTimeout(function(){
    var socket = io('http://' + myIp + myPort);
    socket.on('news', function(data){
        socket.emit('my other event', { my: 'data' });
    });

    socket.on('reload', function(data){
        window.location.reload();
    });
}, 2000)

