import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {RectAreaLightUniformsLib} from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import * as dat from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {AnimationMixer} from "three";


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
material.side = THREE.DoubleSide
// material.normalMap = basicTexture
material.skinning = true
material.specular = new THREE.Color(0xFFCAF9)
material.emissive = new THREE.Color(0x25252)
// material.clipIntersection = true
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
let hairSizes = {
    height: .8,
    boneCount: 3,
    boneHeight: .8/3,
    width: 0.2,
    count: 28
}
// Geometries

const bodyGeometry = new THREE.CylinderBufferGeometry(1, 1, bodySizes.height, 20, bodySizes.boneCount, true, 30);
const armGeometry = new THREE.CylinderBufferGeometry(0.3, 0.5, arm1Sizes.height, 10, arm1Sizes.boneCount, true, 30);



const hairGeometry = new THREE.PlaneBufferGeometry(hairSizes.width, hairSizes.height, 1, 9)

// create the skin indices and skin weights


const skinGenerator = (sizingObject, geometryObject) => {
    const geometryPositions = geometryObject.attributes.position
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
skinGenerator(arm1Sizes, armGeometry)
skinGenerator(hairSizes, hairGeometry)

// Meshes

const bodyMesh = new THREE.SkinnedMesh(bodyGeometry, material);
const arm1Mesh = new THREE.SkinnedMesh(armGeometry, material);
arm1Mesh.rotation.z = Math.PI / 2
const arm2Mesh = new THREE.SkinnedMesh(armGeometry, material);
arm2Mesh.rotation.z = -Math.PI / 2
const hairMeshSample = new THREE.SkinnedMesh(hairGeometry, material)

// Bones

// except first bone
const verticalBoneGenerator = (sizingObject, bonesArray) => {
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

arm1FirstBone.position.y = -arm1Sizes.height / 2

arm1Bones.push(arm1FirstBone)

verticalBoneGenerator(arm1Sizes, arm1Bones)

const arm1Skeleton = new THREE.Skeleton(arm1Bones)


// bind the skeleton to the mesh

arm1Mesh.add(arm1Skeleton.bones[0]);
arm1Mesh.bind(arm1Skeleton)
// scene.add(arm1Mesh)


// Second arm

const arm2Bones = []

const arm2FirstBone = new THREE.Bone()

arm2FirstBone.position.y = -arm1Sizes.height / 2

arm2Bones.push(arm2FirstBone)

verticalBoneGenerator(arm1Sizes, arm2Bones)

const arm2Skeleton = new THREE.Skeleton(arm2Bones)


// bind the skeleton to the mesh

arm2Mesh.add(arm2Skeleton.bones[0]);
arm2Mesh.bind(arm2Skeleton)
// scene.add(arm2Mesh)

// Binding arms to body
arm1Mesh.position.x = -2
arm2Mesh.position.x = 2
arm1Mesh.rotation.z = Math.PI / 3
arm2Mesh.rotation.z = -Math.PI / 3


bodyMesh.skeleton.bones[30].add(arm1Mesh)
bodyMesh.skeleton.bones[30].add(arm2Mesh)

// Hair generator
const hairGroup = new THREE.Group()





for (let i = 0; i < hairSizes.count; i++){
    const hairBones = []

    const hairFirstBone = new THREE.Bone()

    hairFirstBone.position.y = -hairSizes.height / 2

    hairBones.push(hairFirstBone)

    verticalBoneGenerator(hairSizes, hairBones)

    const hairSkeleton = new THREE.Skeleton(hairBones)

    const hairMesh = hairMeshSample.clone()

    hairMesh.add(hairSkeleton.bones[0])
    hairMesh.bind(hairSkeleton)

    // const skHelper = new THREE.SkeletonHelper(hairMesh)
    // scene.add(skHelper)


    hairMesh.rotation.y= Math.PI/(hairSizes.count/2)*i
    hairMesh.translateOnAxis(new THREE.Vector3(0,0,1), 1)
    // scene.add(hairMesh)
    // hairMesh.bind(bodyMesh.skeleton.bones[bodyMesh.skeleton.bones.length-1])
    hairGroup.add(hairMesh)
    // bodyMesh.skeleton.bones[bodyMesh.skeleton.bones.length-1].add(hairMesh)
}


// Binding hair to body
// scene.add(hairGroup)
hairGroup.position.y= hairSizes.height/2

bodyMesh.skeleton.bones[bodyMesh.skeleton.bones.length-1].add(hairGroup)
// hairGroup.bind(bodyMesh.skeleton.bones[bodyMesh.skeleton.bones.length-1])


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

// set up rotation about z axis
const zAxis = new THREE.Vector3(0, 0, 1);


// lean left
const initialRotation = new THREE.Quaternion().setFromAxisAngle(zAxis, 0);
const finalRotationLeft = new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI / (bodySizes.boneCount / 2));
const finalRotationRight = new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI / -(bodySizes.boneCount / 2));

// Generate Keyframes

const KFCount = 3
const KFIndexArr = []
const quaternionValueArrLeft = []
const quaternionValueArrRight = []
for (let i = 0; i < KFCount; i++) {

    KFIndexArr.push(i + 1)

    if (i % 2 === 0) {
        quaternionValueArrLeft.push(initialRotation.x, initialRotation.y, initialRotation.z, initialRotation.w)
        quaternionValueArrRight.push(initialRotation.x, initialRotation.y, initialRotation.z, initialRotation.w)
    } else {
        quaternionValueArrLeft.push(finalRotationLeft.x, finalRotationLeft.y, finalRotationLeft.z, finalRotationLeft.w)
        quaternionValueArrRight.push(finalRotationRight.x, finalRotationRight.y, finalRotationRight.z, finalRotationRight.w)
    }
}


