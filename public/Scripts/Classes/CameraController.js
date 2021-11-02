import * as THREE from 'three';
import MainScene from 'Classes/Scene.js';
import { Object3D } from 'three';
export default class CameraController {
    constructor(camera) {
        this.cameraRef = camera;
        this.sceneRef = new MainScene();
        this.cameraControllerSetup();
        
    }

    // update() {
        
        
    // }

    cameraControllerSetup() {
        this.cameraMainParent = new Object3D();
        this.cameraMainParent.name = "CameraController";
        this.cameraXRotator = new Object3D();
        this.cameraXRotator.add(this.cameraRef);
        this.cameraMainParent.add(this.cameraXRotator);
        this.cameraRef.position.set(0,0,-10);
        this.sceneRef.addToScene(this.cameraMainParent);
    }
}
