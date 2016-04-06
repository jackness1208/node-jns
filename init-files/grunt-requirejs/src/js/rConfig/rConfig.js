'use strict';
var 
    require = {
        paths: {
            // widget
            rotate: '../../js/w-rotate',
        },
        shim: {
            // rotate: {
            //     exports: 'rotate'
            // }
        }
    };

if(typeof module === "object" && typeof module.exports === 'object'){
    module.exports = require;
}