const rotationKFLeft = new THREE.QuaternionKeyframeTrack('.quaternion', KFIndexArr, quaternionValueArrLeft);
const rotationKFRight = new THREE.QuaternionKeyframeTrack('.quaternion', KFIndexArr, quaternionValueArrRight);


// create an animation sequence with the tracks
// If a negative time value is passed, the duration will be calculated from the times of the passed tracks array
const clipLeft = new THREE.AnimationClip('left', KFCount, [rotationKFLeft]);
const clipRight = new THREE.AnimationClip('right', KFCount, [rotationKFRight]);

// setup the THREE.AnimationMixer1


// const animationGroup = new THREE.AnimationObjectGroup(...bodyBones.slice(1, bodySizes.boneCount-2))
const bodyBonesMixerArr = []
for (let i = 1; i < bodyBones.length - 1; i += 1) {
    const mixer = new THREE.AnimationMixer(bodyBones[i])
    const clipActionLeft = mixer.clipAction(clipLeft)
    const clipActionRight = mixer.clipAction(clipRight)
    clipActionLeft.setDuration(0.4)
    clipActionRight.setDuration(0.4)
    clipActionLeft.setLoop(THREE.LoopOnce)
    clipActionRight.setLoop(THREE.LoopOnce)
    bodyBonesMixerArr.push({mixer: mixer, clipActionLeft: clipActionLeft, clipActionRight: clipActionRight})

}


// const mixer = new THREE.AnimationMixer(animationGroup);
// // create a ClipAction and set it to play
// const clipActionLeft = mixer.clipActionLeft( clip );
// clipActionLeft.play();

let animationStatus = false
console.log(bodyBonesMixerArr[bodyBonesMixerArr.length - 1].mixer)
bodyBonesMixerArr[bodyBonesMixerArr.length - 1].mixer.addEventListener('finished', (e) => {
    animationStatus = false
    // obj.mixer.uncacheAction(obj.clipActionLeft)
    // obj.clipActionLeft.stop().play()
});


const startAnimationsAt = (random) => {

    bodyBonesMixerArr.slice(random).forEach((obj, index) => {
        setTimeout(() => {
            if (random % 2 === 0) {
                obj.clipActionLeft.reset()
                obj.clipActionLeft.play()
            } else {
                obj.clipActionRight.reset()
                obj.clipActionRight.play()
            }
        }, index * 20)

    })
}



const clock = new THREE.Clock()


const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {

    window.requestAnimationFrame(animate);

    render();

}


const render = () => {
    const delta = clock.getDelta();




    bodyMesh.skeleton.bones.slice(1).forEach((bone, index) => {
        let multiplier = index < bodySizes.boneCount / 2 ? -2 : +4.6;
        bone.quaternion.z = Math.PI / bodySizes.boneCount * (Math.sin((clock.getElapsedTime()) * multiplier))/4

    })

    // let boneIndex = Math.round((Math.sin(elapsedTime-1)+1) *bodySizes.boneCount/ 2)
    //
    // bodyMesh.skeleton.bones[boneIndex-1].rotation.z = 0
    // bodyMesh.skeleton.bones[boneIndex].rotation.z = 2
    // console.log(boneIndex)
    // arm1Mesh.skeleton.bones[0].quaternion.z = 60 * bodyMesh.skeleton.bones[30].quaternion.z - 0.5
    // arm2Mesh.skeleton.bones[0].quaternion.z = 20 * bodyMesh.skeleton.bones[30].quaternion.z + 0.5



    // arm1Mesh.skeleton.bones[0].rotation.z = 2 * bodyMesh.skeleton.bones[30].rotation.z - 0.5
    // arm2Mesh.skeleton.bones[0].rotation.z = 5 * bodyMesh.skeleton.bones[30].rotation.z + 1

    arm1Skeleton.bones.slice(3).forEach((bone, index) => {

        bone.rotation.z = Math.PI / 15 * Math.sin((clock.getElapsedTime()*8+index))
    })

    arm2Skeleton.bones.slice(3).forEach((bone, index) => {
        bone.rotation.z = Math.PI / 15 * Math.sin((clock.getElapsedTime()*10+index))
    })
    // bodyMesh.skeleton.bones[0].rotation.y += 0.02
    //
    hairGroup.children.forEach((hair, index)=>{
        hair.skeleton.bones.slice(0).forEach(bone=>{
            bone.rotation.x = Math.PI/hairSizes.boneCount *(Math.sin( clock.getElapsedTime()*10+index) /5)
        })
    })

    if (animationStatus) {

        bodyBonesMixerArr.forEach(el => {
                el.mixer.update((delta))
            }
        )

    }

    if (!animationStatus) {
        animationStatus = true
        let random = Math.floor(Math.random() * bodyBonesMixerArr.length);
        startAnimationsAt(random)
    }

    // Update Orbital Controls
    controls.update()
    stats.update();
    // Render
    renderer.render(scene, camera)

    // Call render again on the next frame
    // window.requestAnimationFrame(render)
}

animate()




