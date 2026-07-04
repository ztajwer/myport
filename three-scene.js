/* three-scene.js - Three.js 3D Models Loading and Animation */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// 1. Loading Manager Setup
const loadingManager = new THREE.LoadingManager();
const loaderBar = document.getElementById('loader-bar');
const loaderPercentage = document.getElementById('loader-percentage');
const loadingScreen = document.getElementById('loading-screen');

// Track loaded progress
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const progressRatio = itemsLoaded / itemsTotal;
  const progressPercent = Math.round(progressRatio * 100);
  
  if (loaderBar) loaderBar.style.width = `${progressPercent}%`;
  if (loaderPercentage) loaderPercentage.style.textContent = `${progressPercent}%`;
};

// Finish loading
loadingManager.onLoad = () => {
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      // Trigger a resize event to make sure 3D scenes align properly after loader fades
      window.dispatchEvent(new Event('resize'));
    }
  }, 500);
};

// Fail-safe: Hide loading screen after 5 seconds even if loaders fail or get stuck
setTimeout(() => {
  if (loadingScreen && !loadingScreen.classList.contains('fade-out')) {
    console.warn("Preloader timed out. Bypassing loading screen.");
    loadingScreen.classList.add('fade-out');
    window.dispatchEvent(new Event('resize'));
  }
}, 5000);

// Instantiating the GLTF Loader
const gltfLoader = new GLTFLoader(loadingManager);

// Configure DRACOLoader for Draco compressed models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
gltfLoader.setDRACOLoader(dracoLoader);

// Global Mouse tracker for 3D interactions
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
  // Normalize between -1 and 1
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});


/* =========================================================================
   HERO SCENE SETUP (me.glb)
   ========================================================================= */

const initHeroScene = () => {
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;

  // Clear loading spinner text
  container.innerHTML = '';

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xaaccff, 1.2);
  dirLight2.position.set(-5, 3, -5);
  scene.add(dirLight2);

  // Parent Group Wrapper
  const heroGroup = new THREE.Group();
  scene.add(heroGroup);

  let heroModel = null;
  let targetRotationX = 0;
  let targetRotationY = 0;

  // Load Model
  gltfLoader.load(
    '/me_opt.glb',
    (gltf) => {
      heroModel = gltf.scene;

      // Center and scale model
      const box = new THREE.Box3().setFromObject(heroModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      let scale = 2.4 / maxDim;
      if (!isFinite(scale) || isNaN(scale) || scale === 0) scale = 0.05;
      heroModel.scale.set(scale, scale, scale);

      // Center locally
      heroModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

      heroGroup.add(heroModel);
      console.log("Hero me_opt.glb model loaded successfully!");
    },
    undefined,
    (error) => {
      console.error('Error loading me_opt.glb:', error);
      container.innerHTML = '<div class="canvas-loading"><i class="fa-solid fa-triangle-exclamation"></i> Error loading 3D Model</div>';
    }
  );

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    if (heroGroup && heroModel) {
      // Subtle cursor tracking rotation
      targetRotationY = mouse.x * Math.PI * 0.12;
      targetRotationX = mouse.y * Math.PI * 0.06;

      heroGroup.rotation.y += (targetRotationY - heroGroup.rotation.y) * 0.05;
      heroGroup.rotation.x += (targetRotationX - heroGroup.rotation.x) * 0.05;
    }

    renderer.render(scene, camera);
  };
  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
};


/* =========================================================================
   TECH SCENE SETUP (lap.glb)
   ========================================================================= */

