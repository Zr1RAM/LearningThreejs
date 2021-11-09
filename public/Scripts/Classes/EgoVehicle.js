import * as THREE from 'three';
import { MathUtils, Object3D, Vector3 } from 'three';
import { loadModelFromPath } from 'Utils/FileReader.js';
import MainScene from 'Classes/Scene.js';
//import { getEscapeTyres } from 'Handlers/MaterialHandlers/FordEscapeMatHandler.js';

export default class EgoVehicle {
    
    constructor(data) {
        this.sceneRef = new MainScene();
        this.jsonIndex = 1;
        this.data = data.messages;
        this.setEgoParameters(this.data[0]);
        this.sceneRef.updateCameraTransform(this.egoVehicle);
    }

    //the update loop or tick function of this class or in this case the egovehicle
    update() {
        if (this.jsonIndex < this.data.length) {
            this.setEgoTransform(this.data[this.jsonIndex]._ego);
            this.setIdentifiedObjectFromParameters(this.data[this.jsonIndex]._objects);
            this.jsonIndex += 1;
            this.sceneRef.updateCameraTransform(this.egoVehicle);
            //console.log(this.jsonIndex);
            
            // this.sceneRef.setGridPosition(this.egoVehicle);
        } else {
            console.log('restarted');
            this.jsonIndex = 0;
        }
    }

    setEgoParameters(data) {
        this.setEgoTransform(data._ego);
        this.sceneRef.setCameraTransform(this.egoVehicle);
        this.setIdentifiedObjectFromParameters(data._objects);
    }

    setEgoTransform(data) {
        if (!this.egoVehicle) {
            this.SpawnEgoVehicle();
        }
        //Ideally we need a mesh with a pivot point that is on the ground level from the vehicle center
        //For now we are offsetting the height with respect to the Ford Escape height. Since 
        //Default cubes have pivot at the center of the mesh.
        this.egoVehicle.position.set(data._pos_x_m, 1.670/2 , data._pos_y_m); 
        this.egoVehicle.rotation.y = data._ori_yaw_rad;
        if(this.egoVehicle.children.length > 1) {
            console.log(this.egoVehicle.children[1]);
            this.egoVehicle.children[1].rotation.y = 3.14159;
        }
        //console.log(this.egoVehicle.position);
        //this.egoVehicleModel.position.set(data.pos_y_m, 1.670/2 , data.pos_x_m);
        //this.egoVehicleModel.rotation.y = data.ori_yaw_rad;
    }

