const { execSync } = require("child_process")


let getGitCommitHash = (long=true) => {
    let gitCommand = `${long ? `git rev-parse HEAD` : `git rev-parse --short HEAD`}`;
    return execSync(gitCommand).toString().trim();
}

let uptime = () => {
    return (process.uptime() + "").toHHMMSS();
}

String.prototype.toHHMMSS = function () {
    let sec_num = parseInt(this, 10);
    /*var days    = parseInt(sec_num / 86400);*/
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0" + hours;}
    if (minutes < 10) {minutes = "0" + minutes;}
    if (seconds < 10) {seconds = "0" + seconds;}
    let time    = /*days + ' d ' +  */hours + ':' + minutes +':' + seconds;
    return time;
}


module.exports = {
    uptime,
    getGitCommitHash
};
