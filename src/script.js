import './style.css';
import * as THREE from 'three';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RectAreaLightUniformsLib} from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
// import Stats from 'three/examples/jsm/libs/stats.module.js';

RectAreaLightUniformsLib.init();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x252525);

// Materials

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.6;
material.metalness = 0.8;
material.color = new THREE.Color(0x550080);
material.side = THREE.DoubleSide;
material.skinning = true;
material.specular = new THREE.Color(0xFFCAF9);
material.emissive = new THREE.Color(0x25252);

/**
 * Sizes
 */
const screenSizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

let bodySizes = {
    height: 15,
    boneCount: 45,
    boneHeight: 15 / 45
};
let armSizes = {
    height: 4,
    boneCount: 8,
    boneHeight: 4 / 8
};
let hairSizes = {
    height: 1,
    boneCount: 3,
    boneHeight: 1 / 3,
    width: 0.2,
    count: 28
};

// Geometries

const bodyGeometry = new THREE.CylinderBufferGeometry(1, 1, bodySizes.height, 20, bodySizes.boneCount, true, 30);
const armGeometry = new THREE.CylinderBufferGeometry(0.3, 0.5, armSizes.height, 10, armSizes.boneCount, true, 30);
const hairGeometry = new THREE.PlaneBufferGeometry(hairSizes.width, hairSizes.height, 1, 9);

// create the skin indices and skin weights

const skinGenerator = (sizingObject, geometryObject) => {
    const geometryPositions = geometryObject.attributes.position;
    const meshSkinIndices = [];
    const meshSkinWeights = [];
    for (let g = 0; g < geometryPositions.count; g++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(geometryPositions, g);
        const y = (vertex.y + sizingObject.height / 2);
        const skinIndex = Math.floor(y / sizingObject.boneHeight);
        const skinWeight = (y % sizingObject.boneHeight) / sizingObject.boneHeight;

        meshSkinIndices.push(skinIndex, skinIndex + 1, 0, 0);
        meshSkinWeights.push(1 - skinWeight, skinWeight, 0, 0);

    }
    geometryObject.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(meshSkinIndices, 4));
    geometryObject.setAttribute('skinWeight', new THREE.Float32BufferAttribute(meshSkinWeights, 4));
}

skinGenerator(bodySizes, bodyGeometry);
skinGenerator(armSizes, armGeometry);
skinGenerator(hairSizes, hairGeometry);

// Meshes

const bodyMesh = new THREE.SkinnedMesh(bodyGeometry, material);
const arm1Mesh = new THREE.SkinnedMesh(armGeometry, material);
arm1Mesh.rotation.z = Math.PI / 2;
const arm2Mesh = new THREE.SkinnedMesh(armGeometry, material);
arm2Mesh.rotation.z = -Math.PI / 2;


// Method to create skeletons for meshes based on the sizing object
const meshSkeletonSetup = (sizingObject, mesh) => {

    // First bone relatively positioned to the mesh (on the bottom)
    const tempBoneArr = [];
    const firstBone = new THREE.Bone();
    firstBone.position.y = -sizingObject.height / 2;

    tempBoneArr.push(firstBone);
    for (let z = 0; z < sizingObject.boneCount; z++) {
        // other bones relatively positioned to the previous bone in the array
        const boneEl = new THREE.Bone();
        boneEl.position.y = sizingObject.boneHeight;
        tempBoneArr[tempBoneArr.length - 1].add(boneEl);
        tempBoneArr.push(boneEl);
    }

    // binding skeleton and its root bone to the mesh
    const skeleton = new THREE.Skeleton(tempBoneArr);
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
};

// Body as the "parent" gets added directly to the scene
meshSkeletonSetup(bodySizes, bodyMesh);
scene.add(bodyMesh);

meshSkeletonSetup(armSizes, arm1Mesh);
meshSkeletonSetup(armSizes, arm2Mesh);

// Binding arms to the body
arm1Mesh.position.x = -2;
arm2Mesh.position.x = 2;
arm1Mesh.rotation.z = Math.PI / 3;
arm2Mesh.rotation.z = -Math.PI / 3;

bodyMesh.skeleton.bones[30].add(arm1Mesh);
bodyMesh.skeleton.bones[30].add(arm2Mesh);

// Hair generator
const hairGroup = new THREE.Group();

for (let i = 0; i < hairSizes.count; i++) {

    // creating mesh with skeleton based on the plane geometry
    const hairMesh = new THREE.SkinnedMesh(hairGeometry, material);
    meshSkeletonSetup(hairSizes, hairMesh);

    // setting rotation first then moving it outwards so each plane is aligned along the cylinders edge
    hairMesh.rotation.y = Math.PI / (hairSizes.count / 2) * i;
    hairMesh.translateOnAxis(new THREE.Vector3(0, 0, 1), 1);

    // grouping hair "strings"
    hairGroup.add(hairMesh);
}


// Binding hair group to body
hairGroup.position.y = hairSizes.height / 2 - 0.05;
bodyMesh.skeleton.bones[bodyMesh.skeleton.bones.length - 1].add(hairGroup);

// Lights

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(2, 10, 10);
scene.add(pointLight);

const rectLight = new THREE.RectAreaLight(0xFF88F2, 50, 0.8, 100);
rectLight.position.set(15, 0, 0);
rectLight.lookAt(0, 0, 0);
scene.add(rectLight);

const rectLight2 = new THREE.RectAreaLight(0xFF88F2, 50, 0.8, 100);
rectLight2.position.set(-15, 0, 0);
rectLight2.lookAt(0, 0, 0);
scene.add(rectLight2);

