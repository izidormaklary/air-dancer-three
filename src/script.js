import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {RectAreaLightUniformsLib} from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import * as dat from 'dat.gui'

// Debug
const gui = new dat.GUI()
RectAreaLightUniformsLib.init()
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x252525)
// Loader
const textureLoader = new THREE.TextureLoader()
const basicTexture = textureLoader.load('/textures/texture.jpeg')

// Materials

const material = new THREE.MeshStandardMaterial()
material.roughness = 0.6
material.metalness = 0.8
material.color = new THREE.Color(0x550080)
// material.normalMap = basicTexture
material.skinning = true
material.specular = new THREE.Color(0xFFCAF9)
material.emissive = new THREE.Color(0x25252)
// material.wireframe= true

// Sizes

let bodySizes = {
    height: 15,
    boneCount: 45,
    boneHeight: 15 / 45
}
let arm1Sizes = {
    height: 4,
    boneCount: 8,
    boneHeight: 4 / 8
}
// Geometries

const bodyGeometry = new THREE.CylinderGeometry(1, 1, bodySizes.height, 20, bodySizes.boneCount, false, 30);
const arm1Geometry = new THREE.CylinderGeometry(0.5, 0.5, arm1Sizes.height, 10, arm1Sizes.boneCount, false, 30);
const arm2Geometry = new THREE.CylinderGeometry(0.5, 0.5, arm1Sizes.height, 10, arm1Sizes.boneCount, false, 30);

// create the skin indices and skin weights


const skinGenerator =(sizingObject, geometryObject)=>{
    const geometryPositions= geometryObject.attributes.position
    const meshSkinIndices = [];
    const meshSkinWeights = [];
    for (let g = 0; g < geometryPositions.count; g++) {
        const vertex = new THREE.Vector3()

        vertex.fromBufferAttribute(geometryPositions, g);
        // compute skinIndex and skinWeight based on some configuration data

        const y = (vertex.y + sizingObject.height / 2);

        const skinIndex = Math.floor(y / sizingObject.boneHeight);
        const skinWeight = (y % sizingObject.boneHeight) / sizingObject.boneHeight;

        meshSkinIndices.push(skinIndex, skinIndex + 1, 0, 0);
        meshSkinWeights.push(1 - skinWeight, skinWeight, 0, 0);

    }
    geometryObject.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(meshSkinIndices, 4));
    geometryObject.setAttribute('skinWeight', new THREE.Float32BufferAttribute(meshSkinWeights, 4));

}

skinGenerator(bodySizes, bodyGeometry)
skinGenerator(arm1Sizes, arm1Geometry)

// Meshes

const bodyMesh = new THREE.SkinnedMesh(bodyGeometry, material);
const arm1Mesh = new THREE.SkinnedMesh(arm1Geometry, material);
arm1Mesh.rotation.z= Math.PI / 2
const arm2Mesh = new THREE.SkinnedMesh(arm1Geometry, material);
arm2Mesh.rotation.z= -Math.PI / 2
// Bones

// except first bone
const verticalBoneGenerator = (sizingObject,bonesArray) =>{
    for (let z = 0; z < sizingObject.boneCount; z++) {
        const boneEl = new THREE.Bone();
        boneEl.position.y = sizingObject.boneHeight;
        bonesArray[bonesArray.length - 1].add(boneEl);
        bonesArray.push(boneEl)
    }
}

const bodyBones = [];
const firstBone = new THREE.Bone();
firstBone.position.y = -bodySizes.height / 2;

bodyBones.push(firstBone)

verticalBoneGenerator(bodySizes, bodyBones)

const skeleton = new THREE.Skeleton(bodyBones);
const rootBone = skeleton.bones[0];

// setting root bones
bodyMesh.add(rootBone);
bodyMesh.bind(skeleton);
scene.add(bodyMesh)


// First arm

const arm1Bones = []

const arm1FirstBone = new THREE.Bone()

arm1FirstBone.position.y= -arm1Sizes.height/2

arm1Bones.push(arm1FirstBone)

verticalBoneGenerator(arm1Sizes, arm1Bones )

const arm1Skeleton = new THREE.Skeleton(arm1Bones)


// bind the skeleton to the mesh

arm1Mesh.add(arm1Skeleton.bones[0]);
arm1Mesh.bind(arm1Skeleton)
scene.add(arm1Mesh)



// Second arm

const arm2Bones = []

const arm2FirstBone = new THREE.Bone()

arm2FirstBone.position.y= -arm1Sizes.height/2

arm2Bones.push(arm2FirstBone)

verticalBoneGenerator(arm1Sizes, arm2Bones )

const arm2Skeleton = new THREE.Skeleton(arm2Bones)


// bind the skeleton to the mesh

arm2Mesh.add(arm2Skeleton.bones[0]);
arm2Mesh.bind(arm2Skeleton)
scene.add(arm2Mesh)


// Skeleton Helpers

// const skHelper = new THREE.SkeletonHelper(bodyMesh)
// scene.add(skHelper)
// const skArmHelper = new THREE.SkeletonHelper(arm1Mesh)
// scene.add(skArmHelper)

// Lights

const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.x = 2
pointLight.position.y = 10
pointLight.position.z = 10
scene.add(pointLight)

const rectLight = new THREE.RectAreaLight(0xFF88F2, 50, 0.8, 100);
rectLight.position.set(15, 0, 0);
rectLight.lookAt(0, 0, 0)
scene.add(rectLight)

const rectLight2 = new THREE.RectAreaLight(0xFF88F2, 50, 0.8, 100);
rectLight2.position.set(-15, 0, 0);
rectLight2.lookAt(0, 0, 0)
scene.add(rectLight2)

const rectLight3 = new THREE.RectAreaLight(0xFF55ED, 1, 100, 100);
rectLight3.position.set(0, -15, 0);
rectLight3.lookAt(0, 0, 0)
scene.add(rectLight3)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
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
const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    bodyMesh.skeleton.bones.slice(1).forEach((bone, index) => {
        let multiplier = index < bodySizes.boneCount / 2 ? -2 : +4.6;
        bone.rotation.z = Math.PI / bodySizes.boneCount * Math.sin((elapsedTime * multiplier) - index / 5)

    })
    arm1Mesh.skeleton.bones[0].rotation.z = 6.6666*bodyMesh.skeleton.bones[30].rotation.z
    arm2Mesh.skeleton.bones[0].rotation.z = 6.6666*bodyMesh.skeleton.bones[30].rotation.z

    arm1Skeleton.bones.slice(3).forEach(bone => {

        bone.rotation.z = Math.PI / 15 * Math.sin((elapsedTime * 4))
    })

    arm2Skeleton.bones.slice(3).forEach(bone => {

        bone.rotation.z = Math.PI / 15 * Math.sin(((elapsedTime+10) * 4))
    })
    bodyMesh.skeleton.bones[0].rotation.y += 0.02

    arm1Mesh.position.x = bodyMesh.skeleton.bones[30].getWorldPosition(new THREE.Vector3()).x-2
    arm1Mesh.position.y = bodyMesh.skeleton.bones[30].getWorldPosition(new THREE.Vector3()).y
    arm1Mesh.position.z = bodyMesh.skeleton.bones[30].getWorldPosition(new THREE.Vector3()).z
    arm2Mesh.position.x = bodyMesh.skeleton.bones[30].getWorldPosition(new THREE.Vector3()).x+2
    arm2Mesh.position.y = bodyMesh.skeleton.bones[30].getWorldPosition(new THREE.Vector3()).y
    arm2Mesh.position.z = bodyMesh.skeleton.bones[30].getWorldPosition(new THREE.Vector3()).z

    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()