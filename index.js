// Clearing the console
console.clear();

// Scene: Handles Three.js rendering
class Scene {
  constructor(model) {
    this.views = [
      { bottom: 0, height: 1 },
      { bottom: 0, height: 0 },
    ];

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(this.renderer.domElement);

    // Scene setup
    this.scene = new THREE.Scene();

    // Camera setup
    for (let i = 0; i < this.views.length; i++) {
      const view = this.views[i];
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        2000
      );
      camera.position.fromArray([0, 0, 180]);
      camera.layers.disableAll();
      camera.layers.enable(i);
      view.camera = camera;
      camera.lookAt(new THREE.Vector3(0, 5, 0));
    }

    // Lighting
    this.light = new THREE.PointLight(0xffffff, 0.75);
    this.light.position.set(70, -20, 150);
    this.scene.add(this.light);

    this.softLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(this.softLight);

    // Group setup
    this.onResize();
    window.addEventListener('resize', this.onResize, false);

    const edges = new THREE.EdgesGeometry(model.children[0].geometry);
    const line = new THREE.LineSegments(edges);
    line.material.depthTest = false;
    line.material.opacity = 0.5;
    line.material.transparent = true;
    line.position.set(0.5, 0.2, -1);

    this.modelGroup = new THREE.Group();

    model.layers.set(0);
    line.layers.set(1);

    this.modelGroup.add(model);
    this.modelGroup.add(line);
    this.scene.add(this.modelGroup);
  }

  render = () => {
    for (let i = 0; i < this.views.length; i++) {
      const view = this.views[i];
      const camera = view.camera;

      const bottom = Math.floor(this.h * view.bottom);
      const height = Math.floor(this.h * view.height);

      this.renderer.setViewport(0, 0, this.w, this.h);
      this.renderer.setScissor(0, bottom, this.w, height);
      this.renderer.setScissorTest(true);

      camera.aspect = this.w / this.h;
      this.renderer.render(this.scene, camera);
    }
  };

  onResize = () => {
    this.w = window.innerWidth;
    this.h = window.innerHeight;

    for (let i = 0; i < this.views.length; i++) {
      const view = this.views[i];
      const camera = view.camera;
      camera.aspect = this.w / this.h;
      const camZ = (screen.width - this.w * 1) / 3;
      camera.position.z = camZ < 180 ? 180 : camZ;
      camera.updateProjectionMatrix();
    }

    this.renderer.setSize(this.w, this.h);
    this.render();
  };
}

