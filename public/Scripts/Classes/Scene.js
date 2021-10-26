import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

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
        //Initializing OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.sceneObjects = [];
    }
    initializeGrid() {
        this.grid = new THREE.GridHelper(10000, 5000, 0x0a0401, 0x0a0401 );
        this.scene.add(this.grid);
    }
    initializeCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 2;
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
        this.controls.update();
        this.render();
        //stats.update();
        this.sceneUpdateLoop();
        requestAnimationFrame(this.tick.bind(this));

    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    sceneUpdateLoop() {
        this.sceneObjects.forEach(obj => {
            //console.log(obj);
            if(obj.update) {
                obj.update();
            }
        });
    }
    //Scene Utility functions
    updateCameraTransform(targetActor) {
        this.camera.position.set(targetActor.position.x, targetActor.position.y + 5, targetActor.position.z);
        this.camera.lookAt(targetActor.position);
        this.controls.target = targetActor.position;
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