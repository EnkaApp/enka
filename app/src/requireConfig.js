/*globals require*/
require.config({
    shim: {
      
    },
    paths: {
        famous: '../lib/famous',
        requirejs: '../lib/requirejs/require',
        almond: '../lib/almond/almond',
        lodash: '../lib/lodash/dist/lodash.compat'
    },
    packages: [

    ]
});
require(['main']);
