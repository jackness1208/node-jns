'use strict';
var 
    config = {
        'proj': {
            // requirejs: false,
            requirejs: {
                configFile: '{$src}/js/rConfig/rConfig.js',
                files: {
                    '{$dest}/js/index.js': ['{$src}/js/index.js'],
                }
            },
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
