var fs = require('fs-extra');
var path = require('path');
var spawn = require('cross-spawn');
var chalk = require('chalk');

module.exports = function(appPath, appName, verbose, originalDirectory) {
  var appPackage = require(path.join(appPath, 'package.json'));
  var useYarn = shouldUseYarn();

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.devDependencies = appPackage.devDependencies || {};

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

  var command;
  var args;

  //devDependencies
  console.log('Installing devDependencies using ' + command + '...');
  console.log('');
  if (useYarn) {
    command = 'yarnpkg';
    args = [ 'add', '--dev', '--exact', packageToInstall];
  } else {
    command = 'npm';
    args = [
      'install',
      '--save-dev',
      '--save-exact',
      verbose && '--verbose'
    ].filter(function(e) { return e; });
  }
  args.push('babel-cli', 
            'babel-core',
            'babel-eslint',
            'babel-loader',
            'babel-preset-es2015',
            'babel-preset-react',
            'babel-preset-stage-2',
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
            
  var proc = spawn(command, args, {stdio: 'inherit'});
  proc.on('close', function (code) {
    if (code !== 0) {
      console.error('`' + command + ' ' + args.join(' ') + '` failed');
      return;
    }
  });            

  // dependencies
  console.log('Installing dependencies using ' + command + '...');
  console.log('');

  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
  } else {
    command = 'npm';
    args = [
      'install',
      '--save',
      verbose && '--verbose'
    ].filter(function(e) { return e; });
  }
  args.push('express', 
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

 

  var proc = spawn(command, args, {stdio: 'inherit'});
  proc.on('close', function (code) {
    if (code !== 0) {
      console.error('`' + command + ' ' + args.join(' ') + '` failed');
      return;
    }

    // Display the most elegant way to cd.
    // This needs to handle an undefined originalDirectory for
    // backward compatibility with old global-cli's.
    var cdpath;
    if (originalDirectory &&
        path.join(originalDirectory, appName) === appPath) {
      cdpath = appName;
    } else {
      cdpath = appPath;
    }

    console.log();
    console.log('Success! Created ' + appName + ' at ' + appPath);
    console.log('Inside that directory, you can run several commands:');
    console.log();
    console.log(chalk.cyan('  ' + command + ' start'));
    console.log('    Starts the development server.');
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), cdpath);
    console.log('  ' + chalk.cyan(command + ' start'));
    console.log();
    console.log('Happy hacking!');
  });
}


function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', {stdio: 'ignore'});
    return true;
  } catch (e) {
    return false;
  }
}