import { sequentialJSONLoader } from 'Utils/FileReader.js'
import EgoVehicle from 'Classes/EgoVehicle.js'
import { GetLaneFromParameters } from 'Handlers/LanesHandler.js'
import * as THREE from 'three'


//This is a temporary solution until we can dynamically get all the file names in a path which is also a 
//temporary solution until web socket is in place
let paths = ['/JSONs/OfficeFiles/ego_vehicle.json','/JSONs/OfficeFiles/lanes.json'];
let egoObject;
let sceneRef;
export function UpdateSceneItems(scene) {
    sceneRef = scene;
    sequentialJSONLoader(paths,setActorParameters);
}

function setActorParameters(data)
{
    switch (data.type) {
        case "ego": 
            egoSetup(data);
            break;
        case "lanes":
            laneSetup(data)
            break;
    }
}

function setIdentifiedObjectParameters(data) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        opacity: 0.5,
        transparent: true,
    });
    for (let i = 0 ; i < data.length ; i++) {
        const TrackedObject = new THREE.Mesh(geometry, material);
        TrackedObject.name = "obj" + data[i].id;
        sceneRef.addToScene(TrackedObject); // help me
        TrackedObject.position.set(egoObject.egoVehicle.position.x + data[i].kinematics.pos_x_m, 
                                   egoObject.egoVehicle.position.y + data[i].kinematics.pos_z_m, 
                                   egoObject.egoVehicle.position.z + data[i].kinematics.pos_y_m);
        TrackedObject.scale.set(data[i].dimensions.width_m , 1, data[i].dimensions.length_m);
    }
}

function egoSetup(data) {
    const { messages } = data;
    if(!egoObject) {
        egoObject = new EgoVehicle(messages);
        sceneRef.addToScene(egoObject.egoVehicle)
    } else {
        egoObject.setEgoParameters(messages);
    }
    const { egoVehicle } = egoObject;
    sceneRef.updateCameraTransform(egoVehicle);
    sceneRef.setGridPosition(egoVehicle);
    setIdentifiedObjectParameters(data.messages.objects);
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
//sceneref.scene.add to be used here so that scene classes functions and scene.add can be used here
