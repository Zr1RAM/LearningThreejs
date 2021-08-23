import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

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
scene.add(torus)
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
scene.add(pointLightHelper)
const pointLightHelper2 = new THREE.PointLightHelper(pointLight,1)
scene.add(pointLightHelper2)

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
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

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