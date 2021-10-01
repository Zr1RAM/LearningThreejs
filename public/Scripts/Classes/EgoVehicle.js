import * as THREE from 'three'

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
        this.egoVehicle.position.set(data.pos_x_m, data.pos_z_m, data.pos_y_m);
        //grid.position.set(data.pos_x_m, grid.position.y, data.pos_y_m); //the grid is from the scene
        this.egoVehicle.rotation.y = data.ori_yaw_rad;
        //updateCameraTransform(this.egoVehicle); //this is a function that is available in scene.
    }

    SpawnEgoVehicle() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
        });
        this.egoVehicle = new THREE.Mesh(geometry, material);
        this.egoVehicle.name = "egoVehicle";
    }

    


}

