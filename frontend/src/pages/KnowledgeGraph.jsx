import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { forceX, forceY, forceCollide } from 'd3-force';

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
          axios.get(`http://localhost:3000/api/saves/${id}`, { withCredentials: true })
            .then(({ data }) => setSelectedSave(data))
            .catch(err => console.error(err));
        }
      }
    } else {
      setSelectedSave(null);
    }
  }, [id, graphData.nodes]);

  // Physics Setup
  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    
    fg.d3Force('center', null);
    fg.d3Force('x', forceX(0).strength(0.12));
    fg.d3Force('y', forceY(0).strength(0.12));
    fg.d3Force('charge').strength(-150);
    fg.d3Force('collide', forceCollide(30));
    fg.d3Force('link').distance(70).strength(0.5);
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
      default: '#10B981' 
    };

    const color = colors[node.type] || colors.default;
    const baseSize = 6;
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

    // 2. Draw Main Orb
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isSelected || isTagged ? (isTagged ? 25 : 15) : 5;
    ctx.fill();
    ctx.shadowBlur = 0;

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
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-140px)] bg-background rounded-3xl overflow-hidden border border-border mt-4 group"
    >
      {/* Search Header Overlay */}
      <div className="absolute top-6 left-6 z-50 transition-all duration-500">
        <div className="bg-surface/80 backdrop-blur-2xl p-4 rounded-[2rem] border border-border shadow-2xl flex items-center space-x-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-primary/10 text-primary">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-text-primary">
              Knowledge Graph
            </h1>
            <p className="text-[10px] text-text-tertiary font-bold tracking-tight">Active Synthesis: {graphData.nodes.length} Memories</p>
          </div>
        </div>
      </div>

      {/* Tag Discovery Bar Removed for compact UI */}

      {/* Control Buttons (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-50 flex space-x-2">
        <button 
          onClick={fetchGraphData}
          className="p-3 bg-surface/80 backdrop-blur-md border border-border rounded-2xl text-text-secondary hover:text-primary transition-all shadow-lg hover:shadow-primary/20"
          title="Refresh Graph"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button 
          onClick={() => { fgRef.current.zoomToFit(600); }}
          className="p-3 bg-surface/80 backdrop-blur-md border border-border rounded-2xl text-text-secondary hover:text-primary transition-all shadow-lg hover:shadow-primary/20"
          title="Recenter"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

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
        cooldownTicks={100}
        onEngineStop={() => { if (!id && !selectedTag) fgRef.current.zoomToFit(800, 100); }}
      />

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
  );
};

export default KnowledgeGraph;
