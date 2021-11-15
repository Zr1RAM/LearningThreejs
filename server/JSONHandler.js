const paths = './server/Data/Officefiles/JSONs/';

function readFilesFromPath() {
    const fs = require('fs');
    let jsonData = {};
    fs.readdirSync(paths).forEach(file => {
            console.log(paths + file);
            const rawdata = fs.readFileSync(paths + file);
            const json = JSON.parse(rawdata);
            switch(json.type) {
                case 'ego':
                    jsonData.ego = json;
                    break;
                
                case 'lanes':
                    jsonData.lanes = json;
                    break;


            }
        });
    return jsonData;
}


module.exports = {
    readFilesFromPath
}
