import * as THREE from 'three';
import * as YUKA from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


//PATH FOLLOWING
class Car {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.assetsPath = game.assetsPath;

        // Load the GLTF model
        this.load();

        // Create YUKA vehicle
        this.vehicle = new YUKA.Vehicle();

        // Initialize path with waypoints
        this.path = new YUKA.Path();
        this.path.add(new YUKA.Vector3(-4, 0, 4));
        this.path.add(new YUKA.Vector3(-6, 0, 0));
        this.path.add(new YUKA.Vector3(-4, 0, -4));
        this.path.add(new YUKA.Vector3(0, 0, 0));
        this.path.add(new YUKA.Vector3(4, 0, -4));
        this.path.add(new YUKA.Vector3(6, 0, 0));
        this.path.add(new YUKA.Vector3(4, 0, 4));
        this.path.add(new YUKA.Vector3(0, 0, 6));

        this.path.loop = true; // Loop the path

        // Set up behaviors
        this.onPathBehavior = new YUKA.OnPathBehavior(this.path);
        this.vehicle.position.copy(this.path.current());
        this.onPathBehavior.radius = 1;
        this.vehicle.steering.add(this.onPathBehavior);

        
        this.followPathBehavior = new YUKA.FollowPathBehavior(this.path, 2); // Adjust speed as needed
        this.vehicle.steering.add(this.followPathBehavior);

        // Initialize EntityManager
        this.entityManager = new YUKA.EntityManager();
        this.entityManager.add(this.vehicle);

        // Path visualization setup (optional)
        const position = [];
        for (let i = 0; i < this.path._waypoints.length; i++) {
            const waypoint = this.path._waypoints[i];
            position.push(waypoint.x, waypoint.y, waypoint.z);
        }

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));

        const linesMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const lines = new THREE.LineLoop(lineGeometry, linesMaterial);
        this.scene.add(lines);
    }

    sync(entity, renderComponent) {
        renderComponent.position.copy(entity.position);
        renderComponent.quaternion.copy(entity.rotation);

        // Ensure car's rotation matches the vehicle's orientation
        renderComponent.updateMatrix();
        renderComponent.updateMatrixWorld(true);
    }

    load() {
        const loader = new GLTFLoader().setPath(this.assetsPath);
        loader.load(
            'taxi.glb?' + Date.now(), // Correct query parameter syntax
            (gltf) => {
                this.car = gltf.scene;
                const scale = .3; // Set an appropriate scale
                this.car.scale.set(scale, scale, scale);
                this.car.position.set(0, 0, 0); // Set to a visible position
                this.scene.add(this.car);
                this.car.matrixAutoUpdate = false;
                this.vehicle.setRenderComponent(this.car, this.sync.bind(this));
            },
            (xhr) => {
                // Handle loading progress if needed
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error occurred:', error);
            }
        );
    }
}

export { Car };
