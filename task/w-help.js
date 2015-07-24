var color = require('../lib/colors'),
    fn = require('../lib/global');

module.exports = function(type){
    fn.help({
        usage: 'jns',
        commands: {
            'grunt': 'grunt commands',
            'mod': 'modUi commands',
            'release': 'release commands',
            'rename': 'multiple rename tools',
            'reptile': 'web reptile apps',
            'release': 'web produce actions',
            'server': 'local server commands'
        },
        options: {
            '-h, --help': 'output usage information',
            '-v, --version': 'output the version number'
        }
    });

};


