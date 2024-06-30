import './style.css';
import * as THREE from 'three';
import { Car } from './car.js';
import * as YUKA from 'yuka';
import { Guard } from './solder.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Correct import path for GLTFLoader


class Game {
  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    this.clock = new THREE.Clock();
    this.time = new YUKA.Time();

    this.assetsPath = "./assets/";

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);

    const dirlight = new THREE.DirectionalLight(0xffffff, 1);
    dirlight.position.set(5, 5, 5);
    this.scene.add(dirlight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    // Create an instance of Car
    this.car = new Car(this);

    //Create an instance of Guard
    this.guard = new Guard(this)

    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.animate();
  }

  

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate = () => {
    const delta = this.clock.getDelta();

    // Update car and other entities
    this.car.entityManager.update(delta);
    this.guard.entityManager.update(delta)

    // Render scene
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate);
  }
}

export { Game };
