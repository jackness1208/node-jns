var global = require('../libs/global'),
	config = require('../config/config');


module.exports = {
    // im 工具
    im: function(req, res){
        if(req.host != config.serverAdress && config.serverAddress != '127.0.0.1'){
            res.redirect('http://' + config.serverAdress + ':'+ config.port +'/im');
            return;
        }
		// 地址重定向
        res.render('tool/im', {"config": config});
    }
};

