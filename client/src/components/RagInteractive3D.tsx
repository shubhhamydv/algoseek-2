import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * RagInteractive3D
 * Premium interactive 3D spatial visualization of a RAG system:
 * Documents → Vector Embeddings → Database Core → Retrieval & Response
 *
 * Rules:
 * - Floating layered cylindrical vector database core.
 * - 4 floating 3D document nodes.
 * - Sparse glowing vector embeddings network.
 * - Smooth animated retrieval flow particles.
 * - Subtle mouse parallax & gentle orbital motion.
 * - Restrained palette: dark graphite, frosted glass, emerald-green accent.
 * - Zero extra UI text, badges, or buttons.
 */
export function RagInteractive3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // ─── Scene & Camera ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.4, 2.0, 4.4);
    camera.lookAt(0, 0, 0);

    // ─── Renderer ───
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ─── Lighting ───
    const ambientLight = new THREE.AmbientLight(0xf5eedc, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const coreLight = new THREE.PointLight(0xd4af37, 3.5, 5.5);
    coreLight.position.set(0.2, 0, 0);
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0xe2b855, 1.0);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // ─── Root Group for Mouse Parallax ───
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // ═══════════════════════════════════════════════════════════════
    // 1. CENTRAL VECTOR DATABASE CORE
    // ═══════════════════════════════════════════════════════════════
    const coreGroup = new THREE.Group();
    rootGroup.add(coreGroup);

    // Core layer material (deep obsidian bronze with frosted glass quality)
    const diskMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1814,
      metalness: 0.88,
      roughness: 0.18,
      transparent: true,
      opacity: 0.88,
    });

    const glowRimMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });

    const cyanRimMaterial = new THREE.MeshBasicMaterial({
      color: 0xf3d279,
      transparent: true,
      opacity: 0.4,
    });

    // 3 Layered Cylindrical Discs
    const layerCount = 3;
    const layerSpacing = 0.42;
    const diskRadius = 0.85;
    const diskHeight = 0.12;

    for (let i = 0; i < layerCount; i++) {
      const yPos = (i - (layerCount - 1) / 2) * layerSpacing;

      // Base cylinder disc
      const diskGeo = new THREE.CylinderGeometry(diskRadius, diskRadius, diskHeight, 36);
      const diskMesh = new THREE.Mesh(diskGeo, diskMaterial);
      diskMesh.position.y = yPos;
      coreGroup.add(diskMesh);

      // Glowing inner accent ring
      const ringGeo = new THREE.TorusGeometry(diskRadius * 0.96, 0.016, 16, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, i === 1 ? cyanRimMaterial : glowRimMaterial);
      ringMesh.position.y = yPos + diskHeight / 2 + 0.005;
      coreGroup.add(ringMesh);

      // Internal subtle core pillar connecting discs
      if (i < layerCount - 1) {
        const pillarGeo = new THREE.CylinderGeometry(0.32, 0.32, layerSpacing, 24);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: 0x5c4308,
          emissive: 0x5c4308,
          emissiveIntensity: 0.5,
          roughness: 0.3,
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.y = yPos + layerSpacing / 2;
        coreGroup.add(pillar);
      }
    }

    // Outer faint vector index ring floating around core
    const outerRingGeo = new THREE.TorusGeometry(1.22, 0.012, 16, 64);
    outerRingGeo.rotateX(Math.PI / 3);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.35,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    coreGroup.add(outerRing);

    // ═══════════════════════════════════════════════════════════════
    // 2. FLOATING DOCUMENT NODES (Knowledge Source)
    // ═══════════════════════════════════════════════════════════════
    const docGroup = new THREE.Group();
    rootGroup.add(docGroup);

    const docMaterial = new THREE.MeshStandardMaterial({
      color: 0x241e17,
      metalness: 0.35,
      roughness: 0.35,
      transparent: true,
      opacity: 0.88,
    });

    const docEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.6,
    });

    interface DocItem {
      mesh: THREE.Group;
      initialPos: THREE.Vector3;
      speed: number;
      offset: number;
    }
    const docItems: DocItem[] = [];

    const docConfigs = [
      { pos: new THREE.Vector3(-1.8, 0.65, 0.3), rot: [-0.15, 0.3, -0.1], scale: [0.45, 0.62, 0.02] },
      { pos: new THREE.Vector3(-1.5, -0.5, 0.8), rot: [0.2, 0.45, 0.15], scale: [0.4, 0.55, 0.02] },
      { pos: new THREE.Vector3(-1.9, -0.3, -0.6), rot: [0.1, -0.2, 0.25], scale: [0.42, 0.58, 0.02] },
      { pos: new THREE.Vector3(-1.2, 1.1, -0.5), rot: [-0.25, 0.15, -0.2], scale: [0.38, 0.52, 0.02] },
    ];

    docConfigs.forEach((cfg, idx) => {
      const g = new THREE.Group();
      const docBox = new THREE.Mesh(
        new THREE.BoxGeometry(cfg.scale[0], cfg.scale[1], cfg.scale[2]),
        docMaterial
      );
      g.add(docBox);

      // Outlined edges
      const edges = new THREE.EdgesGeometry(docBox.geometry);
      const edgeLine = new THREE.LineSegments(edges, docEdgeMaterial);
      g.add(edgeLine);

      g.position.copy(cfg.pos);
      g.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
      docGroup.add(g);

      docItems.push({
        mesh: g,
        initialPos: cfg.pos.clone(),
        speed: 0.8 + idx * 0.2,
        offset: idx * 1.5,
      });
    });

    // ═══════════════════════════════════════════════════════════════
    // 3. VECTOR EMBEDDINGS (Sparse Semantic Network)
    // ═══════════════════════════════════════════════════════════════
    const networkGroup = new THREE.Group();
    rootGroup.add(networkGroup);

    const nodeCount = 14;
    const nodePositions: THREE.Vector3[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: 0xf3d279,
      transparent: true,
      opacity: 0.85,
    });

    for (let i = 0; i < nodeCount; i++) {
      // Distribute nodes around the bridge between docs and database
      const x = -1.1 + Math.random() * 1.8;
      const y = -0.7 + Math.random() * 1.4;
      const z = -0.8 + Math.random() * 1.6;
      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos);

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      networkGroup.add(nodeMesh);
    }

    // Connect close nodes with sparse semantic lines
    const lineIndices: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist > 0.4 && dist < 1.1) {
          lineIndices.push(i, j);
        }
      }
    }

    const linePoints: THREE.Vector3[] = [];
    lineIndices.forEach((idx) => linePoints.push(nodePositions[idx]));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xb8860b,
      transparent: true,
      opacity: 0.35,
    });
    const networkLines = new THREE.LineSegments(lineGeo, lineMat);
    networkGroup.add(networkLines);

    // ═══════════════════════════════════════════════════════════════
    // 4. RETRIEVAL & RESPONSE OUTLET (Output side)
    // ═══════════════════════════════════════════════════════════════
    const outputGroup = new THREE.Group();
    rootGroup.add(outputGroup);

    // Single sleek response receptor node on the right
    const receptorGeo = new THREE.OctahedronGeometry(0.18, 0);
    const receptorMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xb8860b,
      emissiveIntensity: 0.75,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: true,
    });
    const receptor = new THREE.Mesh(receptorGeo, receptorMat);
    receptor.position.set(1.9, 0.1, 0.4);
    outputGroup.add(receptor);

    // ═══════════════════════════════════════════════════════════════
    // 5. ANIMATED RETRIEVAL FLOW PARTICLES
    // ═══════════════════════════════════════════════════════════════
    // Flow pathway: Documents -> Vector space -> Database Core -> Response
    const flowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, 0.4, 0.2),
      new THREE.Vector3(-1.1, 0.1, 0.5),
      new THREE.Vector3(-0.4, -0.1, 0.2),
      new THREE.Vector3(0.0, 0.05, 0.0), // Core
      new THREE.Vector3(0.7, 0.12, 0.1),
      new THREE.Vector3(1.3, 0.08, 0.3),
      new THREE.Vector3(1.9, 0.1, 0.4),  // Response
    ]);

    const particleCount = 36;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleProgress = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleProgress[i] = i / particleCount;
      const pt = flowCurve.getPointAt(particleProgress[i]);
      particlePositions[i * 3] = pt.x;
      particlePositions[i * 3 + 1] = pt.y;
      particlePositions[i * 3 + 2] = pt.z;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xf5d990,
      size: 0.065,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particleSystem);

    // ═══════════════════════════════════════════════════════════════
    // 6. MOUSE INTERACTION & SMOOTH PARALLAX
    // ═══════════════════════════════════════════════════════════════
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ─── Animation Loop ───
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Slow elegant core rotation
      coreGroup.rotation.y = elapsed * 0.18;
      coreGroup.position.y = Math.sin(elapsed * 0.9) * 0.06;
      outerRing.rotation.z = -elapsed * 0.25;

      // Floating document nodes
      docItems.forEach((item) => {
        item.mesh.position.y = item.initialPos.y + Math.sin(elapsed * item.speed + item.offset) * 0.05;
        item.mesh.rotation.y += 0.001;
      });

      // Response node rotation
      receptor.rotation.x = elapsed * 0.4;
      receptor.rotation.y = elapsed * 0.6;

      // Particle flow propagation
      const positions = particleGeo.attributes.position.array as Float32Array;
      const flowSpeed = 0.06;
      for (let i = 0; i < particleCount; i++) {
        particleProgress[i] = (particleProgress[i] + flowSpeed * 0.016) % 1;
        const pt = flowCurve.getPointAt(particleProgress[i]);
        positions[i * 3] = pt.x + (Math.sin(elapsed * 3 + i) * 0.02);
        positions[i * 3 + 1] = pt.y + (Math.cos(elapsed * 3 + i) * 0.02);
        positions[i * 3 + 2] = pt.z;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Smooth mouse parallax
      targetRotY = mouseX * 0.28;
      targetRotX = -mouseY * 0.18;
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // ─── Resize Handling ───
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      role="img"
      aria-label="3D interactive visualization of RAG vector retrieval system"
      className="rag-3d-canvas-container"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "440px",
        maxHeight: "560px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        overflow: "hidden",
      }}
    />
  );
}

export default RagInteractive3D;
