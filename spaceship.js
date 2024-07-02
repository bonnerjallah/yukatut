import * as THREE from "three";
import * as YUKA from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Ship {
    constructor(game) {
        this.game = game;
        this.assetsPath = game.assetsPath;
        this.scene = game.scene;

        this.vehicle = new YUKA.Vehicle();
        this.entityManager = new YUKA.EntityManager();
        this.entityManager.add(this.vehicle);

        this.vehicle.position.set(-2, 0, -4);
        this.vehicle.maxSpeed = 6;

        this.fleeVehicle = new YUKA.Vehicle();
        this.entityManager.add(this.fleeVehicle); // Adding fleeVehicle to the same entityManager

        this.mousePosition = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        window.addEventListener("mousemove", this.toPosition.bind(this));
        window.addEventListener('click', this.onClick.bind(this));

        this.planeGeo = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshStandardMaterial()
        );
        this.planeGeo.name = "plane";
        this.planeGeo.rotation.x = -0.5 * Math.PI;
        this.scene.add(this.planeGeo);

        this.target = new YUKA.GameEntity();
        this.entityManager.add(this.target);

        this.arriveBehavior = new YUKA.ArriveBehavior(this.target.position, 3, 0);
        this.vehicle.steering.add(this.arriveBehavior);

        // Flee behavior instance
        this.fleeBehavior = new YUKA.FleeBehavior(this.target.position, 2);
        this.fleeVehicle.steering.add(this.fleeBehavior);

        this.load();
    }

    toPosition(event) {
        this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onClick() {
        this.raycaster.setFromCamera(this.mousePosition, this.game.camera);
        const intersects = this.raycaster.intersectObjects([this.planeGeo]);

        if (intersects.length > 0) {
            this.target.position.set(intersects[0].point.x, 0, intersects[0].point.z);
        }
    }

    sync(entity, renderComponent) {
        renderComponent.position.copy(entity.position);
        renderComponent.quaternion.copy(entity.rotation);

        renderComponent.updateMatrix();
        renderComponent.updateMatrixWorld(true);
    }

    load() {
        const loader = new GLTFLoader().setPath(this.assetsPath);
        loader.load(
            "stricker.glb",
            (gltf) => {
                this.craft = gltf.scene;
                this.scene.add(this.craft);
                const scale = 0.2;
                this.craft.scale.set(scale, scale, scale);
                this.craft.matrixAutoUpdate = false; //if you want yuka to controle the animation rendering
                this.vehicle.setRenderComponent(this.craft, this.sync.bind(this));
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error occurred while loading GLTF:', error);
            }
        );

        const secondLoader = new GLTFLoader().setPath(this.assetsPath);
        secondLoader.load(
            'Zenith.gltf',
            (gltf) => {
                this.alienShip = gltf.scene;
                const scale = 0.2;
                this.alienShip.scale.set(scale, scale, scale);
                this.scene.add(this.alienShip);
                this.alienShip.position.set(-2, 0, 0);
                this.fleeVehicle.setRenderComponent(this.alienShip, this.sync.bind(this));
            },
            (xhr) => {
                // Optional: Handle loading progress
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error occurred while loading GLTF:', error);
            }
        );
    }
}

export { Ship };
