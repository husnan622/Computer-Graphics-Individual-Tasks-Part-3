import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js";

/** @type {THREE.PerspectiveCamera} */
let camera;
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;

let count = 0,
    cubeCamera1,
    cubeCamera2,
    cubeRenderTarget1,
    cubeRenderTarget2;

(function init() {
    scene = new THREE.Scene();
    const color = 0xffffff;
    const near = 5;
    const far = 30;
    scene.fog = new THREE.Fog(color, near, far);

    // Lights
    const ambientLight = new THREE.AmbientLight("white", 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("white", 1);
    directionalLight.position.set(70, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Camera
    camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
    camera.position.z = 10;

    // Background
    const loader = new THREE.TextureLoader();
    const texture = loader.load("assets/images/beach.jpg", () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt.texture;
    });

    // Box
    const sandMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load("assets/images/sand.jpg"),
    });
    const wallMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load("assets/images/wall.jpg"),
    });

    const sand = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 15, 100, 100),
        sandMaterial
    );
    sand.receiveShadow = true;
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -3;
    scene.add(sand);

    const wall1 = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 7.5, 100, 100),
        wallMaterial
    );
    wall1.receiveShadow = true;
    wall1.rotation.y = -Math.PI / 2;
    wall1.position.x = 7.5;
    wall1.position.y = 0.75;
    scene.add(wall1);

    const wall2 = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 7.5, 100, 100),
        wallMaterial
    );
    wall2.receiveShadow = true;
    wall2.rotation.y = -Math.PI;
    wall2.position.x = 0;
    wall2.position.y = 0.75;
    wall2.position.z = -7.5;
    scene.add(wall2);

    const wall3 = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 7.5, 100, 100),
        wallMaterial
    );
    wall3.receiveShadow = true;
    wall3.rotation.y = -Math.PI / 2;
    wall3.position.x = -7.5;
    wall3.position.y = 0.75;
    scene.add(wall3);

    // Torus Knot
    const torusTexture = new THREE.TextureLoader().load("assets/images/metal.jpg");
    const torusGeometry = new THREE.TorusKnotGeometry( 0.5, 0.15, 100, 16 );
    const torusMaterial = new THREE.MeshPhongMaterial({
        map: torusTexture,
    });
    const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    torusKnot.position.set(0, 1.5, 0);
    scene.add(torusKnot);

    // Beach Model
    const beach = new GLTFLoader();
    beach.load("assets/models/beach_2020/scene.gltf", (gltf) => {
        gltf.scene.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                node.position.set(0, 0, -12);
                node.scale.set(0.13, 0.13, 0.13);
                node.rotation.z = Math.PI;
            }
        });
        scene.add(gltf.scene);
    });

    // Reflective
    cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding,
    });

    cubeCamera1 = new THREE.CubeCamera(1, 1000, cubeRenderTarget1);

    cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding,
    });

    cubeCamera2 = new THREE.CubeCamera(1, 1000, cubeRenderTarget2);

    const refGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const refMaterial = new THREE.MeshBasicMaterial({
        envMap: cubeRenderTarget2.texture,
        combine: THREE.MultiplyOperation,
        reflectivity: 1,
    });
    const reflective = new THREE.Mesh(refGeometry, refMaterial);

    reflective.castShadow = true;
    reflective.receiveShadow = true;

    reflective.position.set(0, -0.35, 0);
    scene.add(reflective);

    // Render
    renderer = new THREE.WebGLRenderer({ antialias: true });

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.render(scene, camera);
    document.body.appendChild(renderer.domElement);

    function animation() {
        torusKnot.rotation.x += 0.01;
        torusKnot.rotation.y += 0.01;
        torusKnot.rotation.z += 0.01;

        if (count % 2 === 0) {
            cubeCamera1.update(renderer, scene);
        } else {
            cubeCamera2.update(renderer, scene);
        }

        count++;

        renderer.render(scene, camera);
        requestAnimationFrame(animation);
    }
    animation();
})();