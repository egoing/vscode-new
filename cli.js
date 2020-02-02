#! /usr/bin/env node
var fs = require('fs');
var exec = require('child_process').exec;
var meow = require('meow');
const os = require('os');
const city = require('./city');
const Conf = require('conf');
const config = new Conf({
    projectName:'vscode-new'
});
var list = config.get('vscode-new-list');

const cli = meow(`
	Usage
      $ cod-ing new [project name] 
      $ cod-ing list 
      $ cod-ing run 

	Options
      --no-code, -nc run without vscode
      --path, -p 
      --no-suffix, -ns
	Examples
      $ npx vscode-new 'react'  create directory to /tmp/react__[city name] and launch vscode
      $ npx vscode-new --no-code  create directory to /tmp/react__[city name] and not launch vscode
      $ npx vscode-new --path '~/dev/'  create directory to ~/dev/react__[city name] and launch vscode 
`, {
    flags: {
        'no-code': {
            alias: 'nc'
        },
        path: {
            alias: 'p'
        },
        'no-suffix': {
            alias: 'ns'
        }
    }
});

function getDirName() {
    function resolveHome(filepath) {
        var path = require('path');
        if (filepath[0] === '~') {
            return path.join(process.env.HOME, filepath.slice(1));
        }
        return filepath;
    }

    const tempDirectorySymbol = getTempDir();

    var basePath = null;
    if (cli.flags.path === undefined) {
        basePath = global[tempDirectorySymbol];
    } else {
        basePath = resolveHome(cli.flags.path);
    }

    var fileName = [];
    // ex cod-ing new test
    if (cli.input[1] !== undefined) {
        fileName = cli.input[1];
    } else {
        var m = new Date();
        var fileName = city[Math.floor(Math.random() * city.length)];
    }

    return basePath + '/' + fileName;
}
function getTempDir() {
    const tempDirectorySymbol = Symbol.for('__RESOLVED_TEMP_DIRECTORY__');
    if (!global[tempDirectorySymbol]) {
        Object.defineProperty(global, tempDirectorySymbol, {
            value: fs.realpathSync(os.tmpdir())
        });
    }
    return tempDirectorySymbol;
}

function project_list() {
    var list = config.get('vscode-dir-list');
    var Table = require('cli-table3');
    var table = new Table({
        head: ['id', 'path']
    });
    for (var i = 0; i < list.length; i++) {
        table.push([i, list[i].path]);
    }
    console.log(table.toString());
}
function project_run(path){
    var commands = [
        `cd ${path}`
    ]
    if (cli.flags.code === undefined) {
        commands.push(`code ${path}`);
    }
    exec(commands.join('&&'), function callback(error, stdout, stderr) {
        if (error) {
            console.log('error : ' + error);
        }
        var list = config.get('vscode-dir-list');
        list = list === undefined ? [] : list;
        list = list.filter(function(e){
            return e.path !== path;
        })
        list.unshift({
            path: path,
            run: 'vscode',
            arr: []
        });
        config.set('vscode-dir-list', list);
        console.log("Open temp project in " + path);
    });
}
if (cli.input[0] === "list") {
    project_list();
} else if (cli.input[0] === "run") {
    project_list();
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Select the id number you want to run. ", function(id) {
        var list = config.get('vscode-dir-list');
        project_run(list[Number(id)].path);
        rl.close();
    });
} else if(cli.input[0] === undefined || cli.input[0] === "new" || cli.input[0] === "create" || cli.input[0] === "make"){
    var newDirName = getDirName();
    if(!fs.existsSync(newDirName)){
        fs.mkdirSync(newDirName);
    }
    project_run(newDirName);
}