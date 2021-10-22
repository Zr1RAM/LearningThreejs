import { sequentialJSONLoader } from 'Utils/FileReader.js'
import EgoVehicle from 'Classes/EgoVehicle.js'
import { GetLaneFromParameters } from 'Handlers/LanesHandler.js'
import * as THREE from 'three'
import { getMillisecondsFromUnixTimestamp } from 'Utils/TimeAndFramesUtil.js'

//This is a temporary solution until we can dynamically get all the file names in a path which is also a 
//temporary solution until web socket is in place
let paths = ['/JSONs/OfficeFiles/ford-fusion-objects.json','/JSONs/OfficeFiles/ford-vision-lanes.json'];
let egoObject;
let sceneRef;
export function UpdateSceneItems(scene) {
    sceneRef = scene;
    sequentialJSONLoader(paths,setActorParameters);
}
let egoVehicleData;
let lanesData;
function getJSONInfos(data) {
    switch (data.type) {
        case "ego":
            for (let i = 0; i < data.messages.length; i++) {
                console.log('tracked objects count: ' + data.messages[i]._objects.length);
            }
            egoVehicleData = data;
            break;
        case "lanes":
            //laneSetup(data)
            for (let i = 0; i < data.messages.length; i++) {
                console.log('number of lanes per message:  ' + data.messages[i]._lanes.length);
            }
            lanesData = data;
            break;
    }
}
function setActorParameters(data)
{
    switch (data.type) {
        case "ego": 
            egoSetup(data.messages[0]);
            
            break;
        case "lanes":
           // laneSetup(data.messages[0]);
            
            break;
    }
}

async function egoSetup(data) {
    //const { messages } = data; // used to alternatively known as messages = data.messages
   
    if(!egoObject) {
        egoObject = new EgoVehicle(data);
        //await egoObject.loadModel();
        sceneRef.addToScene(egoObject.egoVehicle);
    } else {
        egoObject.setEgoParameters(data);
    }
    const { egoVehicle } = egoObject;
   
    sceneRef.updateCameraTransform(egoVehicle);
    sceneRef.setGridPosition(egoVehicle);
    spawnTrackedObjects(data._objects);
}

function spawnTrackedObjects(data) {
    const trackedObjects = egoObject.setIdentifiedObjectFromParameters(data);
    for(let i = 0 ; i < trackedObjects.length ; i++) {
        sceneRef.addToScene(trackedObjects[i]);
    }
}

function laneSetup(data) {
    let splines = GetLaneFromParameters(data.messages.lanes);
    for(let i = 0 ; i < splines.length ; i++) {
        spawnSpline(splines[i]);
    }
}
function spawnSpline(spline) {
    const { egoVehicle } = egoObject;
    if(spline) {
        sceneRef.addToScene(spline);
        spline.position.set(egoVehicle.position.x,
                            egoVehicle.position.y,
                            egoVehicle.position.z);
    }
}
