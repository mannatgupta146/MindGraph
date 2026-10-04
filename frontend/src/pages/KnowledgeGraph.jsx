import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../api/config';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { forceX, forceY, forceCollide } from 'd3-force';
import { useStore } from '../store/useStore';

// Pre-compile SVG paths outside of component for blazing 60FPS render performance
const NODE_ICONS = {
  youtube: new Path2D('M23.498 6.186c-.273-1.011-1.04-1.802-2.028-2.074C19.694 3.827 12 3.827 12 3.827s-7.694 0-9.47.285C1.542 4.384.775 5.175.502 6.186.225 7.99.225 12 .225 12s0 4.01.277 5.814c.273 1.011 1.04 1.802 2.028 2.074 1.776.285 9.47.285 9.47.285s7.694 0 9.47-.285c.988-.272 1.755-1.063 2.028-2.074.277-1.804.277-5.814.277-5.814s0-4.01-.277-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'), // YouTube logo
  pdf: new Path2D('M23.63 15.3c-.71-.745-2.166-1.17-4.224-1.17-1.1 0-2.377.106-3.761.354a19.443 19.443 0 0 1-2.307-2.661c-.532-.71-.994-1.49-1.42-2.236.817-2.484 1.207-4.507 1.207-5.962 0-1.632-.603-3.336-2.342-3.336-.532 0-1.065.32-1.349.781-.78 1.384-.425 4.4.923 7.381a60.277 60.277 0 0 1-2.66 6.958c-3.233 1.17-5.358 2.596-5.646 3.857-.106.507.054 1.003.426 1.384.408.424.887.585 1.348.585 1.42 0 3.08-1.7 4.996-5.11a46.11 46.11 0 0 1 4.32-1.065c.958.958 1.843 1.682 2.691 2.192 2.414 1.453 4.115.958 4.896.426.674-.462 1.022-1.278.887-2.379zM2.946 20.36c.426-.958 1.917-2.093 3.58-2.946-1.065 1.933-2.022 2.946-3.58 2.946zM10.346 1.74c.639 0 .887.958.887 2.13 0 1.491-.355 2.84-.746 4.08-.674-1.775-1.03-3.535-.746-5.13.124-.71.355-1.08.605-1.08zm-.32 12.072c.532-1.065 1.065-2.272 1.526-3.585.497.887 1.065 1.738 1.668 2.555-1.03.248-2.13.639-3.194 1.03zm11.71 2.555c-.497.355-1.81.497-3.37-.461-.533-.355-1.066-.746-1.597-1.172 3.088-.355 4.968.07 5.04.532.106.39.07.887-.073 1.1z'), // Adobe Acrobat
  tweet: new Path2D('M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'), // X Logo
  // Outline icons (drawn with stroke, identical to landing page cards)
  article: new Path2D('M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4M2 6h4M2 10h4M2 14h4M2 18h4M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'), // Notebook pen
  image: new Path2D('M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM11 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21'), // Photo
  default: new Path2D('M13 10V3L4 14h7v7l9-11h-7z') // Lightning Bolt
};
const STROKE_ICONS = new Set(['article', 'image']);

const KnowledgeGraph = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const graphData = useStore((state) => state.graphData);
  const loading = useStore((state) => state.loadingGraph);
  const fetchGraphData = useStore((state) => state.fetchGraphData);

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
          api.get(`/saves/${id}`)
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
      youtube: '#EF4444', 
      pdf: '#BE123C', 
      tweet: '#000000', 
      article: '#3B82F6',
      image: '#EAB308',
      default: '#10B981' 
    };

    const color = colors[node.type] || colors.default;
    // Black glow is invisible on dark canvas, so X nodes glow white/silver instead
    const glowColor = node.type === 'tweet' ? (isDark ? '#E4E4E7' : '#18181B') : color;
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
    gradient.addColorStop(0, `${glowColor}${isSelected || isTagged || isHighlighted ? '88' : '33'}`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 2. Draw Solid Background Badge
    ctx.beginPath();
    ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isSelected || isTagged ? (isTagged ? 25 : 15) : 5;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Thin ring so the black X badge stays visible on dark backgrounds
    if (node.type === 'tweet') {
      ctx.lineWidth = isHighlighted || isSelected ? 2 : 1.2;
      ctx.strokeStyle = isHighlighted || isSelected ? (isDark ? '#FFFFFF' : '#000000') : (isDark ? '#52525B' : '#18181B');
      ctx.stroke();
    }

    // 3. Draw Vector Icon inside the Badge
    ctx.save();
    // Set scale relative to 24x24 standard viewport 
    const iconScale = (size * 1.5) / 24; 
    ctx.translate(node.x - (12 * iconScale), node.y - (12 * iconScale));
    ctx.scale(iconScale, iconScale);
    const iconPath = NODE_ICONS[node.type] || NODE_ICONS.default;
    if (STROKE_ICONS.has(node.type)) {
      // Shrink slightly so the stroke stays inside the badge
      ctx.translate(12, 12);
      ctx.scale(0.8, 0.8);
      ctx.translate(-12, -12);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(iconPath);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fill(iconPath);
    }
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
    <div className="h-[calc(100vh-140px)] min-h-100 flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-700">
      {/* Universal Header */}
      <div className="relative pl-5 py-1 md:py-2 shrink-0">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-primary/80 to-primary/20 rounded-full"></div>
        <div className="flex items-center space-x-2 text-text-tertiary mb-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Graph</span>
        </div>
        <p className="hidden md:block text-text-secondary text-sm md:text-base leading-relaxed max-w-3xl">
          A visual representation of your connected saved items and topics.
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
          <h2 className="text-xl font-bold text-text-primary mb-3 tracking-tight">Graph is Empty</h2>
          <p className="text-text-secondary max-w-sm leading-relaxed mb-8">
            Your graph is currently empty. Save items and notes to see them connected here.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            Add First Item
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
