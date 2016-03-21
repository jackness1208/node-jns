'use strict';

var 
    fn = require('../lib/global');

var 
    attributes = {
        help: function(){
            fn.help({
                usage: 'jns',
                commands: {
                    'init': 'project init commands',
                    'release': 'release commands',
                    'server': 'local server commands'
                },
                options: {
                    '-h, --help': 'output usage information',
                    '-v, --version': 'output the version number'
                }
            });
        },

        version: function(){
            console.log([
                '',
                '+------------------------+',
                '|    node-jns  2.0.0    |',
                '+------------------------+',
                ''
            ].join("\n"));
        }

    };

module.exports = function(ctx){
    switch(ctx){
        case '-v': 
        case '--version':
            attributes.version();
            break;

        case '-h':
        case '--help':
            attributes.help();
            break;


        default:
            attributes.help();
            break;
    }
};
