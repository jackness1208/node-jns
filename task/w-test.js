var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    global = require('../lib/global'),
    color = require('../lib/colors'),
    fn = global.fn,
    pg = global.pg;

module.exports = function(){
    fn.runCMD('npm install', function(r){
        if(r.status == 1){
            fn.msg.line().success('all is done');
        } else {
            fn.msg.error('fff:' + r.error);
        }
    }, pg.projectPath);
};
