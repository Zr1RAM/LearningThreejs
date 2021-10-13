import * as THREE from 'three'
import { Vector3 } from 'three';
import { loadModelFromPath } from 'Utils/FileReader.js'

export default class EgoVehicle {
    
    constructor(data) {
        this.setEgoParameters(data);
    }

    setEgoParameters(data) {
        this.setEgoTransform(data.ego);
    }

    setEgoTransform(data) {
        if (!this.egoVehicle) {
            this.SpawnEgoVehicle();
        }
        //Ideally we need a mesh with a pivot point that is on the ground level from the vehicle center
        //For now we are offsetting the height with respect to the Ford Escape height. Since 
        //Default cubes have pivot at the center of the mesh.
        this.egoVehicle.position.set(data.pos_y_m, 1.670/2 , data.pos_x_m); 
        this.egoVehicle.rotation.y = data.ori_yaw_rad;
        //this.egoVehicleModel.position.set(data.pos_y_m, 1.670/2 , data.pos_x_m);
        //this.egoVehicleModel.rotation.y = data.ori_yaw_rad;
    }

    SpawnEgoVehicle() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
        });
        this.egoVehicle = new THREE.Mesh(geometry, material);
        this.egoVehicle.name = "egoVehicle";
        // Ford Escape dimsensions as per 
        //https://www.carsguide.com.au/ford/escape/car-dimensions/2020
        this.egoVehicle.scale.set(1.883,1.670,4.614);
        
    }

    setIdentifiedObjectFromParameters(data) {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({
            color: 0x041480,
            opacity: 0.5,
            transparent: true,
        });
        let trackedObjects = [];
        for (let i = 0; i < data.length; i++) {
            const trackedObject = new THREE.Mesh(geometry, material);
            trackedObject.name = "obj" + data[i].id;
            trackedObject.add( this.createTrackedObjBoxHelper(geometry) );
            trackedObject.position.set(this.egoVehicle.position.x + data[i].kinematics.pos_y_m,
                                       0.5 + data[i].kinematics.pos_z_m,
                                       this.egoVehicle.position.z + data[i].kinematics.pos_x_m);
            trackedObject.scale.set(data[i].dimensions.width_m, 1, data[i].dimensions.length_m);
            trackedObjects.push(trackedObject);
        }
        return trackedObjects;
    }
    //BoxHelper used for simulating the effect found in https://avs.auto/demo/index.html
    //Ideally this should be a custom shader or material with the right parameters for trackedObject
    //For now BoxHelper seems to get the job done.
    createTrackedObjBoxHelper(geometry) {
        const trackedObjBoxHelper = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(0xff0000));
        const boxHelper = new THREE.BoxHelper(trackedObjBoxHelper, 0x0092fa);
        return boxHelper;
    }
    
    async loadModel() {
        // return new Promise(resolve=>loadModelFromPath(path, function (gltf) {
        //     console.log(gltf);
        //     this.egoVehicleModel = gltf;
        //     resolve(gltf);
        // }.bind(this)));
        const vehicleMaterial = new THREE.MeshBasicMaterial({
            color: 0x383838,
            wireframe: true,
        });
        let model = await loadModelFromPath('/JSONs/OfficeFiles/Models/Ford_Fiesta.glb');
        model = model.scene.children[0];
        model.traverse((child) => {
            if (child.isMesh) child.material = vehicleMaterial; // a material i created in the code earlier
        });
        model.position.set(this.egoVehicle.position.x, 0, this.egoVehicle.position.z);
        model.scale.set(0.0075, 0.0075, 0.0075);
        model.rotation.y = this.egoVehicle.rotation.y;
        this.egoVehicle.attach(model);
        // return loadModelFromPath('/JSONs/OfficeFiles/Models/Ford_Fiesta.glb').then(gltfData=>{
        //     let model = gltfData.scene.children[0];
        //     model.position.set(this.egoVehicle.position.x, this.egoVehicle.position.y, this.egoVehicle.position.z);
        //     //TODO
        //     model.scale.set(1,1,1);
        //     this.model = model;
        // }).catch(e=>console.log(e));
    }

}

// export default async function createAndLoadEgoVehicle(data) {
//     const ego = new EgoVehicle(data);
//     await ego.loadModel();
//     return ego;
// }

