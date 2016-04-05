'use strict';
var 
    config = {
        'proj': {
            requirejs: false,
            src: './src',
            dest: './dist',
            concat: {
                '{$src}/js/mix.js': ['{$src}/js/index.js', '{$src}/js/second.js']
            },
            copy: {
                '{$src}/js': ['{$dest}/js']
            }
            
        }
    };

module.exports = config;
