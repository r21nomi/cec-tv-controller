const nodecec = require("node-cec");
const childProcess = require("child_process");
const NodeCec = nodecec.NodeCec;
const CEC = nodecec.CEC;

let tvOn = false;

// TODO: Delete
const turnTVOn = () => {
    childProcess.exec(`echo "on 0" | cec-client -s`, (error, stdout, stderr) => {
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.log(stderr);
        }
        if (error !== null) {
            console.log("exec error: " + error);
        }
    });
};

// TODO: Delete
const turnTVOff = () => {
    childProcess.exec(`echo "standby 0" | cec-client -s`, (error, stdout, stderr) => {
        //childProcess.exec("~/workspace/cec-demo/stop.sh", (error, stdout, stderr) => {
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.log(stderr);
        }
        if (error !== null) {
            console.log("exec error: " + error);
        }
    });
};

const createCEC = () => {
    const cec = new NodeCec("node-cec-monitor");

    process.on("SIGINT", function(){
        console.log("signint");
        if (cec != null) {
            cec.stop();
        }
        process.exit();
    });

    cec.once("ready", function(client){
        console.log("-- ready --");
    });

    cec.on("REPORT_POWER_STATUS", function(packet, status){
        console.log(status);
        var keys = Object.keys(CEC.PowerStatus);

        for (var i = keys.length - 1; i >= 0; i--) {
            if (CEC.PowerStatus[keys[i]] == status){
                console.log('POWER_STATUS:', keys[i]);
                break;
            }
        }
        if (status == 0) {
            tvOn = true;
        } else if (status == 1) {
            tvOn = false;
        }
    });

    cec.on('ACTIVE_SOURCE', function() {
        console.log("active source");
        if (!tvOn) {
            cec.sendCommand(0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
        }
    });

    cec.on('GIVE_PHYSICAL_ADDRESS', function() {
        console.log("physical address");
        if (!tvOn) {
            cec.sendCommand(0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
        }
    });

    cec.on('STANDBY', () => {
        console.log("standby");
        tvOn = false;
        //turnTVOn();
        cec.sendCommand(0xf0, CEC.Opcode.IMAGE_VIEW_ON);
        setTimeout(() => {
            cec.sendCommand("1f:82:20:00");
        }, 500);
    });

    cec.on("ROUTING_CHANGE", function(packet, fromSource, toSource){
        console.log( 'Routing changed from ' + fromSource + ' to ' + toSource + '.' );
    });

    cec.start("cec-client", "-m", "-d", "8", "-b", "r");
    cec.sendCommand(0xf0, CEC.Opcode.IMAGE_VIEW_ON);

    return cec;
};

let cec = createCEC();