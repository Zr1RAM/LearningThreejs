const express = require('express')
const app = express()
const path = require('path')

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const socketUtil = require('./server/sockets.js');
const dbHandler = require('./server/DataBaseHandler.js');
dbHandler.initDatabase();


const sequentialJSONLoader = require('./server/JSONHandler.js');
const jsonData = sequentialJSONLoader.readFilesFromPath();
// console.log(jsonData.ego.type);
// console.log(jsonData.lanes.type);
function queryCurrentEgoPosition(data) {
    let egoPosition = {
        x: data._pos_x_m,
        y: data._pos_y_m
    };
    dbHandler.queryLanePoints(egoPosition);
}

for(let i = 0 ; i < 5/*jsonData.ego.messages.length*/ ; i++) {
    queryCurrentEgoPosition(jsonData.ego.messages[i]._ego);
}



app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))
app.use('/Scripts/',express.static(path.join(__dirname, 'public/Scripts')))

io.on('connection', (socket) =>{ 
    console.log("connected");

    setInterval(()=>socket.emit('looBaloo', {
        objective : 'sugma',
        item : 'balls',
        count: 2
    }),1000);
    socket.on('disconnect',()=>{
        console.log("Diconected");
    })
})

server.listen(3000, () => console.log('Visit http://127.0.0.1:3000'))