    async SpawnEgoVehicle() {
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial({
        //     color: 0x00ff00,
        //     wireframe: true,
        // });
        //this.egoVehicle = new THREE.Mesh(geometry, material);
        this.egoVehicle =  new Object3D();
        this.egoVehicle.name = "egoVehicle";
        // Ford Escape dimsensions as per 
        //https://www.carsguide.com.au/ford/escape/car-dimensions/2020
        //this.egoVehicle.scale.set(1.883,1.670,4.614);
        this.egoVehicle.update = this.update.bind(this);
        await this.loadModel();
        
    }

    setIdentifiedObjectFromParameters(data) {
        if (!this.trackedObjects) {
            this.initializeTrackedObjects();
        }
        if(this.identifiedObj.maxCount < data.length) {
            for(let i = 0 ; i < (data.length - this.identifiedObj.maxCount) ; i++)
            {
                this.trackedObjects.push(this.createTrackedObject(data[i]));
            }
            this.identifiedObj.maxCount = data.length;
        }
        this.updateTrackedObjects(data);
        //return this.trackedObjects;
    }

    initializeTrackedObjects() {
        this.trackedObjects = [];
        this.identifiedObj = {};
        this.identifiedObj.maxCount = 0;
        this.identifiedObj.geometry = new THREE.BoxGeometry();
        this.identifiedObj.material = new THREE.MeshBasicMaterial({
            color: 0x041480,
            opacity: 0.5,
            transparent: true,
        });
    }

    createTrackedObject(data) {
        const trackedObject = new THREE.Mesh(this.identifiedObj.geometry, this.identifiedObj.material);
        trackedObject.name = "obj" + data._id;
        trackedObject.add(this.createTrackedObjBoxHelper(this.identifiedObj.geometry));
        this.sceneRef.addToScene(trackedObject);
        return trackedObject;
    }
    //BoxHelper used for simulating the effect found in https://avs.auto/demo/index.html
    //Ideally this should be a custom shader or material with the right parameters for trackedObject
    //For now BoxHelper seems to get the job done.
    createTrackedObjBoxHelper(geometry) {
        const trackedObjBoxHelper = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(0xff0000));
        const boxHelper = new THREE.BoxHelper(trackedObjBoxHelper, 0x0092fa);
        return boxHelper;
    }

    updateTrackedObjects(data)
    {
        for(let i = 0 ; i < this.identifiedObj.maxCount ; i++) {
            if(i < data.length)
            {
                this.trackedObjects[i].visible = true;
                this.trackedObjects[i].name = "obj" + data._id;
                const perceivedVehiclePos = this.calculatePerceivedVehiclePosition(data[i]._kinematics);
                this.trackedObjects[i].position.set(perceivedVehiclePos.x, perceivedVehiclePos.y, perceivedVehiclePos.z);
                /* perceived vehicle_in_map.orientation (WRT Easting) = perceived_vehicle.orientation + EgoVehicle.orientation; */
                this.trackedObjects[i].rotation.y = this.egoVehicle.rotation.y + data[i]._kinematics._ori_yaw_rad;
                this.trackedObjects[i].scale.set(data[i]._dimensions._width_m, 1, data[i]._dimensions._length_m);
            } else {
                this.trackedObjects[i].visible = false;
            }
        }
    }

    calculatePerceivedVehiclePosition(data) {

        /* Formula used to calculate the tracked object position is as follows
        perceived_vehicle_in_map.pos_x (i.e. easting) =  
            EgoVehicle.pos_x - sin(EgoVehicle.orientation) * (perceived_vehicle.pos_y) + cos(EgoVehicle.orientation) * (perceived_vehicle.pos_x); 
        perceived_vehicle_in_map.pos_y (i.e. northing) =  
            EgoVehicle.pos_y +  sin(EgoVehicle.orientation) * perceived_vehicle.pos_x + cos(EgoVehicle.orientation) * (perceived_vehicle.pos_y); 
        */

        let trackedObjPos = new Vector3();
        trackedObjPos.x = this.egoVehicle.position.x - Math.sin(this.egoVehicle.rotation.y) * data._pos_y_m + Math.cos(this.egoVehicle.rotation.y) * data._pos_x_m;
        trackedObjPos.z =  this.egoVehicle.position.z +  Math.sin(this.egoVehicle.rotation.y) * data._pos_x_m + Math.cos(this.egoVehicle.rotation.y) * data._pos_y_m; 
        trackedObjPos.y = 0.5;
        return trackedObjPos;
    }
    
    async loadModel() {
        // return new Promise(resolve=>loadModelFromPath(path, function (gltf) {
        //     console.log(gltf);
        //     this.egoVehicleModel = gltf;
        //     resolve(gltf);
        // }.bind(this)));
        
        let model = await loadModelFromPath('/JSONs/OfficeFiles/Models/FordEscape3.glb');
        //console.log(model);
        model = model.scene.children[0];
        console.log(model);
        // const axesHelper = new THREE.AxesHelper(60);
        // model.add(axesHelper);
        model.position.set(this.egoVehicle.position.x, 0, this.egoVehicle.position.z);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotation.y = this.egoVehicle.rotation.y;
        this.egoVehicle.attach(model);
        this.sceneRef.setGridPosition(this.egoVehicle);
        // return loadModelFromPath('/JSONs/OfficeFiles/Models/Ford_Fiesta.glb').then(gltfData=>{
        //     let model = gltfData.scene.children[0];
        //     model.position.set(this.egoVehicle.position.x, this.egoVehicle.position.y, this.egoVehicle.position.z);
        //     //TODO
        //     model.scale.set(1,1,1);
        //     this.model = model;
        // }).catch(e=>console.log(e));
    }
    // getDegreesFromRadians(rad) {
    //     return rad * 114.59155903;
    // }
}

// export default async function createAndLoadEgoVehicle(data) {
//     const ego = new EgoVehicle(data);
//     await ego.loadModel();
//     return ego;
// }

