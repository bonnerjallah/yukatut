import * as THREE from 'three';
import * as YUKA from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Carchase {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.assetsPath = game.assetsPath;

        this.vehicle = new YUKA.Vehicle();

        // Define a straight path
        this.path = new YUKA.Path();
        this.path.add(new YUKA.Vector3(-16, 0, 0));
        this.path.add(new YUKA.Vector3(16, 0, 0)); // Straight path along the x-axis
        this.path.loop = true;

        // Vehicle starting position on the path
        this.vehicle.position.copy(this.path.current());

        // Add behaviors to the vehicle
        this.onPathBehavior = new YUKA.OnPathBehavior(this.path);
        this.vehicle.steering.add(this.onPathBehavior);

        this.followPathBehavior = new YUKA.FollowPathBehavior(this.path, 2); // Adjust speed as needed
        this.vehicle.steering.add(this.followPathBehavior);

        this.vehicle.maxSpeed = 3;

        this.entityManager = new YUKA.EntityManager();
        this.entityManager.add(this.vehicle);

        // Path visualization (optional)
        const position = [];
        for (const waypoint of this.path._waypoints) {
            position.push(waypoint.x, waypoint.y, waypoint.z);
        }

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));

        const linesMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const lines = new THREE.Line(lineGeometry, linesMaterial);
        this.scene.add(lines);

        // Initialize obstacles and load the vehicle model
        this.initializeObstacles();
        this.load();
    }

    sync(entity, renderComponent) {
        renderComponent.position.copy(entity.position);
        renderComponent.quaternion.copy(entity.rotation);

        renderComponent.updateMatrix();
        renderComponent.updateMatrixWorld();
    }

    load() {
        const loader = new GLTFLoader().setPath(this.assetsPath);
        loader.load(
            'sport.glb',
            (gltf) => {
                this.sportCar = gltf.scene;
                const scale = 0.4;
                this.sportCar.scale.set(scale, scale, scale);
                this.scene.add(this.sportCar);
                this.sportCar.position.set(2, 0, 0);

                // Compute bounding sphere after the model is loaded
                this.sportCar.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.computeBoundingSphere();
                        this.vehicle.boundingRadius = child.geometry.boundingSphere.radius;
                    }
                });

                // Set render component for YUKA vehicle
                this.vehicle.setRenderComponent(this.sportCar, this.sync.bind(this));
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the model', error);
            }
        );
    }

    initializeObstacles() {
        const obstaclePositions = [
            { x: 3, y: 0, z: 0 },
            { x: 14, y: 0, z: 0 },
            { x: -12, y: 0, z: 0 },
        ];

        for (const pos of obstaclePositions) {
            const obstacle = new THREE.Mesh(
                new THREE.BoxGeometry(),
                new THREE.MeshStandardMaterial({ color: 0x0f0f0f })
            );
            this.scene.add(obstacle);
            obstacle.scale.set(1, 1, 1);
            obstacle.position.set(pos.x, pos.y, pos.z);
            obstacle.geometry.computeBoundingSphere(); // Compute bounding sphere for obstacle

            // Add obstacle to YUKA as GameEntity
            const yukaObstacle = new YUKA.GameEntity();
            yukaObstacle.position.copy(obstacle.position);
            this.entityManager.add(yukaObstacle);

            // Add obstacle to the obstacle avoidance behavior
            const obstacleBehavior = new YUKA.ObstacleAvoidanceBehavior([yukaObstacle]);
            this.vehicle.steering.add(obstacleBehavior);
        }
    }

    update(delta) {
        this.entityManager.update(delta); // Update the YUKA entity manager
    }
}

export { Carchase };
