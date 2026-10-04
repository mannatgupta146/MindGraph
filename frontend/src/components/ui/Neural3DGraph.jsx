import React, { useEffect, useRef } from 'react';

const Neural3DGraph = ({ theme = 'dark' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Node definitions
    const numNodes = 75;
    const nodes = [];
    const focalLength = 420;

    // Key topic labels spaced evenly in 3D
    const topicLabels = [
      { text: 'MindGraph v2.0', color: '#3B82F6', size: 12 },
      { text: 'AI Vectors', color: '#06B6D4', size: 10 },
      { text: 'Knowledge Graph', color: '#10B981', size: 10 },
      { text: 'Second Brain', color: '#8B5CF6', size: 10 },
      { text: 'OCR Engine', color: '#F59E0B', size: 10 },
      { text: 'Neural Storage', color: '#EC4899', size: 10 },
    ];

    // Fibonacci Sphere distribution for topics to prevent overlap
    const numTopics = topicLabels.length;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numTopics; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / numTopics);
      const r = 210 + (i % 2) * 40;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const topic = topicLabels[i];
      nodes.push({
        x, y, z,
        baseX: x, baseY: y, baseZ: z,
        vx: 0, vy: 0, vz: 0,
        // Screen-space displacement used by hover/click physics (springs back to 0)
        dx: 0, dy: 0, dvx: 0, dvy: 0,
        flash: 0,
        radius: topic.size,
        color: topic.color,
        label: topic.text,
        pulseOffset: i * 1.2,
      });
    }

    // Secondary ambient 3D particle nodes
    for (let i = numTopics; i < numNodes; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 100 + Math.random() * 260;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      nodes.push({
        x, y, z,
        baseX: x, baseY: y, baseZ: z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        dx: 0, dy: 0, dvx: 0, dvy: 0,
        flash: 0,
        radius: 2 + Math.random() * 2,
        color: i % 3 === 0 ? '#3B82F6' : i % 3 === 1 ? '#06B6D4' : '#94A3B8',
        label: null,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // ---- Interaction state ----
    // The hero text sits above this canvas, so we listen on window and map to canvas coords.
    let mouseLocalX = -9999;
    let mouseLocalY = -9999;
    let mouseInside = false;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;
    let spinBoost = 0;
    let hoveredIdx = null;
    let cursorSet = false;
    const ripples = [];

    const isInteractiveTarget = (target) =>
      target && target.closest && target.closest('a, button, input, textarea, select, label, [role="button"]');

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseLocalX = e.clientX - rect.left;
      mouseLocalY = e.clientY - rect.top;
      mouseInside =
        mouseLocalX >= 0 && mouseLocalX <= rect.width &&
        mouseLocalY >= 0 && mouseLocalY <= rect.height &&
        !isInteractiveTarget(e.target);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      targetRotY = ((mouseLocalX - cx) / rect.width) * 0.5;
      targetRotX = -((mouseLocalY - cy) / rect.height) * 0.5;
    };

    const handleMouseLeave = () => {
      mouseInside = false;
    };

    // Index-based projections (unsorted) so particles keep stable node references
    let lastProjected = [];

    const handleClick = (e) => {
      if (isInteractiveTarget(e.target)) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      // Shockwave ripple
      ripples.push({ x, y, start: performance.now(), color: hoveredIdx !== null ? nodes[hoveredIdx].color : '#60A5FA' });

      // Burst nodes outward from click point (they spring back afterwards)
      lastProjected.forEach((p, idx) => {
        const ddx = p.px - x;
        const ddy = p.py - y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        if (dist < 320) {
          const force = (1 - dist / 320) * 14;
          nodes[idx].dvx += (ddx / dist) * force;
          nodes[idx].dvy += (ddy / dist) * force;
          nodes[idx].flash = Math.max(nodes[idx].flash, 1 - dist / 320);
        }
      });

      // Fire signal pulses from the clicked node to its nearest neighbours
      if (hoveredIdx !== null) {
        const origin = lastProjected[hoveredIdx];
        const neighbours = lastProjected
          .map((p, idx) => ({ idx, d: Math.hypot(p.px - origin.px, p.py - origin.py) }))
          .filter((n) => n.idx !== hoveredIdx)
          .sort((a, b) => a.d - b.d)
          .slice(0, 10);
        neighbours.forEach((n) => {
          burstParticles.push({
            nodeA: hoveredIdx,
            nodeB: n.idx,
            progress: 0,
            speed: 0.025 + Math.random() * 0.02,
            color: nodes[hoveredIdx].color,
          });
        });
        nodes[hoveredIdx].flash = 1.5;
      }

      spinBoost = 0.035;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    document.addEventListener('mouseleave', handleMouseLeave);

    let angleY = 0;
    let angleX = 0;

    // Signal particles traveling along 3D links (indices into `nodes`)
    const particles = [];
    for (let i = 0; i < 18; i++) {
      particles.push({
        nodeA: Math.floor(Math.random() * numNodes),
        nodeB: Math.floor(Math.random() * numNodes),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
        color: i % 2 === 0 ? '#60A5FA' : '#34D399',
      });
    }
    const burstParticles = [];

    // Helper for rounded rectangle badge background
    const drawPillBadge = (ctx, text, x, y, fontSize, textColor, bgColor, borderColor, lineWidth = 1) => {
      ctx.font = `800 ${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(text).width;
      const paddingX = 8;
      const paddingY = 4;
      const w = textWidth + paddingX * 2;
      const h = fontSize + paddingY * 2;
      const rx = x - w / 2;
      const ry = y - h / 2;
      const r = 6;

      ctx.beginPath();
      ctx.moveTo(rx + r, ry);
      ctx.arcTo(rx + w, ry, rx + w, ry + h, r);
      ctx.arcTo(rx + w, ry + h, rx, ry + h, r);
      ctx.arcTo(rx, ry + h, rx, ry, r);
      ctx.arcTo(rx, ry, rx + w, ry, r);
      ctx.closePath();

      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
    };

    // Render loop
    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = theme === 'dark';

      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : canvas.height;

      // Dynamic Center Position: On desktop (> 1024px), place 3D graph on right side (74%) to avoid text overlap
      const centerX = canvas.width > 1024 ? canvas.width * 0.74 : (canvas.width > 768 ? canvas.width * 0.68 : canvas.width * 0.5);
      const centerY = viewportHeight * 0.44;

      // Smooth mouse rotation
      rotX += (targetRotX - rotX) * 0.04;
      rotY += (targetRotY - rotY) * 0.04;
      spinBoost *= 0.96;

      angleY += 0.002 + rotY * 0.008 + spinBoost;
      angleX += 0.0008 + rotX * 0.008;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Project 3D points (keep same index order as `nodes`)
      const projected = nodes.map((node, idx) => {
        if (!node.label) {
          node.baseX += node.vx;
          node.baseY += node.vy;
          node.baseZ += node.vz;

          if (Math.abs(node.baseX) > 280) node.vx *= -1;
          if (Math.abs(node.baseY) > 280) node.vy *= -1;
          if (Math.abs(node.baseZ) > 280) node.vz *= -1;
        }

        // Rotate Y
        const x1 = node.baseX * cosY - node.baseZ * sinY;
        const z1 = node.baseZ * cosY + node.baseX * sinY;

        // Rotate X
        const y1 = node.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.baseY * sinX;

        const scale = focalLength / (focalLength + z2 + 280);
        const rawX = centerX + x1 * scale;
        const rawY = centerY + y1 * scale;

        // Magnetic hover: gently push nodes away from the cursor
        if (mouseInside) {
          const mdx = rawX + node.dx - mouseLocalX;
          const mdy = rawY + node.dy - mouseLocalY;
          const md = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
          if (md < 130) {
            const push = (1 - md / 130) * 0.9;
            node.dvx += (mdx / md) * push;
            node.dvy += (mdy / md) * push;
          }
        }

        // Spring back to rest + damping
        node.dvx += -node.dx * 0.06;
        node.dvy += -node.dy * 0.06;
        node.dvx *= 0.84;
        node.dvy *= 0.84;
        node.dx += node.dvx;
        node.dy += node.dvy;
        node.flash *= 0.94;

        return {
          idx,
          node,
          px: rawX + node.dx,
          py: rawY + node.dy,
          scale,
          z3d: z2,
        };
      });
      lastProjected = projected;

      // Find hovered node (topic nodes get a larger hit area)
      hoveredIdx = null;
      if (mouseInside) {
        let best = Infinity;
        projected.forEach((p) => {
          const hit = p.node.label ? 34 : 18;
          const d = Math.hypot(p.px - mouseLocalX, p.py - mouseLocalY);
          if (d < hit && d < best) {
            best = d;
            hoveredIdx = p.idx;
          }
        });
      }

      // Pointer cursor while over a node
      if (hoveredIdx !== null && !cursorSet) {
        document.body.style.cursor = 'pointer';
        cursorSet = true;
      } else if (hoveredIdx === null && cursorSet) {
        document.body.style.cursor = '';
        cursorSet = false;
      }

      // Sort by Z depth for drawing
      const drawOrder = [...projected].sort((a, b) => b.z3d - a.z3d);
      const maxDistance = 150;

      // Soft cursor spotlight
      if (mouseInside) {
        const spot = ctx.createRadialGradient(mouseLocalX, mouseLocalY, 0, mouseLocalX, mouseLocalY, 160);
        spot.addColorStop(0, isDark ? 'rgba(96,165,250,0.10)' : 'rgba(37,99,235,0.07)');
        spot.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = spot;
        ctx.beginPath();
        ctx.arc(mouseLocalX, mouseLocalY, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render 3D Links
      for (let i = 0; i < drawOrder.length; i++) {
        for (let j = i + 1; j < drawOrder.length; j++) {
          const na = drawOrder[i];
          const nb = drawOrder[j];

          const dx = na.px - nb.px;
          const dy = na.py - nb.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const boost = 1 + Math.max(na.node.flash, nb.node.flash) * 2;
            const alpha = Math.min(0.9, (1 - dist / maxDistance) * 0.25 * Math.min(na.scale, nb.scale) * boost);
            ctx.beginPath();
            ctx.moveTo(na.px, na.py);
            ctx.lineTo(nb.px, nb.py);
            ctx.strokeStyle = isDark
              ? `rgba(96, 165, 250, ${alpha})`
              : `rgba(37, 99, 235, ${alpha * 0.7})`;
            ctx.lineWidth = 1 * Math.min(na.scale, nb.scale);
            ctx.stroke();
          }
        }
      }

      // Hover highlight: glowing links fanning out from the hovered node
      if (hoveredIdx !== null) {
        const h = projected[hoveredIdx];
        projected.forEach((p) => {
          if (p.idx === hoveredIdx) return;
          const d = Math.hypot(p.px - h.px, p.py - h.py);
          if (d < 230) {
            const a = (1 - d / 230) * 0.85;
            const grad = ctx.createLinearGradient(h.px, h.py, p.px, p.py);
            grad.addColorStop(0, `${h.node.color}${Math.round(a * 255).toString(16).padStart(2, '0')}`);
            grad.addColorStop(1, `${h.node.color}00`);
            ctx.beginPath();
            ctx.moveTo(h.px, h.py);
            ctx.lineTo(p.px, p.py);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        });
      }

      // Signal particles (ambient + click bursts)
      const drawParticle = (p) => {
        const na = projected[p.nodeA];
        const nb = projected[p.nodeB];
        if (!na || !nb) return;
        const px = na.px + (nb.px - na.px) * p.progress;
        const py = na.py + (nb.py - na.py) * p.progress;
        const pScale = na.scale + (nb.scale - na.scale) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, (p.burst ? 2.6 : 2) * pScale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.burst ? 14 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      };

      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
          p.nodeA = Math.floor(Math.random() * numNodes);
          p.nodeB = Math.floor(Math.random() * numNodes);
        }
        drawParticle(p);
      });

      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];
        p.burst = true;
        p.progress += p.speed;
        if (p.progress >= 1) {
          nodes[p.nodeB].flash = Math.max(nodes[p.nodeB].flash, 0.8);
          burstParticles.splice(i, 1);
          continue;
        }
        drawParticle(p);
      }

      // Click shockwave ripples
      const now = performance.now();
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const t = (now - r.start) / 1000;
        if (t > 1) {
          ripples.splice(i, 1);
          continue;
        }
        const ease = 1 - Math.pow(1 - t, 3);
        [0, 0.18].forEach((delay) => {
          const tt = Math.max(0, ease - delay);
          if (tt <= 0) return;
          ctx.beginPath();
          ctx.arc(r.x, r.y, 20 + tt * 260, 0, Math.PI * 2);
          ctx.strokeStyle = `${r.color}${Math.round((1 - t) * 180).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2 * (1 - t) + 0.5;
          ctx.stroke();
        });
      }

      // Render 3D Nodes & Badges
      drawOrder.forEach((p) => {
        const node = p.node;
        const isHovered = p.idx === hoveredIdx;
        const pulse = Math.sin(time * 0.003 + node.pulseOffset) * 0.15 + 1;
        const grow = isHovered ? 1.8 : 1 + node.flash * 0.6;
        const currentRadius = Math.max(1.5, node.radius * p.scale * pulse * grow);

        // Glow
        if (node.label || isHovered || node.flash > 0.05) {
          const glowR = currentRadius * (isHovered ? 4.5 : 3);
          const glowGrad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, glowR);
          glowGrad.addColorStop(0, `${node.color}${isHovered ? '88' : '55'}`);
          glowGrad.addColorStop(1, `${node.color}00`);
          ctx.beginPath();
          ctx.arc(p.px, p.py, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(p.px, p.py, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = isHovered ? 24 : node.label ? 12 : 4;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hover ring (rotating dashed orbit)
        if (isHovered) {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -time * 0.02;
          ctx.arc(p.px, p.py, currentRadius + 7, 0, Math.PI * 2);
          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.75)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();
        }

        // Render Clean HUD Badge for Topic Labels
        if (node.label && (p.scale > 0.45 || isHovered)) {
          const baseFont = Math.max(9, Math.round(11 * p.scale));
          const fontSize = isHovered ? baseFont + 3 : baseFont;
          const textColor = isDark ? '#FFFFFF' : '#0F172A';
          const bgColor = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)';
          const borderColor = isHovered ? node.color : `${node.color}66`;

          drawPillBadge(
            ctx,
            node.label,
            p.px,
            p.py + currentRadius + 16,
            fontSize,
            textColor,
            bgColor,
            borderColor,
            isHovered ? 1.6 : 1
          );
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (cursorSet) document.body.style.cursor = '';
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block pointer-events-none"
    />
  );
};

export default Neural3DGraph;
