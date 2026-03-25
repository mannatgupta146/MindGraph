import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { forceX, forceY, forceCollide } from 'd3-force';

const KnowledgeGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedSaveId, setSelectedSaveId] = useState(null);
  const [selectedSave, setSelectedSave] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const fgRef = useRef();
  const containerRef = useRef();

  // Responsive dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Fetch data
  const fetchGraphData = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/saves/graph', { withCredentials: true });
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Physics + Constraints
  useEffect(() => {
    if (!fgRef.current) return;

    const fg = fgRef.current;

    // Remove center force
    fg.d3Force('center', null);

    // Better layout forces
    fg.d3Force('x', forceX(0).strength(0.25));
    fg.d3Force('y', forceY(0).strength(0.25));
    fg.d3Force('charge').strength(-60);
    fg.d3Force('collide', forceCollide(18));
    fg.d3Force('link').distance(60).strength(0.5);

    // HARD BOUNDARY (THE VAULT)
    fg.d3Force('box', () => {
      const xLim = dimensions.width * 0.35; 
      const yLim = dimensions.height * 0.35;
      graphData.nodes.forEach(node => {
        node.x = Math.max(-xLim, Math.min(xLim, node.x));
        node.y = Math.max(-yLim, Math.min(yLim, node.y));
        if (Math.abs(node.x) >= xLim || Math.abs(node.y) >= yLim) {
          node.vx = 0;
          node.vy = 0;
        }
      });
    });
  }, [graphData, dimensions]);

  // Move controls FIXED
  const moveBy = (dx, dy) => {
    if (!fgRef.current) return;

    const center = fgRef.current.screen2GraphCoords(
      dimensions.width / 2,
      dimensions.height / 2
    );

    fgRef.current.centerAt(center.x + dx, center.y + dy, 400);
  };

  // Zoom controls FIXED
  const zoomBy = (factor) => {
    const current = fgRef.current.zoom();
    const next = Math.max(0.6, Math.min(3, current * factor));
    fgRef.current.zoom(next, 400);
  };

  const focusNode = (q) => {
    if (!q || q.length < 2) return;
    const node = graphData.nodes.find(n => n.title?.toLowerCase().includes(q.toLowerCase()));
    if (node) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(1.8, 800);
      setSelectedSaveId(node.id);
    }
  };

  // Node click
  const handleNodeClick = useCallback(node => {
    fgRef.current.centerAt(node.x, node.y, 600);
    fgRef.current.zoom(2.5, 600);
    setSelectedSaveId(node.id);
  }, []);

  // Load selected node data
  useEffect(() => {
    if (selectedSaveId) {
      axios.get(`http://localhost:3000/api/saves`, { withCredentials: true })
        .then(({ data }) => {
          setSelectedSave(data.find(s => s._id === selectedSaveId));
        });
    }
  }, [selectedSaveId]);

  // Auto fit after simulation
  const handleEngineStop = useCallback(() => {
    fgRef.current.zoomToFit(600, 100);
  }, []);

  // Custom node renderer
  const paintNode = useCallback((node, ctx, globalScale) => {
    const icons = { youtube: '🎬', pdf: '📕', tweet: '🐦', default: '🧠' };
    const colors = { youtube: '#EF4444', pdf: '#F87171', tweet: '#60A5FA', default: '#10B981' };

    const icon = icons[node.type] || icons.default;
    const color = colors[node.type] || colors.default;

    const scale = Math.max(0.4, Math.min(4, globalScale));
    const size = 40 / scale;

    ctx.shadowColor = color;
    ctx.shadowBlur = 12 / scale;

    ctx.font = `${size}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, node.x, node.y);

    ctx.shadowBlur = 0;

    // Label Visibility Threshold (Appear sooner)
    if (globalScale > 0.75) {
      const fontSize = 12 / globalScale;
      ctx.font = `600 ${fontSize}px Inter`;
      const txt = (node.title || 'Memory').toLowerCase();
      const tw = ctx.measureText(txt).width;
      
      // Theme-responsive pill
      ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.95)';
      const rh = fontSize + 8;
      const ry = node.y + size/2 + 4;
      const r = 5;

      // Manual Rounded Rect (Safe for all browsers)
      ctx.beginPath();
      ctx.moveTo(node.x - tw/2 - 4 + r, ry);
      ctx.lineTo(node.x + tw/2 + 4 - r, ry);
      ctx.quadraticCurveTo(node.x + tw/2 + 4, ry, node.x + tw/2 + 4, ry + r);
      ctx.lineTo(node.x + tw/2 + 4, ry + rh - r);
      ctx.quadraticCurveTo(node.x + tw/2 + 4, ry + rh, node.x + tw/2 + 4 - r, ry + rh);
      ctx.lineTo(node.x - tw/2 - 4 + r, ry + rh);
      ctx.quadraticCurveTo(node.x - tw/2 - 4, ry + rh, node.x - tw/2 - 4, ry + rh - r);
      ctx.lineTo(node.x - tw/2 - 4, ry + r);
      ctx.quadraticCurveTo(node.x - tw/2 - 4, ry, node.x - tw/2 - 4 + r, ry);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillText(txt, node.x, ry + rh/2);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-180px)] bg-background rounded-3xl overflow-hidden border border-border shadow-inner mt-4 transition-colors duration-300"
    >
      {/* LEGEND (Top Left) */}
      <div className="absolute top-6 left-6 z-50 pointer-events-none select-none">
        <div className="bg-surface/80 backdrop-blur-xl p-4 rounded-3xl border border-border shadow-2xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-border pb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]"></div>
            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-text-primary">MindGraph Engine</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { l: 'Articles', i: '📄', c: 'bg-blue-500' },
              { l: 'YouTube', i: '🎬', c: 'bg-red-500' },
              { l: 'Docs', i: '📕', c: 'bg-orange-500' },
              { l: 'Thoughts', i: '🧠', c: 'bg-emerald-500' }
            ].map(item => (
              <div key={item.l} className="flex items-center space-x-3 group">
                <div className={`w-1.5 h-1.5 rounded-full ${item.c} shadow-sm`}></div>
                <span className="text-sm">{item.i}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-primary transition-colors">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GRAPH SEARCH (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
        <div className="relative group">
          <input 
            type="text"
            placeholder="Find in graph..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); focusNode(e.target.value); }}
            className="w-48 pl-10 pr-4 py-2 bg-surface/80 backdrop-blur-xl border border-border rounded-2xl text-xs text-text-primary focus:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xl"
          />
          <svg className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-text-tertiary group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* CONTROLS (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col items-center space-y-3">
        <div className="grid grid-cols-3 gap-1 p-2 bg-surface/80 backdrop-blur-xl border border-border rounded-3xl shadow-xl">
          <div />
          <button onClick={() => moveBy(0, 60)} className="p-2 text-text-secondary hover:text-primary"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg></button>
          <div />
          <button onClick={() => moveBy(60, 0)} className="p-2 text-text-secondary hover:text-primary"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
          <button onClick={() => { fgRef.current.centerAt(0,0,400); fgRef.current.zoomToFit(400,100); }} className="p-2 bg-primary/10 rounded-xl text-primary hover:bg-primary/20"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></button>
          <button onClick={() => moveBy(-60, 0)} className="p-2 text-text-secondary hover:text-primary"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
          <div />
          <button onClick={() => moveBy(0, -60)} className="p-2 text-text-secondary hover:text-primary"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
          <div />
        </div>

        <div className="flex flex-row bg-surface/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden">
          <button onClick={() => zoomBy(1.5)} className="p-3 text-text-secondary hover:text-primary border-r border-border active:bg-primary/5 transition-colors" title="Zoom In (Closer)"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg></button>
          <button onClick={() => zoomBy(0.7)} className="p-3 text-text-secondary hover:text-primary active:bg-primary/5 transition-colors" title="Zoom Out (Farther)"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg></button>
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        onNodeClick={handleNodeClick}
        linkColor={() => isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(59, 130, 246, 0.2)'}
        linkWidth={2}
        backgroundColor="transparent"
        enableZoomInteraction={false}
        enablePanInteraction={false}
        enableNodeDrag={false}
        minZoom={0.6}
        maxZoom={3}
        onEngineStop={handleEngineStop}
      />

      <MemoryDetailDrawer
        save={selectedSave}
        isOpen={!!selectedSave}
        onClose={() => {
          setSelectedSave(null);
          setSelectedSaveId(null);
        }}
        onDeleteSuccess={fetchGraphData}
      />

    </div>
  );
};

export default KnowledgeGraph;
