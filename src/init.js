var fs = require('fs-extra');
var path = require('path');
var spawn = require('cross-spawn');
var chalk = require('chalk');

module.exports = function (appPath, appName, verbose, originalDirectory) {
  var appPackage = require(path.join(appPath, 'package.json'));

  // Setup the script rules
  appPackage.scripts = {
    'start': 'babel-node index.js',
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  // Copy the files for the user
  var templatePath = path.join("..", 'template');
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath);
  } else {
    console.error('Could not locate supplied template: ' + chalk.green(templatePath));
    return;
  }


  install(installDependencies);
}



function install(callback) {
  var command;
  var args;
  command = 'yarn';
  args = [ 'add', '--dev'];
  args.push(
      'babel-cli',
      'babel-core',
      'babel-eslint',
      'babel-loader',
      'babel-plugin-inline-import',
      'babel-polyfill',
      'babel-preset-es2015',
      'babel-preset-es2017',
      'babel-preset-react',
      'babel-preset-stage-0',
      'babel-register',
      'chai',
      'eslint',
      'eslint-config-react-app',
      'eslint-plugin-babel',
      'eslint-plugin-flowtype',
      'eslint-plugin-import',
      'eslint-plugin-jsx-a11y',
      'eslint-plugin-react',
      'mocha',
      'node-fetch',
      'nodemon');

  var child = spawn(command, args, {stdio: 'inherit'});
  child.on('close', function() {
    callback();
  });
}






function installDevDependencies() {
  var args = ['add', '--dev'];
  args.push(
    'babel-cli',
    'babel-core',
    'babel-eslint',
    'babel-loader',
    'babel-plugin-inline-import',
    'babel-polyfill',
    'babel-preset-es2015',
    'babel-preset-es2017',
    'babel-preset-react',
    'babel-preset-stage-0',
    'babel-register',
    'chai',
    'eslint',
    'eslint-config-react-app',
    'eslint-plugin-babel',
    'eslint-plugin-flowtype',
    'eslint-plugin-import',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-react',
    'mocha',
    'node-fetch',
    'nodemon');

  var proc = spawn('yarn', args, {
    stdio: 'inherit'
  });
}

function installDependencies() {
  var args = ['add'];
  args.push(
    'express',
    'express-session',
    'body-parser',
    'cors',
    'lodash',
    'graphql',
    'graphql-tools',
    'graphql-server-express',
    'mongodb',
    'mongo-find-by-ids',
    'dataloader',
    'dotenv',
    'request-promise');

  var proc = spawn('yarn', args, {
    stdio: 'inherit'
  });
}