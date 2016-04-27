'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/hjymean-dev',
    options: {
    	promiseLibrary: global.Promise
    }
  },

  // Seed database on startup
  seedDB: true

};
