var 
    fn = require('../../libs/global.js'),
	config = require('../../config.js');

module.exports = function (app) {

	// main
	app.get('/map', function(req, res){
        if(req.host != config.serverAdress && config.serverAddress != '127.0.0.1'){
            res.redirect('http://' + config.serverAdress + ':'+ config.port +'/');
            return;
        }

        var iPath = fn.formatPath(config.sitePath + 'static/');

        fn.getPaths(iPath, function(err, list){
            var data = {
                'treeData': fn.pathsFormat(list, '/'),
                'serverAddress': config.serverAdress
            };
            res.render('map/map', data);

        });

    });

};

