var inquirer = require("inquirer"),
    readline = require('readline'),
    watch = require('node-watch'),
    fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');

module.exports = function(){
    fn.getPaths(config.projectPath, function(err, list){
        var r = [],
            pathObj = {},
            dataBuild = function(obj){
                var r = [];    
                for(var key in obj){
                    if(obj.hasOwnProperty(key)){
                        if(typeof obj[key] == 'object'){
                            r.push({
                                name: key,
                                items: dataBuild(obj[key])
                            });
                        } else {
                            r.push({
                                name: key,
                                href: obj[key]
                            });
                        }
                    }
                }
                return r;
            };

        list.forEach(function(pathstr, i){
            var arr = pathstr.split('/'),
                myObj = pathObj;
            arr.forEach(function(path, i){
                if(i != arr.length - 1){
                    !myObj[path] && (myObj[path] = {});
                    myObj = myObj[path];

                } else {
                    myObj[path] = pathstr;
                }
            });
            
        });

        console.log(dataBuild(pathObj))
    });
};


