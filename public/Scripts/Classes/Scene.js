import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

export default class MainScene {
    constructor() {
        this.initializeScene();
    }

    initializeScene() {
        THREE.Cache.enabled = true;
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color("rgb(75, 75, 75)");
        this.grid = new THREE.GridHelper(10000, 5000);
        this.scene.add(this.grid);
        this.grid.position.y = -0.5;
        this.initializeCamera();
        this.initializeRenderer();
        //Initializing OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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

        requestAnimationFrame(this.tick.bind(this));

    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    updateCameraTransform(targetActor) {
        this.camera.position.set(targetActor.position.x, targetActor.position.y + 5, targetActor.position.z);
        this.camera.lookAt(targetActor.position);
        this.controls.target = targetActor.position;
    }

    addToScene(Obj) {
        this.scene.add(Obj);
    }
    setGridPosition(obj) {
        this.grid.position.set(obj.position.x, this.grid.position.y, obj.position.z);
    }
}