import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import * as dat from 'dat.gui'

// Debug
const gui = new dat.GUI()
RectAreaLightUniformsLib.init()
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background= new THREE.Color(0x252525)
// Loader
const textureLoader = new THREE.TextureLoader()
const basicTexture = textureLoader.load('/textures/texture.jpeg')

// Materials

const material = new THREE.MeshStandardMaterial()
material.roughness= 0.6
material.metalness= 0.8
material.color = new THREE.Color(0x550080)
//material.normalMap = basicTexture
material.skinning = true
material.specular = new THREE.Color(0xFFCAF9)
material.emissive = new THREE.Color(0x25252)
const geometry = new THREE.CylinderGeometry( 1, 1, 15, 20, 102, false, 30 );

// create the skin indices and skin weights

const position = geometry.attributes.position;

let boneHeight= 15/180
const vertex = new THREE.Vector3();

const skinIndices = [];
const skinWeights = [];
console.log(position)
for ( let i = 0; i < position.count; i ++ ) {

    vertex.fromBufferAttribute( position, i );

    // compute skinIndex and skinWeight based on some configuration data

    const y = ( vertex.y + 7.5 );

    const skinIndex = Math.floor( y / boneHeight );
    const skinWeight = ( y % boneHeight ) / boneHeight;

    skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
    skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

}


geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );
// create skinned mesh and skeleton

const mesh = new THREE.SkinnedMesh( geometry, material );

const boneArr = [];
const firstBone = new THREE.Bone();
firstBone.position.y = -7.5;

boneArr.push(firstBone)

for (let z = 0; z<180; z++){
    const boneEl = new THREE.Bone();
    boneEl.position.y = boneHeight;
    boneArr[boneArr.length-1].add(boneEl);
    boneArr.push(boneEl)
}

// see example from THREE.Skeleton

const skeleton = new THREE.Skeleton( boneArr );
const rootBone = skeleton.bones[ 0 ];
mesh.add( rootBone );

// bind the skeleton to the mesh

mesh.bind( skeleton );

scene.add(mesh)






// Mesh
//const sphere = new THREE.Mesh(geometry,material)
//scene.add(sphere)

// Lights

const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.x = 2
pointLight.position.y = 10
pointLight.position.z = 10
scene.add(pointLight)
const ambientLight = new THREE.AmbientLight(0xffffff, 10)

const rectLight = new THREE.RectAreaLight(0xFF88F2, 50, 0.8, 100);
rectLight.position.set(15, 0, 0);
rectLight.lookAt(0, 0, 0)
scene.add(rectLight)
const rectLight2 = new THREE.RectAreaLight(0xFF88F2, 50, 0.8, 100);
rectLight2.position.set(-15, 0, 0);
rectLight2.lookAt(0, 0, 0)
scene.add(rectLight2)
const rectLight3 = new THREE.RectAreaLight(0xFF55ED, 1, 100, 100);
rectLight3.position.set(0, -25, 0);
rectLight3.lookAt(0, 0, 0)
scene.add(rectLight3)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 15
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()
const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    //mesh.skeleton.bones[1].rotation.z = -Math.sin(elapsedTime*5)
    //skeleton.bones[2].rotation.x = -Math.sin(elapsedTime*5)
    //skeleton.bones[2].rotation.y =
    //skeleton.bones[3].rotation.x = Math.sin(elapsedTime*5)
    //skeleton.bones[3].rotation.y = Math.sin(elapsedTime*5)
    //skeleton.bones[].position.x = Math.sin(elapsedTime)*2


    skeleton.bones.forEach(( bone, index)=>{

        let multiplier = index > 90 ? +3.2 : -2

        bone.rotation.z = Math.PI / 180* Math.sin(elapsedTime*multiplier)
    })
    skeleton.bones[0].rotation.y += 0.02

    // Update objects
    //sphere.rotation.y = .5 * elapsedTime
    //mesh.skeleton.bones[ 0 ].position.x += 0.2;
    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()