import OnirixSDK from "https://unpkg.com/@onirix/ar-engine-sdk@1.8.3/dist/ox-sdk.esm.js";
import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js";

export default class OxExperience {
    _renderer = null;
    _scene = null;
    _camera = null;
    _models = [];
    _surfacePlaceholder = null; // Surface placeholder reference
    oxSDK;
    _modelPlaced = false;
    _carPlaced = false;
    _animationMixers = [];

    _modelIndex = 0;
    _currentModel = null;
    _controls = null;
    _clock = null;
    _gltfData = [];
    _scale = 0.1;

    async init() {
        try {
            this._raycaster = new THREE.Raycaster();
            this._clock = new THREE.Clock(true);
            this._carPlaced = false;
            const renderCanvas = await this.initSDK();
            this.setupRenderer(renderCanvas);
            this.setupControls(renderCanvas);

            let isRotating = false;
            let touchStartAngle = 0;
            let initialRotationY = 0;

            const textureLoader = new THREE.TextureLoader();
            this._envMap = textureLoader.load("assets/images/envmap.jpg");
            this._envMap.mapping = THREE.EquirectangularReflectionMapping;
            this._envMap.encoding = THREE.sRGBEncoding;


            // Create and add the surface placeholder
            this.createSurfacePlaceholder();

            this.oxSDK.subscribe(OnirixSDK.Events.OnFrame, () => {
                try {
                    const delta = this._clock.getDelta();
                    this._animationMixers.forEach((mixer) => mixer.update(delta));
                    this.render();
                } catch (err) {
                    console.error("Error during frame update", err);
                }
            });

            this.oxSDK.subscribe(OnirixSDK.Events.OnPose, (pose) => {
                try {
                    this.updatePose(pose);
                } catch (err) {
                    console.error("Error updating pose", err);
                }
            });

            this.oxSDK.subscribe(OnirixSDK.Events.OnResize, () => {
                this.onResize();
            });

            this.oxSDK.subscribe(OnirixSDK.Events.OnHitTestResult, (hitResult) => {
                if (!this._carPlaced) {
                    // Move the placeholder to the detected surface position
                    this._surfacePlaceholder.position.copy(hitResult.position);
                    this._surfacePlaceholder.visible = true; // Ensure the placeholder is visible
                } else {
                    this._surfacePlaceholder.visible = false; // Hide the placeholder once the car is placed
                }

                // if (this._modelPlaced && !this.isCarPlaced()) {
                //     this._models.forEach((model) => {
                //         model.position.copy(hitResult.position);
                //     });
                // }
            });

            const modelsToLoad = ["Steerad.glb", "Sterrad_PARTS.glb", "USAGE.glb", "USP_1.glb", "UPS_2.glb", "UPS_3.glb"];
            const gltfLoader = new GLTFLoader();
            modelsToLoad.forEach((modelUrl, index) => {
                modelUrl = "assets/models/" + modelUrl;
                gltfLoader.load(modelUrl, (gltf) => {
                    try {
                        const model = gltf.scene;
                        model.traverse((child) => {
                            if (child.material) {
                                child.material.envMap = this._envMap;
                                child.material.needsUpdate = true;
                            }
                        });

                        if (gltf.animations && gltf.animations.length) {
                            const mixer = new THREE.AnimationMixer(model);
                            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
                            this._animationMixers.push(mixer);

                            setTimeout(() => {
                                mixer.stopAllAction();
                            }, 9999);
                        }
                        this._gltfData[index] = gltf;
                        this._models[index] = model;
                        if (index === 0) {
                            model.scale.set(0.5, 0.5, 0.5);
                            model.visible = false;
                            this._currentModel = model;
                            this._modelPlaced = true;
                            this._scene.add(model);
                        }
                    } catch (err) {
                        console.error("Error loading model", err);
                    }
                }, undefined, (error) => {
                    console.error("Model loading error", error);
                });
            });

            this.addLights();
        } catch (err) {
            console.error("Error initializing OxExperience", err);
            throw err;
        }
    }

    async initSDK() {
        try {
            this.oxSDK = new OnirixSDK("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyMDIsInByb2plY3RJZCI6MTQ0MjgsInJvbGUiOjMsImlhdCI6MTYxNjc1ODY5NX0.8F5eAPcBGaHzSSLuQAEgpdja9aEZ6Ca_Ll9wg84Rp5k");
            const config = { mode: OnirixSDK.TrackingMode.Surface };
            return this.oxSDK.init(config);
        } catch (err) {
            console.error("Error initializing Onirix SDK", err);
            throw err;
        }
    }

    placeCar() {
        this._carPlaced = true;
        this._currentModel.visible = true; // Show the model when car is placed
        this._currentModel.position.copy(this._surfacePlaceholder.position); // Move model to placeholder's position
        this.oxSDK.start();
    }

