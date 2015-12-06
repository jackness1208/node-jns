module.exports = {
    // 压缩用配置参数
    optimize: {
        // sass
        sass: {
            options : {
                sourcemap: 'none'
            },
            all: {
                files: [{
                    expand: true,
                    cwd: 'components',
                    src: ['*/*.scss'],
                    dest: 'components',
                    ext: '.css'

                }]
            }
        },
        requirejs: {
            options: {
                // appDir: 'src/',
                mainConfigFile: "components/r-config/r-config.js",
                generateSourceMaps: true,
                preserveLicenseComments: false,
                optimize: "uglify2",
            },
            
            'im': {
                options: {
                    baseUrl: "components/p-im/",
                    name: "p-im",
                    out: "components/p-im/p-im.min.js",
                }
            },
            'map': {
                options: {
                    baseUrl: "components/p-map/",
                    name: "p-map",
                    out: "components/p-map/p-map.min.js",
                }

            }
           
        }
    },
    devDependencies: ['grunt-contrib-sass']

};

