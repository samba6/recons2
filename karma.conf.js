module.exports = function(config) {
  "use strict";

  config.set({
    basePath: '',

    autowatch: true,

    files: [
      './bower_components/angular/angular.js',
      './bower_components/angular-mocks/angular-mocks.js',
      './karma-all-webpack-tests.js'
    ],

    preprocessors: {
      './karma-all-webpack-tests.js': ['webpack'],
      '**/*.html': ['ng-html2js']
    },

    browsers: ['Chrome'],

    webpack: require('./webpack.config.base.js').webpackTestConfig,

    webpackMiddleware: {
      noInfo: true
    },

    plugins: [
      require('karma-webpack'),
      require('karma-jasmine'),
      require("istanbul-instrumenter-loader"),
      require('karma-coverage'),
      require("karma-chrome-launcher"),
      require("karma-phantomjs-launcher")
    ],

    frameworks: ['jasmine'],

    logLevel: config.LOG_INFO
  })
}
