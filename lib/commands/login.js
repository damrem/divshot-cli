var request = require('request');
var winston = require('winston');
var reqular = require('regular');
var cli = require('../divshot');
var Divshot = require('divshot');

var internals = {
  userConfig: cli.config.stores.user,
  
  schema: {
    properties: {
      email: {
        pattern: reqular.email,
        required: true
      },
      password: {
        hidden: true,
      }
    }
  },
  
  saveToken: function (token, callback) {
    internals.userConfig.set('token', token);
    internals.userConfig.save(callback);
  },
  
  initLogin: function (callback) {
    return function (err, userInput) {
      if (err) {
        return winston.error(err.message.red);
      }
      
      var divshot = Divshot.createClient({
        email: userInput.email,
        password: userInput.password
      });
      
      divshot.user.authenticate(function (err, token) {
        if (err) {
          return winston.error('Invalid email or password'.red);
        }
        
        internals.saveToken(token, callback);
      });
    };
  }
  
};

module.exports = function (callback) {
  cli.prompt.get(internals.schema, internals.initLogin(function () {
    winston.info('Authentication Successful'.green);
    callback();
  }));
};

module.exports.internals = internals;
module.exports.usage = ['Login to the Divshot api'];