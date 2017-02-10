var chalk = require('chalk');
var fs = require('fs-extra');
var path = require('path');

function createGraphQLServer(name, verbose) {
    var root = path.resolve(name); //Full path
    var appName = path.basename(root); //last name in path string
    console.log('Creating GraphQL Server ' + chalk.green(appName) + ' in ' + chalk.blue(root) );

}

// Allows us to call this function from outside of the library file.
// Without this, the function would be private to this file.
exports.createGraphQLServer = createGraphQLServer;