const initTechScene = () => {
  const container = document.getElementById('tech-canvas-container');
  if (!container) return;

  // Clear loading spinner text
  container.innerHTML = '';

  // Scene
  const scene = new THREE.Scene();

  // Camera
  console.log("Tech container dimensions:", container.clientWidth, "x", container.clientHeight);
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 4.5);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lights - cool/neutral tones for Space Grey laptop
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Clean white directional light
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight1.position.set(4, 4, 4);
  scene.add(dirLight1);

  // Soft steel blue fill light
  const dirLight2 = new THREE.DirectionalLight(0xaaccff, 1.5);
  dirLight2.position.set(-4, -2, -4);
  scene.add(dirLight2);

  // Cool white spotlight
  const spotLight = new THREE.SpotLight(0xffffff, 8, 12, Math.PI * 0.3, 0.5, 1);
  spotLight.position.set(0, 4, 1);
  scene.add(spotLight);

  // Wrapper group to center and position model independently
  const laptopGroup = new THREE.Group();
  scene.add(laptopGroup);
  // Variables for model control
  let laptopModel = null;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isHovered = false;
  let baseX = 0;
  let baseY = 0;

  // Listeners for container hover to influence movement
  container.addEventListener('mouseenter', () => {
    isHovered = true;
  });
  container.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  // Load Model
  gltfLoader.load(
    '/lap_opt.glb',
    (gltf) => {
      laptopModel = gltf.scene;
      console.log("Tech Laptop model loaded successfully!");

      // Traverse meshes to fix lighting/metalness issues and apply a space-grey color
      laptopModel.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            node.material.side = THREE.DoubleSide;
            
            // Adjust materials to look metallic, sleek and Space Grey
            if (node.material.color) {
              node.material.color.setHex(0x5a5d64); // Premium Apple Space Grey
            }
            node.material.metalness = 0.9;
            node.material.roughness = 0.22;
          }
        }
      });

      // Center and scale model locally relative to parent wrapper
      const box = new THREE.Box3().setFromObject(laptopModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      console.log("Tech Laptop original size:", size.x, "x", size.y, "x", size.z, "Center:", center.x, ",", center.y, ",", center.z);

      // Make laptop larger and look even better!
      const maxDim = Math.max(size.x, size.y, size.z);
      let scale = 2.6 / maxDim; // Scaled up to 2.6 for premium sizing
      if (!isFinite(scale) || isNaN(scale) || scale === 0) {
        console.warn("Invalid laptop scale calculated, using fallback of 0.05");
        scale = 0.05;
      }
      console.log("Laptop applied scale factor:", scale);
      laptopModel.scale.set(scale, scale, scale);

      // Center locally (multiply by scale!)
      laptopModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

      laptopGroup.add(laptopModel);

      // Initial placement
      baseX = 0;
      baseY = -0.1;
      laptopGroup.position.set(baseX, baseY, 0);

      // Tilt laptop down slightly initially
      laptopGroup.rotation.x = Math.PI / 12;
    },
    undefined,
    (error) => {
      console.error('Error loading lap_opt.glb:', error);
      container.innerHTML = `<div class="canvas-loading"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${error.message || 'File path mismatch or WebGL issue'}</div>`;
    }
  );

  // Animation Loop
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (laptopGroup && laptopModel) {
      // Smooth float offset relative to baseY centering
      laptopGroup.position.y = baseY + Math.sin(elapsedTime * 1.2) * 0.05;

      if (isHovered) {
        // Highly responsive rotation based on mouse movements when hovered
        targetRotationY = mouse.x * Math.PI * 1.35;
        targetRotationX = mouse.y * Math.PI * 0.65 + (Math.PI / 12);
      } else {
        // Subtle mouse tracking even when not hovered + auto rotation
        targetRotationY = elapsedTime * 0.1 + mouse.x * Math.PI * 0.5;
        targetRotationX = (Math.PI / 12) + mouse.y * Math.PI * 0.2;
      }
      
      laptopGroup.rotation.y += (targetRotationY - laptopGroup.rotation.y) * 0.08;
      laptopGroup.rotation.x += (targetRotationX - laptopGroup.rotation.x) * 0.08;
    }

    renderer.render(scene, camera);
  };
  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width > 0 && height > 0) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  });
};


/* =========================================================================
   BACKGROUND SCENE SETUP (pla.glb)
   ========================================================================= */

const initBgScene = () => {
  const container = document.getElementById('bg-canvas-container');
  if (!container) return;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xff5500, 2);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x00aaff, 1.5);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  // Parent Group Wrapper
  const bgGroup = new THREE.Group();
  scene.add(bgGroup);

  let bgModel = null;
  let targetRotationX = 0;
  let targetRotationY = 0;

  // Load Model
  gltfLoader.load(
    '/pla_opt.glb',
    (gltf) => {
      bgModel = gltf.scene;
      console.log("Background Planet model loaded successfully!");

      bgModel.traverse((node) => {
        // Recursively check if the node or any parent is a track/path guide line
        let isGuide = false;
        let current = node;
        while (current) {
          const name = (current.name || '').toLowerCase();
          if (name.includes('path') || name.includes('track') || name.includes('helper') || name.includes('guide') || name.includes('line')) {
            isGuide = true;
            break;
          }
          current = current.parent;
        }

        if (isGuide) {
          node.visible = false;
          return;
        }

        if (node.isMesh) {
          if (node.material) {
            node.material.side = THREE.DoubleSide;
            // Make background model semi-transparent & soft for watermark look
            node.material.transparent = true;
            node.material.opacity = 0.25;
            if (node.material.metalness !== undefined) {
              node.material.metalness = 0.1;
              node.material.roughness = 0.8;
            }
          }
        }
      });

      const box = new THREE.Box3().setFromObject(bgModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Scale model to be large backdrop element
      const maxDim = Math.max(size.x, size.y, size.z);
      let scale = 5.2 / maxDim;
      if (!isFinite(scale) || isNaN(scale) || scale === 0) scale = 1.0;
      bgModel.scale.set(scale, scale, scale);
      bgModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

      bgGroup.add(bgModel);
    },
    undefined,
    (error) => {
      console.error('Error loading pla_opt.glb:', error);
    }
  );

  // Animation Loop
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (bgGroup && bgModel) {
      // Auto-rotation
      bgGroup.rotation.y = elapsedTime * 0.02;

      // Increased mouse tracking offset for dynamic parallax watermark effect
      targetRotationY = mouse.x * Math.PI * 0.35;
      targetRotationX = mouse.y * Math.PI * 0.18;

      bgGroup.rotation.y += (targetRotationY - bgGroup.rotation.y) * 0.05;
      bgGroup.rotation.x += (targetRotationX - bgGroup.rotation.x) * 0.05;
    }

    renderer.render(scene, camera);
  };
  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
};


