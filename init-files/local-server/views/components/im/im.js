function wSocket(op){
    return new wSocket.fn.init(op);
}

wSocket.prototype = wSocket.fn = {
    // 参数设置
    options: {
        // websocket 地址
        interface: window.location.protocol + '//' + window.location.hostname + 8123,

        // 收到信息后回调函数
        onmessage: function(){}，
        
        // 连上后回调函数
        onconnect: function(){}

    },

    // 是否支持
    isSupported: true,

    // socket.io 句柄
    socket: undefined,

    // 初始化
    init: function(op){

        var she = this,
            socket;

        she.setOption(op);

        socket = io(she.interface);

        // test
        socket.on('reload', function(data){
            window.location.reload();
        });


        socket.on('message', function (data) {
            ws.onresend && ws.onresend(data);
        });


        she.socket = socket;
        return she;
    },
    setOption: function(op){
        var she = this,
            iOp = she.options;

        if(!op){
            return;
        }
        for(var key in op){
            if(op.hasOwnProperty(key) && iOp.hasOwnProperty(key)){
                iOp[key] = op[key];
            }
        }
    },

    // 发送
    send: function(data){
        var she = this;

        if(she.socket){
            she.socket.emit('message', data);
        }
    }
};

!function(global, undefined){

    wSocket();
}(this);
