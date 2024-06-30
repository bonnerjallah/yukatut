import * as THREE from "three";
import * as YUKA from "yuka";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Guard {
    constructor(game) {
        this.game = game;
        this.assetsPath = game.assetsPath;
        this.scene = game.scene;

        this.vehicleGeometry = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, .2, 3),
            new THREE.MeshStandardMaterial({color: 0x000000})
        );
        this.scene.add(this.vehicleGeometry);

        this.vehicle = new YUKA.Vehicle();

        this.vehicle.setRenderComponent(this.vehicleGeometry, this.sync.bind(this))

        // Initialize EntityManager
        this.entityManager = new YUKA.EntityManager();
        this.entityManager.add(this.vehicle);


        

        // Target
        this.targetGeo = new THREE.Mesh(
            new THREE.SphereGeometry(.2),
            new THREE.MeshStandardMaterial({ color: 0xFFEA00 })
        );
        this.targetGeo.matrixAutoUpdate = false;
        this.scene.add(this.targetGeo); // Add targetGeo to the scene

        this.target = new YUKA.GameEntity();
        this.target.setRenderComponent(this.targetGeo, this.sync.bind(this)); // Fixed typo here

        this.entityManager.add(this.target);
        
        this.seekBehavior = new YUKA.SeekBehavior(this.target.position);
        this.vehicle.steering.add(this.seekBehavior);

        setInterval(() => {
            const x = Math.random() * 3;
            const y = Math.random() * 3;
            const z = Math.random() * 3;

            this.target.position.set(x, y, z)
        }, 5000);




        this.vehicle.position.set(-2, 0, -2)
    }

    sync(entity, renderComponent) {
        renderComponent.position.copy(entity.position);
        renderComponent.quaternion.copy(entity.rotation);

        renderComponent.updateMatrix();
        renderComponent.updateMatrixWorld(true);
    }
}

export { Guard };
