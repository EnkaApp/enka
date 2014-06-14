
module.exports = {
  development: {
    options: {
      paths: ['<%= config.app %>/assets/styles'],
      rootpath: ''
    },
    files: {
      '<%= config.app %>/styles/app.css': '<%= config.app %>/assets/styles/app.less'
    }
  },
  production: {
    options: {
      paths: ['assets/styles'],
      cleancss: true
    },
    files: {
      'styles/app.css': 'assets/styles/app.less'
    }
  }
};