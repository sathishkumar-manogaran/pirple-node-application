/*
 * Create and Configure environment variables
 */

// Construct for all the environments
var environments = {};

// Staging Object (default environment)
environments.stage = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'stage'
};

// Production Environment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
};

// Determine which env passed on command line arguments
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the above, if not, default to stage
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.stage;


// Export the module
module.exports = environmentToExport;