// Copies remaining files to places other tasks can use
module.exports = {
  dist: {
    files: [
      {
        expand: true,
        dot: true,
        cwd: '<%= config.app %>',
        dest: '<%= config.dist %>',
        src: [
          '.htaccess',
          'lib/famous/**/**.css'
        ]
      },

      {
        expand: true,
        cwd: '<%= config.app %>/assets',
        dest: '<%= config.dist %>',
        src: [
          'images/*.png',
          'images/{,*/}*.png'
        ]
      },

      {
        expand: true,
        cwd: '<%= config.app %>/assets',
        dest: '<%= config.dist %>',
        src: [
          'fonts/*'
        ]
      }
    ]
  }
};
