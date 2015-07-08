var mySrc = document.scripts[document.scripts.length - 1].src,
    myPort = '';

mySrc.replace(/:\d+/, function(port){
    myPort = port;
});

var socket = io('http://' + location.hostname + myPort);
socket.on('news', function(data){
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});

socket.on('reload', function(data){
    console.log(data);
    window.location.reload();
});
