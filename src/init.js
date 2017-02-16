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

  console.log('');
  console.log('Installing devDependencies...');
  installDevDependencies()
    .then(() => {
      console.log(chalk.cyan('devDependencies successfully installed!'));
    })
    .catch((e) => {
      console.error('Uncaught error in installing devDependencies!');
      console.error(e);
      console.trace(e);
    });

  console.log('');
  console.log('Installing dependencies...');
  installDependencies()
    .then(() => {
      var cdpath;
      if (originalDirectory &&
        path.join(originalDirectory, appName) === appPath) {
        cdpath = appName;
      } else {
        cdpath = appPath;
      }

      console.log(chalk.cyan('dependencies successfully installed!'));
      console.log();
      console.log('Success! Created ' + appName + ' at ' + appPath);
      console.log('Inside that directory, you can run several commands:');
      console.log();
      console.log(chalk.cyan('  yarn start'));
      console.log('    Starts the development server.');
      console.log();
      console.log('We suggest that you begin by typing:');
      console.log();
      console.log(chalk.cyan('  cd'), cdpath);
      console.log('  ' + chalk.cyan('yarn start'));
      console.log();
      console.log('Happy hacking!');
    })
    .catch((e) => {
      console.error('Uncaught error in installing dependencies!');
    });
}

async function installDevDependencies() {
  var args = ['add', '--dev'];
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

  var proc = await spawn.sync('yarn', args, {
    stdio: 'inherit'
  });
}

async function installDependencies() {
  var args = ['add'];
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

  var proc = await spawn.sync('yarn', args, {
    stdio: 'inherit'
  });
}