    createSurfacePlaceholder() {
        const geometry = new THREE.RingGeometry(0.1, 0.2, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
        ring.userData.isPlaceholder = true; // Add a flag for detecting click
        this._scene.add(ring);
        this._surfacePlaceholder = ring;
    }

    isCarPlaced() {
        return this._carPlaced;
    }

    onHitTest(listener) {
        this.oxSDK.subscribe(OnirixSDK.Events.OnHitTestResult, listener);
    }

    setupRenderer(renderCanvas) {
        try {
            const width = renderCanvas.width;
            const height = renderCanvas.height;

            this._renderer = new THREE.WebGLRenderer({ canvas: renderCanvas, alpha: true });
            this._renderer.setClearColor(0x000000, 0);
            this._renderer.setSize(width, height);
            this._renderer.outputEncoding = THREE.sRGBEncoding;

            const cameraParams = this.oxSDK.getCameraParameters();
            this._camera = new THREE.PerspectiveCamera(cameraParams.fov, cameraParams.aspect, 0.1, 1000);
            this._camera.matrixAutoUpdate = false;

            this._scene = new THREE.Scene();

            const ambientLight = new THREE.AmbientLight(0x666666, 0.5);
            this._scene.add(ambientLight);
            
        } catch (err) {
            console.error("Error setting up renderer", err);
        }
    }

    addLights() {
        try {
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 10, 7.5);
            directionalLight.castShadow = true;
            this._scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0xffffff, 1, 100);
            pointLight.position.set(5, 10, 5);
            this._scene.add(pointLight);
        } catch (err) {
            console.error("Error adding lights", err);
        }
    }

    setupControls(renderCanvas) {
        try {
            this._controls = new OrbitControls(this._camera, renderCanvas);
            this._controls.enableDamping = true;
            this._controls.dampingFactor = 0.25;
            this._controls.enableZoom = true;
            this._controls.enableRotate = true;
            this._controls.enablePan = false;

            renderCanvas.addEventListener('touchstart', (event) => {
                if (event.touches.length === 2) {
                    this._controls.enablePan = false;
                }
            });

            renderCanvas.addEventListener('touchend', () => {
                this._controls.enablePan = false;
            });
        } catch (err) {
            console.error("Error setting up controls", err);
        }
    }

    render() {
        try {
            this._controls.update();
            this._renderer.render(this._scene, this._camera);
        } catch (err) {
            console.error("Error during rendering", err);
        }
    }

    updatePose(pose) {
        try {
            let modelViewMatrix = new THREE.Matrix4();
            modelViewMatrix = modelViewMatrix.fromArray(pose);
            this._camera.matrix = modelViewMatrix;
            this._camera.matrixWorldNeedsUpdate = true;
        } catch (err) {
            console.error("Error updating pose", err);
        }
    }

    onResize() {
        try {
            const width = this._renderer.domElement.width;
            const height = this._renderer.domElement.height;
            const cameraParams = this.oxSDK.getCameraParameters();
            this._camera.fov = cameraParams.fov;
            this._camera.aspect = cameraParams.aspect;
            this._camera.updateProjectionMatrix();
            this._renderer.setSize(width, height);
        } catch (err) {
            console.error("Error handling resize", err);
        }
    }

    changeModelsColor(value) {
        if (this._currentModel) {
            this._currentModel.traverse((child) => {
                if (child.material) {
                    child.material.color.setHex(value);
                }
            });
        }
    }

    // switchModel(index) {
    //     if (this._currentModel) {
    //         this._scene.remove(this._currentModel);
    //     }
    //     this._currentModel = this._models[index];
    //     if (this._currentModel) {
    //         this._scene.add(this._currentModel);
    //     }
    // }

    switchModel(index) {
        // Stop and remove the current model from the scene
        if (this._currentModel) {
            this._scene.remove(this._currentModel);

            // Stop all animations of the current model
            const currentMixer = this._animationMixers[index];
            if (currentMixer) {
                currentMixer.stopAllAction();
            }
        }

        // Set the new model as the current model
        this._currentModel = this._models[index];
        if (this._currentModel) {
            this._scene.add(this._currentModel);

            // Initialize animation if the model has animations
            const mixer = new THREE.AnimationMixer(this._currentModel);
            const gltf = this._gltfData[index]; // Assuming you store the GLTF data

            if (gltf && gltf.animations && gltf.animations.length) {
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
                this._animationMixers[index] = mixer; // Store the mixer for the new model
                setTimeout(() => {
                    mixer.stopAllAction();
                }, 9999);
            }
        }
    }
    // playAudio(audioFile) {
    //     const audio = new Audio(audioFile);
    //     audio.play();
    // }
}