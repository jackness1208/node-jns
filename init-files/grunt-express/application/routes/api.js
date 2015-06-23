var global = require('../libs/global'),
	config = require('../config/config'),
	mysql = require('mysql'),
	crypto = require('crypto'),
	http = require('http'),
	fs = require('fs');

module.exports = {
    test: function(req, res){
        var r = {
            status: 1
        };
        r.name = req.body.name;
        r.date = req.body.date;

        res.send(JSON.stringify(r));
    },
};
