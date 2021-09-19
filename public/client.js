import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { Mesh } from 'three';

//import { readFileFromPath } from './FileReader'
//import * as fs from 'fs'

THREE.Cache.enabled = true;
const scene = new THREE.Scene()
scene.background = new THREE.Color( "rgb(75, 75, 75)" );
const grid = new THREE.GridHelper(10000, 5000);
scene.add(grid);
grid.position.y = -0.5;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.physicallyCorrectLights = true;

const controls = new OrbitControls(camera, renderer.domElement)

// const geometry = new THREE.BoxGeometry()
// const material = new THREE.MeshBasicMaterial({
//     color: 0x00ff00,
//     wireframe: true,
// })
// const cube = new THREE.Mesh(geometry, material)
// scene.add(cube)

window.addEventListener(
    'resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    },
    false
)

const stats = Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
// const cubeFolder = gui.addFolder('Cube')
// cubeFolder.add(cube.scale, 'x', -5, 5)
// cubeFolder.add(cube.scale, 'y', -5, 5)
// cubeFolder.add(cube.scale, 'z', -5, 5)
// cubeFolder.open()
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'y', 0, 10)
cameraFolder.open()

// This is the tick function
function animate() {
    
    // cube.rotation.x += 0.01
    // cube.rotation.y += 0.01
    controls.update()
    render()
    stats.update()
    requestAnimationFrame(animate)
}

function render() {
    renderer.render(scene, camera)
}

animate()

//testing file reading
// readFileFromPath('./JSONs/OfficeFiles/officejsonfile1.json', (data)=> {
//     console.log(data);
// });

let loader;
function JSONLoader(path, callback) {
    if(!loader) {
        loader = new THREE.FileLoader();
    }
    loader.load(
        // resource URL
        path,
    
        // onLoad callback
        function ( data ) {
            callback(data);
        },
    
        // onProgress callback
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
    
        // onError callback
        function ( err ) {
            console.error( 'An error happened' );
        }
    );
}
// loader = new THREE.FileLoader();
// loader.load(
//     // resource URL
//     '/JSONs/OfficeFiles/officejsonfile1.json',

//     // onLoad callback
//     function (data) {
//         // output the text to the console
//         console.log(data);
//         console.log(typeof data);
//         //callback(data);
//     },

//     // onProgress callback
//     function (xhr) {
//         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//     },

//     // onError callback
//     function (err) {
//         console.error('An error happened');
//     }
// );
// const fs = require('fs');

// fs.readdir('/JSONs/OfficeFiles/', (err, files) => {
//   files.forEach(file => {
//     console.log(file);
//   });
// });
//testing file reading

// Setting actor transforms

function setActorParameters(data)
{
    //console.log(data);
    let ParsedJSONObj = JSON.parse(data);
    
    if(ParsedJSONObj.messages.ego) {
        setEgoParameters(ParsedJSONObj.messages);
    } else if (ParsedJSONObj.messages.lanes) {
        setLaneParameters(ParsedJSONObj.messages.lanes);
    }
    // console.log(Object.keys(ParsedJSONObj));
    // switch (ParsedJSONObj) {
    //     case JSON.stringify(ParsedJSONObj.messages.ego):
    //         console.log("I think this means it is an automated vehicle");
    //         break;
    //     case JSON.stringify(ParsedJSONObj.messages.lanes):
    //         console.log("This is for lanes");
    //         break;
    // }
}

function setEgoParameters(data) {
    setEgoTransform(data.ego);
    if(data.objects) {
        setIdentifiedObjectParameters(data.objects);
    }
}
let egoVehicle;
function setEgoTransform(data)
{
    if(!egoVehicle) {
        egoVehicle = SpawnEgoVehicle();
        //egoVehicle = scene.getObjectByName( "egoVehicle" );
    }
    egoVehicle.position.set( data.pos_x_m, data.pos_z_m, data.pos_y_m );
    grid.position.set(data.pos_x_m, grid.position.y, data.pos_y_m);
    egoVehicle.rotation.y = data.ori_yaw_rad;
    console.log(egoVehicle.position);
    updateCameraTransform(egoVehicle);
}

function SpawnEgoVehicle()
{
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
    });
    const egoVehicleActor = new THREE.Mesh(geometry, material);
    egoVehicleActor.name = "egoVehicle";
    scene.add(egoVehicleActor);
    return egoVehicleActor;
}
function updateCameraTransform(targetActor) {
    camera.position.set(targetActor.position.x , targetActor.position.y + 5, targetActor.position.z);
    camera.lookAt(targetActor.position);
    controls.target = targetActor.position;
}

function setIdentifiedObjectParameters(data) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        opacity: 0.5,
        transparent: true,
    });
    //let TrackedObject;
    for (let i = 0 ; i < data.length ; i++) {
        const TrackedObject = new THREE.Mesh(geometry, material);
        TrackedObject.name = "obj" + data[i].id;
        scene.add(TrackedObject);
        TrackedObject.position.set(egoVehicle.position.x + data[i].kinematics.pos_x_m, 
                                   egoVehicle.position.y + data[i].kinematics.pos_z_m, 
                                   egoVehicle.position.z + data[i].kinematics.pos_y_m);
        TrackedObject.scale.set(data[i].dimensions.width_m , 1, data[i].dimensions.length_m);
    }
}



function setLaneParameters(data) {
    
}


//JSONLoader('/JSONs/OfficeFiles/officejsonfile1.json',setActorParameters);
// Setting actor transforms

//Particle System Point Cloud 

function PSPointCloud(data) {
    data = JSON.parse(data);
    const PSgeometry = new THREE.BufferGeometry;
    const particlesCount = data.length;

    const posArray = new Float32Array(particlesCount * 3);
    // xyz xyz xyz xyz.....
    for(let i = 0 ; i < posArray.length ; i++) {
        posArray[i * 3] = data[i].position[0];
        posArray[i * 3 + 1] = data[i].position[1];
        posArray[i * 3 + 2] = data[i].position[2];
        // let particle = new THREE.Vector3(data[i].position[0], data[i].position[1], data[i].position[2]);
        // particlePositions.push(particle);
       // console.log(data[i]);
    }
    PSgeometry.setAttribute( 'position', new THREE.BufferAttribute( posArray, 3 ) );
    const PSmaterial = new THREE.PointsMaterial({
        size: 0.005
    });
    const pointCloud_PS = THREE.Points(PSgeometry,PSmaterial);
    scene.add(pointCloud_PS);
}
JSONLoader('/JSONs/samplepointcloud.json',PSPointCloud);
//Particle System Point Cloud 

