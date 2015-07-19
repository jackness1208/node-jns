var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');

module.exports = function(){
    
    var promise = new fn.promise();

    promise.then(function(resolve){
        console.log('w1');
        resolve();

    }).then(function(resolve){
        console.log('w2')
        setTimeout(function(){
            resolve();
        }, 2000);

    }).then(function(resolve){
        console.log('w3');
    }).start();
    console.log('?');
};


