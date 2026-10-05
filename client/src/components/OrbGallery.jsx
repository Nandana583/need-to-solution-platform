import React, { useEffect, useRef, useState } from 'react';

// Deterministic RNG helper
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rr = (r, a, b) => a + r() * (b - a);

// Procedural UI components in Emerald, Teal, Mint, Sage, Terracotta & Peach tones (Strictly Zero Blue/Purple)
function createProceduralAtlas(THREE, tileCount = 36) {
  const canvas = document.createElement('canvas');
  const cols = 6;
  const rows = 6;
  const tileW = 256;
  const tileH = 256;
  canvas.width = cols * tileW;
  canvas.height = rows * tileH;
  const ctx = canvas.getContext('2d');

  const themes = [
    { bg: '#0d1310', card: '#16221c', accent: '#10b981', text: '#f8fafc', sub: '#a7f3d0', badge: '#059669' },
    { bg: '#14181a', card: '#1d2627', accent: '#14b8a6', text: '#fafafa', sub: '#99f6e4', badge: '#0d9488' },
    { bg: '#171412', card: '#27201c', accent: '#e07a5f', text: '#ffffff', sub: '#fed7aa', badge: '#c25e40' },
    { bg: '#151613', card: '#21241e', accent: '#84cc16', text: '#fafaf9', sub: '#d9f99d', badge: '#65a30d' },
    { bg: '#171510', card: '#262219', accent: '#f59e0b', text: '#f9fafb', sub: '#fde68a', badge: '#d97706' },
    { bg: '#101715', card: '#182420', accent: '#34d399', text: '#ffffff', sub: '#a7f3d0', badge: '#059669' },
  ];

  const rng = mulberry32(42);

  for (let i = 0; i < tileCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * tileW;
    const y = row * tileH;
    const t = themes[i % themes.length];

    // Background tile
    ctx.fillStyle = t.bg;
    ctx.fillRect(x, y, tileW, tileH);

    // Card frame
    ctx.fillStyle = t.card;
    ctx.beginPath();
    ctx.roundRect(x + 12, y + 12, tileW - 24, tileH - 24, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header bar
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.arc(x + 32, y + 32, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = t.text;
    ctx.font = 'bold 13px Inter, sans-serif';
    const titles = ['Solution Matrix', 'Resource Match', 'Need Tracker', 'Direct Connect', 'Service Radar', 'Community Hub', 'Instant Assist', 'Skill Exchange'];
    ctx.fillText(titles[i % titles.length], x + 48, y + 36);

    // Subtitle pill / badge
    ctx.fillStyle = t.badge;
    ctx.beginPath();
    ctx.roundRect(x + 28, y + 54, 76, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('SOLVED', x + 46, y + 67);

    // UI charts / rows
    const layout = i % 4;
    if (layout === 0) {
      // Metric readout
      ctx.fillStyle = t.text;
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText(`98.${(i * 7) % 9}%`, x + 28, y + 110);
      ctx.fillStyle = t.sub;
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Solution Match Rate', x + 28, y + 128);

      // Sparkline
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 28, y + 180);
      for (let s = 0; s < 5; s++) {
        ctx.lineTo(x + 28 + s * 45, y + 180 - rr(rng, 10, 45));
      }
      ctx.stroke();
    } else if (layout === 1) {
      // List items
      for (let r = 0; r < 3; r++) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.roundRect(x + 24, y + 90 + r * 42, tileW - 48, 32, 8);
        ctx.fill();

        ctx.fillStyle = t.accent;
        ctx.fillRect(x + 34, y + 102 + r * 42, 8, 8);

        ctx.fillStyle = t.sub;
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(`Alternative #${100 + i * 3 + r}`, x + 50, y + 110 + r * 42);
      }
    } else if (layout === 2) {
      // Circular progress
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.arc(x + tileW / 2, y + 140, 36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = t.accent;
      ctx.beginPath();
      ctx.arc(x + tileW / 2, y + 140, 36, -Math.PI / 2, Math.PI * 0.9);
      ctx.stroke();

      ctx.fillStyle = t.text;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Verified', x + tileW / 2, y + 145);
      ctx.textAlign = 'left';
    } else {
      // Grid cards
      for (let gx = 0; gx < 2; gx++) {
        for (let gy = 0; gy < 2; gy++) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.beginPath();
          ctx.roundRect(x + 26 + gx * 102, y + 90 + gy * 62, 94, 52, 8);
          ctx.fill();
          ctx.fillStyle = t.accent;
          ctx.fillRect(x + 36 + gx * 102, y + 102 + gy * 62, 20, 4);
          ctx.fillStyle = t.sub;
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(`Node ${gx}-${gy}`, x + 36 + gx * 102, y + 126 + gy * 62);
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return { texture, cols, rows, total: tileCount };
}

export function OrbGallery({ className = '', height = '450px' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let animId = null;
    let isCleanedUp = false;

    const initThree = () => {
      if (!window.THREE || !canvasRef.current || !containerRef.current || isCleanedUp) return;
      const THREE = window.THREE;

      const container = containerRef.current;
      const canvas = canvasRef.current;

      const width = container.clientWidth || 600;
      const heightVal = parseInt(height, 10) || 450;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / heightVal, 0.1, 1000);
      camera.position.z = 5.2;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, heightVal);

      // Procedural Atlas in new Emerald/Coral theme
      const atlas = createProceduralAtlas(THREE, 36);
      const { texture, cols, rows } = atlas;

      // Create Sphere Plate Group
      const sphereGroup = new THREE.Group();
      scene.add(sphereGroup);

      // Plate geometry & materials on Fibonacci sphere
      const count = 48;
      const radius = 2.1;
      const plateGeo = new THREE.PlaneGeometry(0.55, 0.55);
      const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio

      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;

        const x = Math.cos(theta) * rAtY;
        const z = Math.sin(theta) * rAtY;
        const pos = new THREE.Vector3(x * radius, y * radius, z * radius);

        const tileIdx = i % 36;
        const col = tileIdx % cols;
        const row = Math.floor(tileIdx / cols);

        const mat = new THREE.MeshBasicMaterial({
          map: texture.clone(),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });

        mat.map.repeat.set(1 / cols, 1 / rows);
        mat.map.offset.set(col / cols, (rows - 1 - row) / rows);
        mat.map.needsUpdate = true;

        const mesh = new THREE.Mesh(plateGeo, mat);
        mesh.position.copy(pos);
        mesh.lookAt(pos.clone().multiplyScalar(2));

        sphereGroup.add(mesh);
      }

      // Drag interaction
      let isDragging = false;
      let prevMousePos = { x: 0, y: 0 };
      let rotSpeed = { x: 0.0015, y: 0.002 };

      const onPointerDown = (e) => {
        isDragging = true;
        prevMousePos = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        sphereGroup.rotation.y += deltaX * 0.005;
        sphereGroup.rotation.x += deltaY * 0.005;
        prevMousePos = { x: e.clientX, y: e.clientY };
      };

      const onPointerUp = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
      };

      canvas.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current || !renderer || isCleanedUp) return;
        const newW = containerRef.current.clientWidth;
        camera.aspect = newW / heightVal;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, heightVal);
      });
      resizeObserver.observe(container);

      // Render loop
      const animate = () => {
        if (isCleanedUp) return;
        if (!isDragging) {
          sphereGroup.rotation.y += rotSpeed.y;
          sphereGroup.rotation.x += rotSpeed.x * 0.5;
        }
        renderer.render(scene, camera);
        animId = requestAnimationFrame(animate);
      };
      animate();
      setLoaded(true);

      return () => {
        isCleanedUp = true;
        if (animId) cancelAnimationFrame(animId);
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        resizeObserver.disconnect();
        renderer.dispose();
      };
    };

    if (window.THREE) {
      const cleanup = initThree();
      return cleanup;
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.onload = () => {
        initThree();
      };
      document.body.appendChild(script);
      return () => {
        isCleanedUp = true;
        if (animId) cancelAnimationFrame(animId);
      };
    }
  }, [height]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden flex items-center justify-center ${className}`}
      style={{ height }}
    >
      <canvas ref={canvasRef} className="cursor-grab select-none touch-none" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)]">
          Loading 3D Solution Flow...
        </div>
      )}
    </div>
  );
}