const rectLight3 = new THREE.RectAreaLight(0xFF55ED, 1, 100, 100);
rectLight3.position.set(0, -15, 0);
rectLight3.lookAt(0, 0, 0);
scene.add(rectLight3);


window.addEventListener('resize', () => {
    // Update screenSizes
    screenSizes.width = window.innerWidth;
    screenSizes.height = window.innerHeight;

    // Update camera
    camera.aspect = screenSizes.width / screenSizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(screenSizes.width, screenSizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, screenSizes.width / screenSizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 15;
scene.add(camera);

// OPTIONAL Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(screenSizes.width, screenSizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

// rotations on z axis
const zAxis = new THREE.Vector3(0, 0, 1);

const initialRotation = new THREE.Quaternion().setFromAxisAngle(zAxis, 0);
const finalRotationLeft = new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI / (bodySizes.boneCount / 2));
const finalRotationRight = new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI / -(bodySizes.boneCount / 2));

// Generate Keyframes

const KFCount = 3;

// 2 arrays representing rotation values (in groups of four: x, y, z, w)
const quaternionValueArrLeft = [];
const quaternionValueArrRight = [];

// number of groups
const KFIndexArr = [];
for (let i = 0; i < KFCount; i++) {
    KFIndexArr.push(i + 1);

    // even keyframe is a non-rotated value group
    if (i % 2 === 0) {
        quaternionValueArrLeft.push(initialRotation.x, initialRotation.y, initialRotation.z, initialRotation.w);
        quaternionValueArrRight.push(initialRotation.x, initialRotation.y, initialRotation.z, initialRotation.w);
    } else {
        // odd keyframes are rotated value groups in either direction
        quaternionValueArrLeft.push(finalRotationLeft.x, finalRotationLeft.y, finalRotationLeft.z, finalRotationLeft.w);
        quaternionValueArrRight.push(finalRotationRight.x, finalRotationRight.y, finalRotationRight.z, finalRotationRight.w);
    }
}

// creating keyframe tracks then clips
const rotationKFLeft = new THREE.QuaternionKeyframeTrack('.quaternion', KFIndexArr, quaternionValueArrLeft);
const rotationKFRight = new THREE.QuaternionKeyframeTrack('.quaternion', KFIndexArr, quaternionValueArrRight);


const clipLeft = new THREE.AnimationClip('left', KFCount, [rotationKFLeft]);
const clipRight = new THREE.AnimationClip('right', KFCount, [rotationKFRight]);


const bodyBonesMixerArr = []

// mixer array for each bone in the body and with both clips
for (let i = 1; i < bodyMesh.skeleton.bones.length - 1; i += 1) {
    const mixer = new THREE.AnimationMixer(bodyMesh.skeleton.bones[i]);
    const clipActionLeft = mixer.clipAction(clipLeft);
    const clipActionRight = mixer.clipAction(clipRight);
    clipActionLeft.setDuration(0.4);
    clipActionRight.setDuration(0.4);
    clipActionLeft.setLoop(THREE.LoopOnce);
    clipActionRight.setLoop(THREE.LoopOnce);
    bodyBonesMixerArr.push({mixer: mixer, clipActionLeft: clipActionLeft, clipActionRight: clipActionRight});
}


// animation logic: if status is false start animation
let animationStatus = false;

// when animation is finished set status to false, so it restarts
bodyBonesMixerArr[bodyBonesMixerArr.length - 1].mixer.addEventListener('finished', (e) => {
    animationStatus = false;
});


const startAnimationsAt = (random) => {
    // take a slice of an array and start animation clips with delay
    bodyBonesMixerArr.slice(random).forEach((obj, index) => {
        setTimeout(() => {
            if (random % 2 === 0) {
                obj.clipActionLeft.reset()
                obj.clipActionLeft.play()
            } else {
                obj.clipActionRight.reset()
                obj.clipActionRight.play()
            }
        }, index * 20);

    });
}

const clock = new THREE.Clock();

function animate() {

    window.requestAnimationFrame(animate);

    render();
}


const render = () => {

    const delta = clock.getDelta();

    // body animations
    bodyMesh.skeleton.bones.slice(1).forEach((bone, index) => {
        let multiplier = index < bodySizes.boneCount / 2 ? -2 : +4.6;
        // rotate each bone in the body
        bone.quaternion.z = Math.PI / bodySizes.boneCount * (Math.sin((clock.getElapsedTime()) * multiplier)) / 4;
    });
    bodyMesh.skeleton.bones[0].rotation.y += 0.002


    // arm animations
    arm1Mesh.skeleton.bones.slice(3).forEach((bone, index) => {
        bone.rotation.z = Math.PI / 15 * Math.sin((clock.getElapsedTime() * 10 + index));
    });

    arm2Mesh.skeleton.bones.slice(3).forEach((bone, index) => {
        bone.rotation.z = Math.PI / 15 * Math.sin((clock.getElapsedTime() * 10 + index));
    });


    // hair animations
    hairGroup.children.forEach((hair, index) => {
        hair.skeleton.bones.slice(0).forEach(bone => {
            bone.rotation.x = Math.PI / hairSizes.boneCount * (Math.sin(clock.getElapsedTime() * 20 + index) / 5);
        });
    });

    // update/restart animation clips
    if (animationStatus) {
        bodyBonesMixerArr.forEach(el => {
            el.mixer.update((delta));
        });
    }else{
        animationStatus = true
        let random = Math.floor(Math.random() * bodyBonesMixerArr.length / 2);
        startAnimationsAt(random)
    }

    // OPTIONAL Update Orbital Controls
    // controls.update()

    renderer.render(scene, camera)

}
animate()