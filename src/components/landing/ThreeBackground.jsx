import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene, Camera & WebGLRenderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0c16, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 45);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lights Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 1.5, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 1.5, 100);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);

    // 3. Procedural Particle Generation (3500 particles)
    const particleCount = window.innerWidth < 768 ? 1500 : 3500;
    const geometry = new THREE.BufferGeometry();
    
    // Arrays for Phase Coordinates
    const posPhase0 = new Float32Array(particleCount * 3); // AI Core (Sphere)
    const posPhase1 = new Float32Array(particleCount * 3); // AI Assistant (Face)
    const posPhase2 = new Float32Array(particleCount * 3); // Resume Scanner (Waving Sheet)
    const posPhase3 = new Float32Array(particleCount * 3); // Voice Waveform (Grid)
    const posPhase4 = new Float32Array(particleCount * 3); // Stats Dashboard (Rising Bars)
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const basePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Color mapping (blend violet to cyan)
      const mixRatio = Math.random();
      const r = mixRatio * 0.54 + 0.1; // Violet to Cyan colors
      const g = mixRatio * 0.36 + 0.5;
      const b = 0.95;
      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;

      // Particle size
      sizes[i] = Math.random() * 2.0 + 1.0;

      // --- PHASE 0: AI Core (Double-Axis Noise Sphere) ---
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rSphere = 14 + (Math.sin(theta * 8) * Math.cos(phi * 8) * 1.5);
      
      posPhase0[i3] = rSphere * Math.sin(phi) * Math.cos(theta);
      posPhase0[i3 + 1] = rSphere * Math.sin(phi) * Math.sin(theta);
      posPhase0[i3 + 2] = rSphere * Math.cos(phi);

      // --- PHASE 1: AI Assistant Face (Procedural Low-poly Head) ---
      // Distribute particles in a mask/ellipsoid, carve features
      const fTheta = Math.random() * Math.PI * 2;
      const fPhi = Math.random() * Math.PI - Math.PI / 2;
      
      let faceX = 14 * Math.cos(fPhi) * Math.sin(fTheta);
      let faceY = 20 * Math.sin(fPhi);
      let faceZ = 12 * Math.cos(fPhi) * Math.cos(fTheta);

      // Nose protrusion
      if (Math.abs(fTheta) < 0.3 && fPhi > -0.2 && fPhi < 0.2) {
        faceZ += 4 * (1.0 - Math.abs(fTheta) / 0.3);
      }
      // Eyes sockets
      if (fPhi > 0.15 && fPhi < 0.35 && Math.abs(Math.abs(fTheta) - 0.5) < 0.2) {
        faceZ -= 2;
      }
      // Mouth socket
      if (fPhi > -0.3 && fPhi < -0.15 && Math.abs(fTheta) < 0.4) {
        faceZ -= 1.5;
      }

      posPhase1[i3] = faceX;
      posPhase1[i3 + 1] = faceY;
      posPhase1[i3 + 2] = faceZ;

      // --- PHASE 2: Resume Waving Sheet ---
      const col = i % 50;
      const row = Math.floor(i / 50);
      const paperX = (col - 25) * 0.8;
      const paperY = (row - (particleCount / 100)) * 0.8;
      
      posPhase2[i3] = paperX;
      posPhase2[i3 + 1] = paperY;
      posPhase2[i3 + 2] = Math.sin(paperX * 0.2) * Math.cos(paperY * 0.2) * 1.5;

      // --- PHASE 3: Undulating Voice Wave Grid ---
      const gridX = (i % 60) - 30;
      const gridZ = Math.floor(i / 60) - (particleCount / 120);
      
      posPhase3[i3] = gridX * 1.2;
      posPhase3[i3 + 1] = Math.sin(gridX * 0.2) * Math.cos(gridZ * 0.2) * 4.0;
      posPhase3[i3 + 2] = gridZ * 1.2;

      // --- PHASE 4: Stats Dashboard Columns ---
      const barIndex = i % 5;
      const barHeightVal = (barIndex === 0) ? 12 : (barIndex === 1) ? 22 : (barIndex === 2) ? 18 : (barIndex === 3) ? 28 : 24;
      const spreadX = (barIndex - 2.5) * 8.0;
      const spreadZ = (Math.random() - 0.5) * 4.0;
      const spreadY = Math.random() * barHeightVal - (barHeightVal / 2);

      posPhase4[i3] = spreadX + (Math.random() - 0.5) * 2;
      posPhase4[i3 + 1] = spreadY;
      posPhase4[i3 + 2] = spreadZ;

      // Initialize base position with Phase 0
      basePositions[i3] = posPhase0[i3];
      basePositions[i3 + 1] = posPhase0[i3 + 1];
      basePositions[i3 + 2] = posPhase0[i3 + 2];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(basePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Shader Material for glowing circular points
    const vertexShader = `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      void main() {
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        if (distanceToCenter > 0.5) discard;
        float strength = 1.0 - (distanceToCenter * 2.0);
        strength = pow(strength, 1.5);
        gl_FragColor = vec4(vColor, strength * 0.8);
      }
    `;

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    // 4. Laser Line for Resume Scanning (Phase 2 only)
    const laserGeometry = new THREE.BufferGeometry();
    const laserVertices = new Float32Array([-20, 0, 2, 20, 0, 2]);
    laserGeometry.setAttribute('position', new THREE.BufferAttribute(laserVertices, 3));
    const laserMaterial = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      linewidth: 3,
      transparent: true,
      opacity: 0
    });
    const laserLine = new THREE.Line(laserGeometry, laserMaterial);
    scene.add(laserLine);

    // 5. Connective lines (Neural network wireframe)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending
    });
    
    // We reuse a single line segments geometry
    const maxLineSegments = 300;
    const linePositions = new Float32Array(maxLineSegments * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // 6. Interaction Coordinates
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scroll = { current: 0, target: 0 };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        scroll.target = window.scrollY / scrollHeight;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let time = 0;
    let animationFrameId;

    const animate = () => {
      time += 0.01;

      // Smooth mouse and scroll interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;
      scroll.current += (scroll.target - scroll.current) * 0.08;

      // Determine active morphing phases
      const rawPhase = scroll.current * 4.0; // 0 to 4 range
      const currentPhase = Math.floor(rawPhase);
      const nextPhase = Math.min(currentPhase + 1, 4);
      const progress = rawPhase - currentPhase;

      const positions = geometry.attributes.position.array;
      let lineIdx = 0;

      // Morph coordinates & add wave patterns
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Base coordinates for current and next phases
        let pA_x, pA_y, pA_z;
        let pB_x, pB_y, pB_z;

        // Current phase lookup
        if (currentPhase === 0) {
          pA_x = posPhase0[i3]; pA_y = posPhase0[i3 + 1]; pA_z = posPhase0[i3 + 2];
        } else if (currentPhase === 1) {
          pA_x = posPhase1[i3]; pA_y = posPhase1[i3 + 1]; pA_z = posPhase1[i3 + 2];
        } else if (currentPhase === 2) {
          pA_x = posPhase2[i3]; pA_y = posPhase2[i3 + 1]; pA_z = posPhase2[i3 + 2];
        } else if (currentPhase === 3) {
          pA_x = posPhase3[i3]; pA_y = posPhase3[i3 + 1]; pA_z = posPhase3[i3 + 2];
        } else {
          pA_x = posPhase4[i3]; pA_y = posPhase4[i3 + 1]; pA_z = posPhase4[i3 + 2];
        }

        // Next phase lookup
        if (nextPhase === 0) {
          pB_x = posPhase0[i3]; pB_y = posPhase0[i3 + 1]; pB_z = posPhase0[i3 + 2];
        } else if (nextPhase === 1) {
          pB_x = posPhase1[i3]; pB_y = posPhase1[i3 + 1]; pB_z = posPhase1[i3 + 2];
        } else if (nextPhase === 2) {
          pB_x = posPhase2[i3]; pB_y = posPhase2[i3 + 1]; pB_z = posPhase2[i3 + 2];
        } else if (nextPhase === 3) {
          pB_x = posPhase3[i3]; pB_y = posPhase3[i3 + 1]; pB_z = posPhase3[i3 + 2];
        } else {
          pB_x = posPhase4[i3]; pB_y = posPhase4[i3 + 1]; pB_z = posPhase4[i3 + 2];
        }

        // Linearly interpolate
        let tx = pA_x + (pB_x - pA_x) * progress;
        let ty = pA_y + (pB_y - pA_y) * progress;
        let tz = pA_z + (pB_z - pA_z) * progress;

        // Phase specific dynamic behaviors
        if (scroll.current < 0.25) {
          // AI Core rotation and breathing noise
          const coreRotX = tx * Math.cos(time * 0.2) - tz * Math.sin(time * 0.2);
          const coreRotZ = tx * Math.sin(time * 0.2) + tz * Math.cos(time * 0.2);
          tx = coreRotX;
          tz = coreRotZ;
          ty += Math.sin(time * 2 + tx * 0.1) * 0.2;
        } else if (scroll.current >= 0.25 && scroll.current < 0.5) {
          // Face scanning matrix noise
          tz += Math.sin(time * 3 + ty * 0.5) * 0.15;
        } else if (scroll.current >= 0.5 && scroll.current < 0.75) {
          // Resume waving animation
          tz += Math.sin(time * 4 + tx * 0.3) * 0.8;
        } else if (scroll.current >= 0.75 && scroll.current < 0.9) {
          // Voice waveform undulations
          ty = Math.sin(tx * 0.15 + time * 5) * Math.cos(tz * 0.15 + time * 3) * 6.0;
        } else {
          // Stats Columns gentle vertical float
          ty += Math.sin(time * 3 + tx * 0.2) * 0.5;
        }

        // Apply interactive mouse displacement
        const dx = tx - mouse.x * 20;
        const dy = ty - mouse.y * 20;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 8.0) {
          const force = (8.0 - dist) / 8.0;
          tx += (dx / dist) * force * 1.5;
          ty += (dy / dist) * force * 1.5;
        }

        positions[i3] = tx;
        positions[i3 + 1] = ty;
        positions[i3 + 2] = tz;

        // Neural network connections (Phase 0 only, limit count to save GPU performance)
        if (scroll.current < 0.2 && lineIdx < maxLineSegments && i % 12 === 0) {
          // Find another random nearby point
          const targetIndex = (i + 15) % particleCount;
          const t3 = targetIndex * 3;
          const tX = positions[t3];
          const tY = positions[t3 + 1];
          const tZ = positions[t3 + 2];
          
          const d = Math.sqrt((tx-tX)*(tx-tX) + (ty-tY)*(ty-tY) + (tz-tZ)*(tz-tZ));
          if (d < 12.0) {
            const lineSegment3 = lineIdx * 2 * 3;
            linePositions[lineSegment3] = tx;
            linePositions[lineSegment3 + 1] = ty;
            linePositions[lineSegment3 + 2] = tz;
            linePositions[lineSegment3 + 3] = tX;
            linePositions[lineSegment3 + 4] = tY;
            linePositions[lineSegment3 + 5] = tZ;
            lineIdx++;
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;
      if (scroll.current < 0.2) {
        lineGeometry.attributes.position.needsUpdate = true;
        lineSegments.visible = true;
      } else {
        lineSegments.visible = false;
      }

      // Resume scan line laser behavior (Phase 2 scanner)
      if (scroll.current >= 0.4 && scroll.current < 0.7) {
        laserLine.visible = true;
        laserMaterial.opacity = (scroll.current - 0.4) / 0.1;
        if (laserMaterial.opacity > 1.0) laserMaterial.opacity = 1.0;
        if (scroll.current > 0.6) {
          laserMaterial.opacity = (0.7 - scroll.current) / 0.1;
        }
        // Laser position sweeps up and down
        laserLine.position.y = Math.sin(time * 5) * 15;
      } else {
        laserLine.visible = false;
      }

      // 8. Cinematic camera travel track
      if (scroll.current < 0.25) {
        // Hero: Standard perspective view
        camera.position.x += (mouse.x * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 5 - camera.position.y) * 0.05;
        camera.position.z += (45 - camera.position.z) * 0.05;
        camera.lookAt(0, 0, 0);
      } else if (scroll.current >= 0.25 && scroll.current < 0.5) {
        // Face build: Zoom out and shift camera slightly left
        camera.position.x += (-8 + mouse.x * 3 - camera.position.x) * 0.05;
        camera.position.y += (2 + mouse.y * 3 - camera.position.y) * 0.05;
        camera.position.z += (55 - camera.position.z) * 0.05;
        camera.lookAt(5, 0, 0);
      } else if (scroll.current >= 0.5 && scroll.current < 0.7) {
        // Resume Scan: Top-down tilted view
        camera.position.x += (mouse.x * 4 - camera.position.x) * 0.05;
        camera.position.y += (15 + mouse.y * 4 - camera.position.y) * 0.05;
        camera.position.z += (38 - camera.position.z) * 0.05;
        camera.lookAt(0, -3, 0);
      } else if (scroll.current >= 0.7 && scroll.current < 0.95) {
        // Voice Wave: Orbital landscape view
        camera.position.x += (25 * Math.sin(time * 0.1) - camera.position.x) * 0.05;
        camera.position.y += (12 - camera.position.y) * 0.05;
        camera.position.z += (35 * Math.cos(time * 0.1) - camera.position.z) * 0.05;
        camera.lookAt(0, -2, 0);
      } else {
        // Stats: Isometric high angle
        camera.position.x += (18 - camera.position.x) * 0.05;
        camera.position.y += (22 - camera.position.y) * 0.05;
        camera.position.z += (28 - camera.position.z) * 0.05;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      colors.fill(0);
      sizes.fill(0);
      particleMaterial.dispose();
      laserGeometry.dispose();
      laserMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0b0c16]"
      style={{ mixBlendingMode: 'screen' }}
    />
  );
}

export default ThreeBackground;
