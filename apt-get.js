#!/usr/bin/env node

/**
 * Pointless apt-get -> homebrew wrapper
 * @module apt-brew-wrapper
 */

const argv = require('yargs');
const exec = require('child_process').spawn;
const sys = require('util');

let mapper = {
    update: 'update',
    upgrade: 'upgrade',
    'dist-upgrade': 'upgrade',
    install: 'install',
    remove: 'uninstall'
}

let cmd = [];

cmd.push(mapper[process.argv[2]]);

if(typeof cmd[0] === 'undefined'){
    cmd[0] = process.argv[2];
}

if(typeof cmd[0] === 'undefined'){
    cmd[0] = '--help';
}

for(let i = 3; i < process.argv.length; i++){
    cmd.push(process.argv[i]);
}

let apt = exec('brew', cmd);

apt.stdout.on('data', function (data) {
    let stdout = data.toString();
    stdout = stdout.replace(/([ ]{2,})brew/gm, "$1apt-get");
    stdout = stdout.replace(/FORMULA/gm, "PACKAGE");
    process.stdout.write(stdout);
});

apt.stderr.on('data', function (data) {
    process.stderr.write(data.toString());
});

apt.on('exit', function (code) {
    process.exit(code);
});
