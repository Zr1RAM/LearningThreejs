import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { PCDLoader } from './PCDLoader'

//Texture loader 
const textureLoader = new THREE.TextureLoader()

const NormalMapTexture = textureLoader.load('/textures/N_Sample.jpg')
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry = new THREE.TorusGeometry( .7, .2, 16, 100 );

// Materials

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.3
material.roughness = 0.3
material.normalMap = NormalMapTexture
material.color = new THREE.Color(0x0000ff)

// Mesh
const torus = new THREE.Mesh(geometry,material)
//scene.add(torus)
console.log(torus.position)
// Lights

const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.x = -1
pointLight.position.y = 2
pointLight.position.z = 1
scene.add(pointLight)

const pointLight2 = new THREE.PointLight(0xff0000, 1)
pointLight2.position.set(-0.294,-0.069,-1.587)
scene.add(pointLight2)

const pointLight2GUIFolder = gui.addFolder('PointLight 2')
pointLight2GUIFolder.add(pointLight2.position, 'x').min(-10 ).max(10).step(0.001)
pointLight2GUIFolder.add(pointLight2.position, 'y').min(-10 ).max(10).step(0.001)
pointLight2GUIFolder.add(pointLight2.position, 'z').min(-10 ).max(10).step(0.001)

const pointLightHelper = new THREE.PointLightHelper(pointLight2,1)
//scene.add(pointLightHelper)
const pointLightHelper2 = new THREE.PointLightHelper(pointLight,1)
//scene.add(pointLightHelper2)



//Point cloud trial
function LoadPointCloud() {
    const loader = new PCDLoader();
    loader.load(
        // resource URL
        '/JSONs/p213.pcd',
        // called when the resource is loaded
        function ( mesh ) {
    
            scene.add( mesh );
    
        },
        // called when loading is in progresses
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
            console.log(error)
    
        }
    );
}
LoadPointCloud();
//Point cloud trial

//Point cloud from json and particle system

function loadParticleSystemFromJSON() {
    // create the particle variables
    var particleCount = 1800,
        particles = new THREE.Geometry(),
        pMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 20
        });

    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        var pX = Math.random() * 500 - 250,
            pY = Math.random() * 500 - 250,
            pZ = Math.random() * 500 - 250,
            particle = new THREE.Vertex(
                new THREE.Vector3(pX, pY, pZ)
            );
        // create a velocity vector
        particle.velocity = new THREE.Vector3(
            0,				// x
            -Math.random(),	// y
            0);				// z

        // add it to the geometry
        particles.vertices.push(particle);
    }

    // create the particle system
    var particleSystem = new THREE.ParticleSystem(
        particles,
        pMaterial);

    // add it to the scene
    scene.addChild(particleSystem);

    // create the particle variables
    var pMaterial = new THREE.ParticleBasicMaterial({
        color: 0xFFFFFF,
        size: 20,
        map: THREE.ImageUtils.loadTexture(
            "/Textures/T_Particle.png"
        ),
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    // also update the particle system to
    // sort the particles which enables
    // the behaviour we want
    particleSystem.sortParticles = true;

}
//loadParticleSystemFromJSON();

//Point cloud from json and particle system



const light2Color = {
    color: 0xff0000
}

pointLight2GUIFolder.addColor(light2Color, 'color').onChange(() => {
    pointLight2.color.set(light2Color.color)
})
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//Event Listeners

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

document.addEventListener('mousemove', onDocumentMouseMove)

let mouseX = 0
let mouseY = 0
let targetX = 0 
let targetY = 0

const windowHalfX = window.innerWidth
const windowHalfY = window.innerHeight

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX)
    mouseY = (event.clientY - windowHalfY)
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls

 const controls = new OrbitControls(camera, canvas)
 controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    targetX = mouseX * 0.001
    targetY = mouseY * 0.001
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    torus.rotation.y = .5 * elapsedTime

    torus.rotation.y += 0.5 * (targetX - torus.rotation.y)    
    torus.rotation.x += 0.5 * (targetY - torus.rotation.x)
    torus.rotation.z += -0.5 * (targetY - torus.rotation.x)

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()