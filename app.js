const express = require('express')
const app = express()
const path = require('path')

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// DB
const dbHandler = require('./server/DataBaseHandler.js')();





app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))
app.use('/Scripts/',express.static(path.join(__dirname, 'public/Scripts')))


const sequentialJSONLoader = require('./server/JSONHandler.js');
const jsonData = sequentialJSONLoader.readFilesFromPath();

io.on('connection', (socket) =>{ 
    console.log("connected");
    dbHandler.init().then(()=>{
        // console.log(jsonData.ego.messages.length);
        for(let i = 0 ; i < jsonData.ego.messages.length ; i++) {
            let currentFrameEgoData = minimizeEgoData(jsonData.ego.messages[i]);
            //currentFrameEgoData.num = i+1;
            //console.log('ego json to send is' + JSON.stringify(currentFrameEgoData));
            let currentFrameLanesData = minimizeLanesData(jsonData.lanes.messages[i]);
            //console.log('current queried message index ' + i);
            dbHandler.queryLanePoints({
                x: jsonData.ego.messages[i]._ego._pos_x_m,
                y: jsonData.ego.messages[i]._ego._pos_y_m
            }).then((mapLanePointsData) => {
                // console.log('query result ' + JSON.stringify(mapLanePointsData[0]));
                //console.log('query result count ' + mapLanePointsData.length);
                socket.emit('frameData', {
                    //num:i+1,
                    ego : currentFrameEgoData,
                    lanes : currentFrameLanesData,
                    mapLanes : mapLanePointsData
                });
            });
            
        }
    });
    socket.on('disconnect',()=>{
        console.log("Disconected");
    })
})


// const metadata = {
//     title: 'Scratchpad',
//     translations: [
//       {
//         locale: 'de',
//         localization_tags: [],
//         last_edit: '2014-04-14T08:43:37',
//         url: '/de/docs/Tools/Scratchpad',
//         title: 'JavaScript-Umgebung'
//       }
//     ],
//     url: '/en-US/docs/Tools/Scratchpad'
//   };
  
//   let {
//     title: englishTitle, // rename
//     translations: [
//       {
//          title: localeTitle, // rename
//       },
//     ],
//   } = metadata;


function minimizeEgoData(data) {
    const {_objects} = data;
    const minimizedEgoData = {
        _ego : {
            _pos_x_m : data._ego._pos_x_m,
            _pos_y_m : data._ego._pos_y_m,
            _pos_z_m : data._ego._pos_z_m,
            _ori_yaw_rad : data._ego._ori_yaw_rad
        },
        _objects : _objects.map(obj => {
            return {
                _id:obj._id,
                _kinematics: {
                    _pos_x_m:obj._kinematics._pos_x_m,
                    _pos_y_m:obj._kinematics._pos_y_m,
                    _pos_z_m:obj._kinematics._pos_z_m,
                    _ori_yaw_rad:obj._kinematics._ori_yaw_rad
                },_dimensions :{
                    _length_m:obj._dimensions._length_m,
                    _width_m:obj._dimensions._width_m,
                    _height_m:obj._dimensions._height_m
                }
            };
        }),
        _current_timestamp_ns: data._current_timestamp_ns
    };
    return minimizedEgoData;
}

function minimizeLanesData(data) {
    
    const minimizedLaneData = {
        _lanes : data._lanes.map(_lane => {
            const {_front_line_poly:frontLinePoly,_rear_line_poly:rearLinePoly} = _lane._right_marker;
           return { 
                    _right_marker : {
                        _front_line_poly : {
                            _c0: frontLinePoly._c0,
                            _c1 : frontLinePoly._c1,
                            _c2 : frontLinePoly._c2,
                            _c3 : frontLinePoly._c3,
                            _range_start_m : frontLinePoly._range_start_m,
                            _range_end_m : frontLinePoly._range_end_m
                        },
                        _rear_line_poly: {
                            _c0 : rearLinePoly._c0,
                            _c1 : rearLinePoly._c1,
                            _c2 : rearLinePoly._c2,
                            _c3 : rearLinePoly._c3,
                            _range_start_m : rearLinePoly._range_start_m,
                            _range_end_m : rearLinePoly._range_end_m
                        }
                    }
                }
        }),
        _current_timestamp_ns : data._current_timestamp_ns
    };
    return minimizedLaneData;
}


server.listen(3000, () => console.log('Visit http://127.0.0.1:3000'))


