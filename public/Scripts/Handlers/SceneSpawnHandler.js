import { sequentialJSONLoader } from 'Utils/FileReader.js'
import { largeJSONLoader } from 'Utils/FileReader.js'
import EgoVehicle from 'Classes/EgoVehicle.js'
//import { GetLaneFromParameters } from 'Classes/LanesController.js'
import * as THREE from 'three'
import { getMillisecondsFromUnixTimestamp } from 'Utils/TimeAndFramesUtil.js'
import LanesController from 'Classes/LanesController.js'
import CameraController from 'Classes/CameraController.js'
import MapLanesController from 'Classes/MapLanesController.js'

//This is a temporary solution until we can dynamically get all the file names in a path which is also a 
//temporary solution until web socket is in place
//let paths = ['/JSONs/OfficeFiles/ford-vision-objects.json','/JSONs/OfficeFiles/ford-vision-lanes.json'];
let egoObject;
let sceneRef;
export function UpdateSceneItems(scene) {
    sceneRef = scene;
    sceneSetup();
    sceneObjectsSetup();
    //sequentialJSONLoader(paths,setActorParameters);
    //largeJSONLoader(paths, setActorParameters);
}
function sceneSetup() {
    sceneLightingSetup();
    //cameraSetup();
}

function sceneObjectsSetup() {
    egoSceneObjSetup();
    lanesSetup();
}

function sceneLightingSetup()
{
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2 );
    sceneRef.addToScene(directionalLight);
    const ambientLight = new THREE.AmbientLight( 0xffffff, .5 );
    sceneRef.addToScene( ambientLight );
}

function cameraSetup() {
    const cameraController = new CameraController(sceneRef.camera);
}

let egoVehicleData;
let lanesData;
function getJSONInfos(data) {
    switch (data.type) {
        case "ego":
            // for (let i = 0; i < data.messages.length; i++) {
            //     console.log('tracked objects count: ' + data.messages[i]._objects.length);
            // }
            egoVehicleData = data;
            break;
        case "lanes":
            //laneSetup(data)
            // for (let i = 0; i < data.messages.length; i++) {
            //     console.log('number of lanes per message:  ' + data.messages[i]._lanes.length);
            // }
            lanesData = data;
            break;
    }
}
function setActorParameters(data)
{
    switch (data.type) {
        case "ego": 
            egoSetup(data);
            
            break;
        case "lanes":
            laneSetup(data);
            
            break;
    }
}

async function egoSetup(data) {
    //const { messages } = data; // used to alternatively known as messages = data.messages
    if(!egoObject) {
        egoObject = new EgoVehicle(data);
        sceneRef.addToScene(egoObject.egoVehicle);
    }
}

async function egoSceneObjSetup() {
    if(!egoObject) {
        egoObject = new EgoVehicle();
        sceneRef.addToScene(egoObject.egoVehicle);
    }
}

function lanesSetup() {
    const lanesController = new LanesController( "vision-lanes-group");
    const mapLanesController = new MapLanesController("map-lanes-group");
}

function laneSetup(data) {
    const lanesController = new LanesController(data);
    // let splines = GetLaneFromParameters(data);
    // for(let i = 0 ; i < splines.length ; i++) {
    //     spawnSpline(splines[i]);
    // }
}
function spawnSpline(spline) {
    const { egoVehicle } = egoObject;
    if(spline) {
        sceneRef.addToScene(spline);
        //egoVehicle.add(spline);
        spline.position.set(egoVehicle.position.x,
                            egoVehicle.position.y,
                            egoVehicle.position.z);
    }
}
