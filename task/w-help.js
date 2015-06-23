var color = require('../lib/colors'); 

module.exports = function(type){
    console.log([
        '',
        '  Usage: jns <command>',
        '',
        '  Commands:',
        '',
        '    grunt   grunt commands',
        '    mod     modUi commands',
        '',
        '  Options:',
        '',
        '    -h, --help      output usage information',
        '    -v, --version   output the version number',
        ''
    ].join("\n"))

};


