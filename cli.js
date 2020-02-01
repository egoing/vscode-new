#! /usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;
var meow = require('meow');
const os = require('os');

const cli = meow(`
	Usage
	  $ vscode-new [project name's prefix]

	Options
      --no-code, -nc run without vscode
      --path, -p 
      --no-suffix, -ns
	Examples
      $ npx vscode-new 'react'  create directory to /tmp/react__2020-2-1--5-28-16 and launch vscode
      $ npx vscode-new --no-code  create directory to /tmp/react__2020-2-1--5-28-16 and not launch vscode
      $ npx vscode-new --path '~/dev/'  create directory to ~/dev/react__2020-2-1--5-28-16 and launch vscode 
`, {
    flags: {
        'no-code': {
            alias: 'nc'
        },
        path: {
            alias: 'p'
        }, 
        'no-suffix':{
            alias: 'ns'
        }
    }
});

function resolveHome(filepath) {
    var path = require('path');
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}

const tempDirectorySymbol = Symbol.for('__RESOLVED_TEMP_DIRECTORY__');
if (!global[tempDirectorySymbol]) {
    Object.defineProperty(global, tempDirectorySymbol, {
        value: fs.realpathSync(os.tmpdir())
    });
}



var basePath = null;
if(cli.flags.path === undefined){
    basePath = global[tempDirectorySymbol];
} else {
    basePath = resolveHome(cli.flags.path);
}

var fileName = [];
if(cli.input.length>0){
    fileName = cli.input;
}

if (cli.flags.suffix === undefined) {
    var m = new Date();
    var suffix = m.getUTCFullYear() +"-"+ (m.getUTCMonth()+1) +"-"+ m.getUTCDate() + "--" + m.getUTCHours() + "-" + m.getUTCMinutes() + "-" + m.getUTCSeconds();
    fileName.push(suffix);
}

var newDirName = basePath+'/'+fileName.join('_');

fs.mkdirSync(newDirName, 0744);
var commands = [
    `cd ${newDirName}`
]
if (cli.flags.code === undefined) {
    commands.push(`code ${newDirName}`);
}
exec(commands.join('&&'), function callback(error, stdout, stderr) {
    if (error) {
        console.log('error : ' + error);
    }
    console.log("Created temp project in " + newDirName);
});
