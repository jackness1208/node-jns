var 
    config = require('../../config.js');

module.exports = function(app){
    app.get('/im', function(req, res){
        if(req.host != config.serverAdress && config.serverAddress != '127.0.0.1'){
            res.redirect('http://' + config.serverAdress + ':'+ config.port +'/im');
            return;
        }
		// 地址重定向
        res.render('p-im/p-im', {"config": config});

    });

};