// Load model and setup animations
function loadModel() {
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
    gsap.set('#line-length', { drawSVG: 0 });
    gsap.set('#line-wingspan', { drawSVG: 0 });
    gsap.set('#circle-phalange', { drawSVG: 0 });
  
    let object;
  
    function onModelLoaded() {
      object.traverse((child) => {
        if (child.isMesh) {
          const mat = new THREE.MeshPhongMaterial({
            color: 0x171511,
            specular: 0xd0cbc7,
            shininess: 5,
            flatShading: true,
          });
          child.material = mat;
        }
      });
  
      // Scale and position the model
      object.scale.set(10, 10, 10);
      object.position.set(0, 0, 0);
  
      setupAnimation(object);
    }
  
    const manager = new THREE.LoadingManager(onModelLoaded);
    manager.onProgress = (item, loaded, total) =>
      console.log(item, loaded, total);
  
    const loader = new THREE.OBJLoader(manager);
    loader.load(
      '/Users/aditpansi/Downloads/Drone/Drone.obj',
      (obj) => {
        object = obj;
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }
  
  function setupAnimation(model) {
    const scene = new Scene(model);
  
    // Add a debug cube
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.scene.add(cube);
  
    const plane = scene.modelGroup;
  
    gsap.fromTo(
      'canvas',
      { x: '50%', autoAlpha: 0 },
      { duration: 1, x: '0%', autoAlpha: 1 }
    );
    gsap.to('.loading', { autoAlpha: 0 });
    gsap.to('.scroll-cta', { opacity: 1 });
    gsap.set('svg', { autoAlpha: 1 });
  
    const tau = Math.PI * 2;
  
    gsap.set(plane.rotation, { y: tau * -0.25 });
    gsap.set(plane.position, { x: 80, y: -32, z: -60 });
  
    scene.render();

  // Scroll-triggered animations
  gsap.fromTo(
    scene.views[1],
    { height: 1, bottom: 0 },
    {
      height: 0,
      bottom: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.blueprint',
        scrub: true,
        start: 'bottom bottom',
        end: 'bottom top',
      },
    }
  );

  gsap.fromTo(
    scene.views[1],
    { height: 0, bottom: 0 },
    {
      height: 1,
      bottom: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.blueprint',
        scrub: true,
        start: 'top bottom',
        end: 'top top',
      },
    }
  );

  gsap.to('.ground', {
    y: '30%',
    scrollTrigger: {
      trigger: '.ground-container',
      scrub: true,
      start: 'top bottom',
      end: 'bottom top',
    },
  });

  gsap.from('.clouds', {
    y: '25%',
    scrollTrigger: {
      trigger: '.ground-container',
      scrub: true,
      start: 'top bottom',
      end: 'bottom top',
    },
  });

  gsap.to('#line-length', {
    drawSVG: 100,
    scrollTrigger: {
      trigger: '.length',
      scrub: true,
      start: 'top bottom',
      end: 'top top',
    },
  });

  gsap.to('#line-wingspan', {
    drawSVG: 100,
    scrollTrigger: {
      trigger: '.wingspan',
      scrub: true,
      start: 'top 25%',
      end: 'bottom 50%',
    },
  });

  gsap.to('#circle-phalange', {
    drawSVG: 100,
    scrollTrigger: {
      trigger: '.phalange',
      scrub: true,
      start: 'top 50%',
      end: 'bottom 100%',
    },
  });

  gsap.to('#line-length', {
    opacity: 0,
    drawSVG: 0,
    scrollTrigger: {
      trigger: '.length',
      scrub: true,
      start: 'top top',
      end: 'bottom top',
    },
  });

  gsap.to('#line-wingspan', {
    opacity: 0,
    drawSVG: 0,
    scrollTrigger: {
      trigger: '.wingspan',
      scrub: true,
      start: 'top top',
      end: 'bottom top',
    },
  });

  gsap.to('#circle-phalange', {
    opacity: 0,
    drawSVG: 0,
    scrollTrigger: {
      trigger: '.phalange',
      scrub: true,
      start: 'top top',
      end: 'bottom top',
    },
  });

  // GSAP timeline for plane animations
  const tl = gsap.timeline({
    onUpdate: scene.render,
    scrollTrigger: {
      trigger: '.content',
      scrub: true,
      start: 'top top',
      end: 'bottom bottom',
    },
    defaults: { duration: 1, ease: 'power2.inOut' },
  });

  let delay = 0;

  tl.to('.scroll-cta', { duration: 0.25, opacity: 0 }, delay);
  tl.to(plane.position, { x: -10, ease: 'power1.in' }, delay);

  delay += 1;

  tl.to(plane.rotation, { x: tau * 0.25, y: 0, z: -tau * 0.05, ease: 'power1.inOut' }, delay);
  tl.to(plane.position, { x: -40, y: 0, z: -60, ease: 'power1.inOut' }, delay);

  delay += 1;

  tl.to(plane.rotation, { x: tau * 0.25, y: 0, z: tau * 0.05, ease: 'power3.inOut' }, delay);
  tl.to(plane.position, { x: 40, y: 0, z: -60, ease: 'power2.inOut' }, delay);

  delay += 1.5;

  tl.to(plane.position, { x: -60, y: -6, z: -80, ease: 'power2.inOut' }, delay);
  tl.to(plane.rotation, { x: tau * 0.3, y: tau * 0.25, z: 0, ease: 'power3.inOut' }, delay);

  delay += 1;

  tl.to(plane.rotation, { x: tau * 0.25, y: tau * 0.5, z: tau * 0.25 }, delay);
  tl.to(plane.position, { x: 0, y: -12, z: -100 }, delay);

  delay += 1;

  tl.to(plane.rotation, { x: 0, y: tau * 0.5, z: 0, ease: 'power2.inOut' }, delay);
  tl.to(plane.position, { x: 0, y: 0, z: -120, ease: 'power2.inOut' }, delay);
}

// Initial model load
loadModel();





// Initialize Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
});
