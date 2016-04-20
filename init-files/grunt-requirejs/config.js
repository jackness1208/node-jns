'use strict';
var 
    config = {
        'proj': {
            src: './src',
            dest: './dist',
            // requirejs: false,
            requirejs: {
                mainConfigFile: '{$src}/js/rConfig/rConfig.js',
                files: {
                    '{$dest}/js/p-index.js': ['{$src}/js/p-index.js'],
                }
            },
            // concat: {
            //     '{$dest}/js/p-index.js': ['{$src}/js/lib/require.js', '{$dest}/js/p-index.js']
            // },
            copy: {
                '{$src}/js/lib': ['{$dest}/js/lib'],
                '{$src}/js/rConfig': ['{$dest}/js/rConfig'],
            }
            
        }
    };

module.exports = config;
