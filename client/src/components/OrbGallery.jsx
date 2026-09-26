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
const pick = (r, a) => a[Math.min(a.length - 1, (r() * a.length) | 0)];
const rr = (r, a, b) => a + r() * (b - a);

// 64 procedural UI components as WebP / SVG / Canvas textures
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
    { bg: '#0f172a', card: '#1e293b', accent: '#3b82f6', text: '#f8fafc', sub: '#94a3b8', badge: '#0284c7' },
    { bg: '#18181b', card: '#27272a', accent: '#10b981', text: '#fafafa', sub: '#a1a1aa', badge: '#059669' },
    { bg: '#1e1b4b', card: '#312e81', accent: '#8b5cf6', text: '#ffffff', sub: '#c7d2fe', badge: '#7c3aed' },
    { bg: '#1c1917', card: '#292524', accent: '#f59e0b', text: '#fafaf9', sub: '#a8a29e', badge: '#d97706' },
    { bg: '#030712', card: '#111827', accent: '#06b6d4', text: '#f9fafb', sub: '#9ca3af', badge: '#0891b2' },
    { bg: '#14131a', card: '#22202e', accent: '#ec4899', text: '#ffffff', sub: '#a7a5b6', badge: '#db2777' },
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
    const titles = ['Analytics Flow', 'Resource Match', 'Need Tracker', 'Direct Connect', 'Service Radar', 'Community Hub', 'Instant Assist', 'Skill Ledger'];
    ctx.fillText(titles[i % titles.length], x + 48, y + 36);

    // Subtitle pill / badge
    ctx.fillStyle = t.badge;
    ctx.beginPath();
    ctx.roundRect(x + 28, y + 54, 76, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('ACTIVE', x + 46, y + 67);

    // UI charts / rows
    const layout = i % 4;
    if (layout === 0) {
      // Metric readout
      ctx.fillStyle = t.text;
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText(`98.${(i * 7) % 9}%`, x + 28, y + 110);
      ctx.fillStyle = t.sub;
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Satisfaction Rate', x + 28, y + 128);

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
        ctx.fillText(`Solution #${100 + i * 3 + r}`, x + 50, y + 110 + r * 42);
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

export function OrbGallery({ className = '', height = '600px' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let scriptLoaded = false;

    const initThree = () => {
      if (!window.THREE || !canvasRef.current || !containerRef.current) return;
      const THREE = window.THREE;

      const container = containerRef.current;
      const canvas = canvasRef.current;

      const width = container.clientWidth;
      const heightVal = container.clientHeight || 600;

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

      // Procedural Atlas
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
        const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
        const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;

        const x = Math.cos(theta) * rAtY;
        const z = Math.sin(theta) * rAtY;

        const pos = new THREE.Vector3(x * radius, y * radius, z * radius);

        // UV offset into procedural canvas atlas
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
        mesh.lookAt(pos.clone().multiplyScalar(2)); // orient outwards

        sphereGroup.add(mesh);
      }

      // Drag interaction
      let isDragging = false;
      let prevMousePos = { x: 0, y: 0 };
      let rotSpeed = { x: 0.002, y: 0.003 };
      let targetRotSpeed = { x: 0.0015, y: 0.002 };

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

        rotSpeed.x = deltaY * 0.002;
        rotSpeed.y = deltaX * 0.002;

        prevMousePos = { x: e.clientX, y: e.clientY };
      };

      const onPointerUp = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
      };

      canvas.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      // Resize listener
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight || 600;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      // Render loop
      let animId;
      const animate = () => {
        animId = requestAnimationFrame(animate);

        if (!isDragging) {
          // Smoothly glide towards auto-rotation
          rotSpeed.x += (targetRotSpeed.x - rotSpeed.x) * 0.05;
          rotSpeed.y += (targetRotSpeed.y - rotSpeed.y) * 0.05;

          sphereGroup.rotation.y += rotSpeed.y;
          sphereGroup.rotation.x += rotSpeed.x;
        }

        renderer.render(scene, camera);
      };

      animate();
      setLoaded(true);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        renderer.dispose();
      };
    };

    // Load Three.js if not on window
    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/three@0.149.0/build/three.min.js';
      script.async = true;
      script.onload = () => {
        scriptLoaded = true;
        initThree();
      };
      document.head.appendChild(script);
    } else {
      initThree();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden flex items-center justify-center select-none ${className}`}
      style={{ height, minHeight: '400px' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
