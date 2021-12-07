import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import DataBuffer from 'Classes/DataBuffer.js';

export default class MainScene {
    constructor() {
        if (MainScene.instance instanceof MainScene ) {
            return MainScene.instance;
        }
        this.initializeScene();
        Object.freeze(this);
        MainScene.instance = this;
    }

    initializeScene() {
        THREE.Cache.enabled = true;
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color("rgb(75, 75, 75)");
        this.initializeGrid();
        this.initializeCamera();
        this.initializeRenderer();
        this.initializeOrbitControls();
        this.sceneObjects = [];
        this.bufferInstance = new DataBuffer();
    }

    initializeGrid() {
        this.grid = new THREE.GridHelper(100000, 5000, 0x0a0401, 0x0a0401 );
        this.scene.add(this.grid);
    }
    initializeCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 2;
    }

    initializeOrbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableRotate = true;
        this.controls.enablePan = false;
        this.controls.autoRotate = false;
        this.controls.maxPolarAngle = 1.5;
        this.controls.minPolarAngle = 0;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 50;
        // this.controls.enableDamping = true;
        // this.controls.dampingFactor = 0.1;
        // this.controls.update();
    }

    initializeRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.physicallyCorrectLights = true;

        window.addEventListener(
            'resize',
            () => {
                this.camera.aspect = window.innerWidth / window.innerHeight
                this.camera.updateProjectionMatrix()
                this.renderer.setSize(window.innerWidth, window.innerHeight)
                this.render();
            },
            false
        );
    }

    // This is the tick function
    tick() {
        //this.controls.update();
        //stats.update();
        requestAnimationFrame(this.tick.bind(this));
        if(!this.bufferInstance.isEmpty()) {
            let data = this.bufferInstance.dequeue();
            console.log('New frame data starts here');
            console.log(data);
            this.sceneUpdateLoop(data);
        }
        this.render();

    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    sceneUpdateLoop(bufferData) {
        this.sceneObjects.forEach(obj => {
            if(obj.update) {
                obj.data = bufferData[obj.bufferKey];
                //console.log(bufferData[obj.bufferKey])
                //console.log(obj);
                obj.update();
            }
        });
    }
    //Scene Utility functions
    setCameraTransform(targetActor) {
        targetActor.position.set(0,0,0);
        this.controls.minDistance = 12;
        this.controls.maxDistance = 50;
        this.camera.position.set( 0, 10, 10 );
        targetActor.add(this.camera);
                this.controls.update(); 
    }

    updateCameraTransform(targetActor) {
        this.camera.lookAt(targetActor.position.x, targetActor.position.y + 5, targetActor.position.z);
        //this.camera.position.set(targetActor.position.x, 2, targetActor.position.z - 2);
       // this.camera.lookAt(targetPosition.x,targetPosition.y,targetPosition.z);
       // this.controls.target = targetActor.position;
    }

    addToScene(Obj) {
        this.scene.add(Obj);
        if (Obj.update) {
            this.sceneObjects.push(Obj);
        }
    }
    setGridPosition(obj) {
        this.grid.position.set(obj.position.x, this.grid.position.y, obj.position.z);
        //The following is optional and is only meant for displaying the axes for debugging purposes
        // if (!this.axesHelper) {
        //     this.axesHelper = new THREE.AxesHelper(5);
        //     this.scene.add(this.axesHelper);
        // }
        // this.axesHelper.position.set(obj.position.x, this.grid.position.y, obj.position.z);
    }
    getSceneObjectByName(name) {
        return this.scene.getObjectByName(name);
    }
}