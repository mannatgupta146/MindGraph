import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { forceX, forceY, forceCollide } from 'd3-force';

// Pre-compile SVG paths outside of component for blazing 60FPS render performance
const NODE_ICONS = {
  youtube: new Path2D('M8 5v14l11-7z'), // Play
  pdf: new Path2D('M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm6 1.5L18.5 10H12V3.5z'), // Document
  tweet: new Path2D('M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z'), // Bird
  article: new Path2D('M4 6h16v2H4zm0 5h16v2H4zm0 5h8v2H4z'), // Text lines
  image: new Path2D('M12 11.5A2.5 2.5 0 0 1 9.5 14 2.5 2.5 0 0 1 7 11.5 2.5 2.5 0 0 1 9.5 9a2.5 2.5 0 0 1 2.5 2.5M19 4h-3.17L14 2h-4L8.17 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9.5 15.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z'), // Camera
  default: new Path2D('M13 10V3L4 14h7v7l9-11h-7z') // Lightning Bolt
};

const KnowledgeGraph = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedSave, setSelectedSave] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const fgRef = useRef();
  const containerRef = useRef();

  // Responsive dimensions using ResizeObserver (guarantees perfect fit even when sidebars toggle)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleZoomIn = () => {
    if (!fgRef.current) return;
    fgRef.current.zoom(fgRef.current.zoom() * 1.3, 300);
  };

  const handleZoomOut = () => {
    if (!fgRef.current) return;
    fgRef.current.zoom(fgRef.current.zoom() / 1.3, 300);
  };

  // Fetch data
  const fetchGraphData = async () => {
    try {
      const { data } = await axios.get('https://mindgraph.onrender.com/api/saves/graph', { withCredentials: true });
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // Fetch data on initial mount
  useEffect(() => {
    fetchGraphData();
  }, []);
  // Master Pillars removed for Compact UI.
  // Graph focus is now completely organic.

  // Sync selected node from URL
  useEffect(() => {
    if (id && graphData.nodes.length > 0) {
      const node = graphData.nodes.find(n => n.id === id);
      if (node && fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(2.2, 800);
        
        if (!selectedSave || selectedSave._id !== id) {
          axios.get(`https://mindgraph.onrender.com/api/saves/${id}`, { withCredentials: true })
            .then(({ data }) => setSelectedSave(data))
            .catch(err => console.error(err));
        }
      }
    } else {
      setSelectedSave(null);
    }
  }, [id, graphData.nodes]);

  // Real Vector-based D3 Physics Setup
  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    
    // Disable static centering to allow free-floating clusters
    fg.d3Force('center', null);
    
    // Stronger gravity to keep the constellation from exploding too far into deep space
    fg.d3Force('x', forceX(0).strength(0.15));
    fg.d3Force('y', forceY(0).strength(0.15));
    
    // Balanced repulsion so they maintain distinct semantic clusters without flying away
    fg.d3Force('charge').strength(-250); 
    
    // Prevent nodes from overlapping visually
    fg.d3Force('collide', forceCollide(35));
    
    // The core magic: Use proper vector cosine similarity to control distance.
    const linkForce = fg.d3Force('link');
    if (linkForce) {
      linkForce
        .distance(link => {
          const similarity = link.sim || 0.6; // fallback
          const maxDistance = 700; // maximum repelling distance for weak links
          return (1 - similarity) * maxDistance; 
        })
        .strength(link => {
          // Stronger mathematical pull towards identical vectors
          return link.sim ? link.sim * 1.5 : 0.5;
        });
    }

  }, [graphData]);

  // Handle Focus Mode: Recenter on Cluster
  const handleTagClick = (tag) => {
    const isClearing = selectedTag === tag;
    const newTag = isClearing ? null : tag;
    setSelectedTag(newTag);

    if (newTag) {
      const taggedNodes = graphData.nodes.filter(n => n.tags?.includes(newTag));
      if (taggedNodes.length > 0) {
        const avgX = taggedNodes.reduce((sum, n) => sum + n.x, 0) / taggedNodes.length;
        const avgY = taggedNodes.reduce((sum, n) => sum + n.y, 0) / taggedNodes.length;
        fgRef.current.centerAt(avgX, avgY, 1000);
        fgRef.current.zoom(1.8, 1000);
      }
    } else {
      fgRef.current.zoomToFit(800, 100);
    }
  };

  // Discovery Node Painter
  const paintNode = useCallback((node, ctx, globalScale) => {
    // Failsafe: if the physics engine hasn't assigned proper coordinates yet, do not attempt to draw (prevents canvas crashes)
    if (typeof node.x !== 'number' || typeof node.y !== 'number') return;

    const isSelected = id === node.id;
    const isTagged = selectedTag && node.tags?.includes(selectedTag);
    const isDimmed = selectedTag && !isTagged;

    const isHighlighted = hoverNode === node || (hoverNode && graphData.links.some(l => 
      (l.source.id === node.id && l.target.id === hoverNode.id) || 
      (l.target.id === node.id && l.source.id === hoverNode.id)
    ));

    const colors = { 
      youtube: '#FF0000', 
      pdf: '#F87171', 
      tweet: '#1DA1F2', 
      article: '#3B82F6',
      image: '#10B981',
      default: '#10B981' 
    };

    const color = colors[node.type] || colors.default;
    const baseSize = 8.0; // Reduced from 4.5 to keep nodes elegant
    let size = isSelected ? baseSize * 1.5 : (isHighlighted ? baseSize * 1.2 : baseSize);
    
    if (isTagged) {
      const pulse = 1 + Math.sin(Date.now() / 400) * 0.15;
      size *= pulse;
    }

    const opacity = isDimmed ? 0.15 : 1;

    ctx.globalAlpha = opacity;

    // 1. Draw Outer Glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, size * (isTagged ? 4 : 2.5), 0, 2 * Math.PI, false);
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * (isTagged ? 4 : 2.5));
    gradient.addColorStop(0, `${color}${isSelected || isTagged ? '88' : '33'}`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 2. Draw Solid Background Badge
    ctx.beginPath();
    ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isSelected || isTagged ? (isTagged ? 25 : 15) : 5;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3. Draw Vector Icon inside the Badge
    ctx.save();
    // Set scale relative to 24x24 standard viewport 
    const iconScale = (size * 1.5) / 24; 
    ctx.translate(node.x - (12 * iconScale), node.y - (12 * iconScale));
    ctx.scale(iconScale, iconScale);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill(NODE_ICONS[node.type] || NODE_ICONS.default);
    ctx.restore();

    // 3. Draw Label
    if (globalScale > 1.2 || isHighlighted || isSelected || isTagged) {
      const fontSize = 11 / globalScale;
      ctx.font = `${isHighlighted || isSelected || isTagged ? '900' : '500'} ${fontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isDark ? `rgba(255,255,255,${isDimmed ? 0.2 : 0.95})` : `rgba(15,23,42,${isDimmed ? 0.2 : 0.95})`;
      
      const label = node.title || 'Untitled';
      const truncatedLabel = label.length > 22 ? label.slice(0, 19) + '...' : label;
      ctx.fillText(truncatedLabel, node.x, node.y + size + 5);
    }
    
    ctx.globalAlpha = 1;
  }, [id, hoverNode, isDark, graphData.links, selectedTag]);

  return (
    <div className="h-[calc(100vh-140px)] min-h-[400px] flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-700">
      {/* Universal Header */}
      <div className="relative pl-5 py-1 md:py-2 shrink-0">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full"></div>
        <div className="flex items-center space-x-2 text-text-tertiary mb-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">Semantic Constellation</span>
        </div>
        <p className="hidden md:block text-text-secondary text-sm md:text-base leading-relaxed max-w-3xl">
          A living, breathing visual representation of your connected memories.
        </p>
      </div>

      {/* Graph Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 bg-background rounded-2xl md:rounded-3xl overflow-hidden border border-border group"
      >

      {/* Empty State Overlay */}
      {!loading && graphData.nodes.length === 0 && (
        <div className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
          <div className="w-20 h-20 mb-6 bg-surface border border-border rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-3 tracking-tight">Cosmic Void</h2>
          <p className="text-text-secondary max-w-sm leading-relaxed mb-8">
            Your graph is currently empty. Capture articles, tweets, or thoughts and watch the AI weave them into a living constellation.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            Initialize Memory
          </button>
        </div>
      )}

      {/* Control Buttons (Bottom Left) */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-50 flex space-x-2">
        <button 
          onClick={fetchGraphData}
          className="p-2.5 md:p-3 bg-surface/80 backdrop-blur-md border border-border rounded-xl md:rounded-2xl text-text-secondary hover:text-primary transition-all shadow-lg hover:shadow-primary/20"
          title="Refresh Graph"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button 
          onClick={() => { 
            const xs = graphData.nodes.map(n => n.x || 0);
            const width = Math.max(...xs) - Math.min(...xs);
            if (width < 400) {
              fgRef.current.centerAt(0, 0, 600);
              fgRef.current.zoom(1.2, 600);
            } else {
              fgRef.current.zoomToFit(600, 100); 
            }
          }}
          className="p-2.5 md:p-3 bg-surface/80 backdrop-blur-md border border-border rounded-xl md:rounded-2xl text-text-secondary hover:text-primary transition-all shadow-lg hover:shadow-primary/20"
          title="Recenter"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      {/* Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col space-y-2">
        <button 
          onClick={handleZoomIn}
          className="p-2.5 md:p-3 bg-surface/80 backdrop-blur-md border border-border rounded-xl md:rounded-2xl text-text-secondary hover:text-primary transition-all shadow-lg hover:shadow-primary/20"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2.5 md:p-3 bg-surface/80 backdrop-blur-md border border-border rounded-xl md:rounded-2xl text-text-secondary hover:text-primary transition-all shadow-lg hover:shadow-primary/20"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      <div 
        className="absolute inset-0 rounded-3xl overflow-hidden z-0"
        style={{ clipPath: 'inset(0 round 1.5rem)' }}
      >
        <ForceGraph2D
          ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={paintNode}
        onNodeClick={node => navigate(`/graph/${node.id}`)}
        onNodeHover={setHoverNode}
        linkWidth={link => {
          if (selectedTag) {
            const sourceMatch = link.source.tags?.includes(selectedTag);
            const targetMatch = link.target.tags?.includes(selectedTag);
            return sourceMatch && targetMatch ? 4 : 0.5;
          }
          return link.type === 'tag' ? 2 : 1;
        }}
        linkColor={link => {
          if (selectedTag) {
            const sourceMatch = link.source.tags?.includes(selectedTag);
            const targetMatch = link.target.tags?.includes(selectedTag);
            return sourceMatch && targetMatch ? '#3B82F6' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)');
          }
          if (hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id)) return '#3B82F6';
          return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
        }}
        linkDirectionalParticles={link => {
          if (selectedTag) {
             const sourceMatch = link.source.tags?.includes(selectedTag);
             const targetMatch = link.target.tags?.includes(selectedTag);
             return sourceMatch && targetMatch ? 6 : 0;
          }
          return (hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id)) ? 4 : 0;
        }}
        linkDirectionalParticleSpeed={0.015}
        linkDirectionalParticleWidth={3}
        backgroundColor="transparent"
        minZoom={0.5}
        maxZoom={1.3}
        onEngineStop={() => {
          if (graphData.nodes.length > 0 && fgRef.current && !id && !selectedTag) {
             const xs = graphData.nodes.map(n => n.x || 0);
             const width = Math.max(...xs) - Math.min(...xs);
             
             // If the constellation is tiny, strictly enforce an elegant fixed zoom so nodes aren't massively blown up
             if (width < 400) {
                fgRef.current.centerAt(0, 0, 800);
                fgRef.current.zoom(1.2, 800);
             } else {
                fgRef.current.zoomToFit(800, 150);
             }
          }
        }}
      />
      </div>

      <MemoryDetailDrawer
        save={selectedSave}
        saveId={id}
        isOpen={!!id}
        onClose={() => navigate('/graph')}
        onDeleteSuccess={() => {
          fetchGraphData();
          navigate('/graph');
        }}
        onUpdateSuccess={fetchGraphData}
      />
    </div>
    </div>
  );
};

export default KnowledgeGraph;
