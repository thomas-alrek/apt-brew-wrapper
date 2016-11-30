#!/usr/bin/env node

/**
 * Pointless apt-get -> homebrew wrapper
 * @module apt-brew-wrapper
 */

const sys = require('util');
const argv = require('yargs');
const username = require('username');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

function replaceOutput(stdout){
    stdout = stdout.replace(/([ ]{2,})brew/gm, "$1apt-get");
    stdout = stdout.replace(/FORMULA/gm, "PACKAGE");
    stdout = stdout.replace(/Homebrew/gm, 'package list');
    stdout = stdout.replace(/tap/gm, 'repository');
    stdout = stdout.replace(/Formulae/gm, 'package');
    stdout = stdout.replace(/Pouring/gm, 'Installing');
    stdout = stdout.replace(/🍺  /gm, '');
    return stdout;
}

let checkUser = new Promise((outerResolve, outerReject) => {
    //Check if invoked as root
    if(process.getuid() === 0){

        username().then(username => {
            let getGid = new Promise((resolve, reject) => {
                var getGid = exec("id -g " + username, (error, stdout, stderr) => {
                    if (error) {
                        reject();
                    }
                    resolve(parseInt(stdout));
                });
            }).then(gid => {
                try{
                    process.setgid(gid);
                    process.setuid(username);
                    outerResolve();
                }catch(err){
                    outerReject('Cowardly refusing to run the process as root.');
                }
            }, () => {
                outerReject('Unable to get group id');
            });
        }, () => {
            outerReject('Unable to get username');
        });
    }
    outerResolve();
}).then(() => {
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

    let apt = spawn('brew', cmd);

    apt.stdout.on('data', function (data) {
        let stdout = replaceOutput(data.toString());
        process.stdout.write(stdout);
    });

    apt.stderr.on('data', function (data) {
        let stderr = replaceOutput(data.toString());
        process.stderr.write(stderr);
    });

    apt.on('exit', function (code) {
        process.exit(code);
    });
}, (err) => {
    process.stderr.write(err + "\n");
    process.exit(1);
});