/* =========================================================================
   KEY SCENE SETUP (key.glb)
   ========================================================================= */

const initKeyScene = () => {
  const container = document.getElementById('key-canvas-container');
  if (!container) return;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  // Renderer with shadow map enabled for realistic keyboard shadows
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  // Spotlights casting shadows
  const spotLight1 = new THREE.SpotLight(0xffffff, 9, 10, Math.PI * 0.3, 0.5, 1);
  spotLight1.position.set(2, 4, 3);
  spotLight1.castShadow = true;
  spotLight1.shadow.mapSize.width = 1024;
  spotLight1.shadow.mapSize.height = 1024;
  scene.add(spotLight1);

  const spotLight2 = new THREE.SpotLight(0x88ccff, 4, 10, Math.PI * 0.3, 0.5, 1);
  spotLight2.position.set(-2, 3, -3);
  spotLight2.castShadow = true;
  scene.add(spotLight2);

  // Parent Group Wrapper
  const keyGroup = new THREE.Group();
  scene.add(keyGroup);

  let keyModel = null;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isHovered = false;

  container.addEventListener('mouseenter', () => {
    isHovered = true;
  });
  container.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  // Load Model
  gltfLoader.load(
    '/key_opt.glb',
    (gltf) => {
      // Clear loading indicator
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      keyModel = gltf.scene;
      console.log("Mechanical Keyboard model loaded successfully!");

      keyModel.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            node.material.side = THREE.DoubleSide;
            
            // Differentiate keys (matte, smooth) from keyboard body (metallic shine)
            const name = node.name.toLowerCase();
            if (name.includes('key') || name.includes('cap') || name.includes('button') || name.includes('switch') || name.includes('letter') || name.includes('board')) {
              node.material.metalness = 0.05; // Matte smooth keycaps
              node.material.roughness = 0.55;
            } else {
              node.material.metalness = 0.85; // Metallic casing
              node.material.roughness = 0.22;
            }
          }
        }
      });

      const box = new THREE.Box3().setFromObject(keyModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      let scale = 2.1 / maxDim;
      if (!isFinite(scale) || isNaN(scale) || scale === 0) scale = 0.05;
      keyModel.scale.set(scale, scale, scale);
      keyModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

      // Tilt slightly
      keyModel.rotation.x = Math.PI / 6;

      keyGroup.add(keyModel);
    },
    undefined,
    (error) => {
      console.error('Error loading key_opt.glb:', error);
      container.innerHTML = `<div class="canvas-loading"><i class="fa-solid fa-triangle-exclamation"></i> Error loading 3D keyboard</div>`;
    }
  );

  // Animation Loop
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (keyGroup && keyModel) {
      // Float up and down smoothly
      keyGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      if (isHovered) {
        // High cursor sensitivity rotation
        targetRotationY = mouse.x * Math.PI * 1.35;
        targetRotationX = mouse.y * Math.PI * 0.65 + (Math.PI / 6);
      } else {
        // Continuous slow rotation with soft mouse follow
        targetRotationY = elapsedTime * 0.25 + mouse.x * Math.PI * 0.4;
        targetRotationX = (Math.PI / 6) + mouse.y * Math.PI * 0.15;
      }

      keyGroup.rotation.y += (targetRotationY - keyGroup.rotation.y) * 0.07;
      keyGroup.rotation.x += (targetRotationX - keyGroup.rotation.x) * 0.07;
    }

    renderer.render(scene, camera);
  };
  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width > 0 && height > 0) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  });
};


// Lazy loading state trackers
window.techSceneLoaded = false;
window.keySceneLoaded = false;

window.loadTechScene = () => {
  if (!window.techSceneLoaded) {
    window.techSceneLoaded = true;
    initTechScene();
  }
};

window.loadKeyScene = () => {
  if (!window.keySceneLoaded) {
    window.keySceneLoaded = true;
    initKeyScene();
  }
};

// Initialize only home and background planet at DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initBgScene();
    initHeroScene();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  });
} else {
  initBgScene();
  initHeroScene();
  setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
}
