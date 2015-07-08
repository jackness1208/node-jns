var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');

module.exports = function(){
    fn.runCMD('npm install', function(r){
        if(r.status == 1){
            fn.msg.line().success('all is done');
        } else {
            fn.msg.error('fff:' + r.error);
        }
    }, config.projectPath);
};
