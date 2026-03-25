import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { forceX, forceY } from 'd3-force';

const KnowledgeGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedSaveId, setSelectedSaveId] = useState(null);
  const [selectedSave, setSelectedSave] = useState(null);
  const fgRef = useRef();

  const fetchGraphData = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/saves/graph', {
        withCredentials: true
      });
      setGraphData(data);
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      // Strong centering forces on both axes
      fgRef.current.d3Force('x', forceX(0).strength(0.1));
      fgRef.current.d3Force('y', forceY(0).strength(0.1));
      
      // Repulsion and link distance
      fgRef.current.d3Force('charge').strength(-150);
      fgRef.current.d3Force('link').distance(50);
    }
  }, [graphData]);

  const handleEngineStop = useCallback(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.zoomToFit(400, 150);
    }
  }, [graphData]);

  // Fetch full details when a node is clicked
  useEffect(() => {
    if (selectedSaveId) {
      const fetchSave = async () => {
        try {
          const { data } = await axios.get(`http://localhost:3000/api/saves`, { withCredentials: true });
          const found = data.find(s => s._id === selectedSaveId);
          setSelectedSave(found);
        } catch (error) {
          console.error('Failed to fetch save details:', error);
        }
      };
      fetchSave();
    }
  }, [selectedSaveId]);

  const handleNodeClick = useCallback(node => {
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    fgRef.current.centerAt(node.x, node.y, 1000);
    fgRef.current.zoom(2, 1000);
    
    setSelectedSaveId(node.id);
  }, [fgRef]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.title;
    const typeIcons = {
      tweet: '🐦',
      pdf: '📕',
      youtube: '🎬',
      image: '🖼️',
      default: '🧠'
    };

    const icon = typeIcons[node.type] || typeIcons.default;
    
    // Type-based colors
    const colors = {
      article: '#3B82F6', // Blue
      tweet: '#60A5FA',   // Light Blue
      pdf: '#F87171',     // Soft Red
      youtube: '#EF4444', // YouTube Red
      image: '#A855F7',   // Purple
      default: '#10B981'  // Green
    };
    
    const color = colors[node.type] || colors.default;

    // Node Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 15 / globalScale;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Reset shadow for text
    ctx.shadowBlur = 0;

    // Draw Icon inside/near node
    ctx.font = `${10/globalScale}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(icon, node.x, node.y);

    // Text Label (always show if zoomed in, or show small if zoomed out)
    if (globalScale > 1.2) {
      const fontSize = 10/globalScale;
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 10, ...bckgDimensions);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(label, node.x, node.y + 10 + bckgDimensions[1]/2);
    }
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="relative w-full h-[calc(100vh-200px)] bg-background rounded-3xl overflow-hidden border border-border mt-4 shadow-inner shadow-black/40">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {/* Legend / Info */}
      <div className="absolute top-6 left-6 z-10 bg-surface/40 backdrop-blur-xl p-5 rounded-3xl border border-white/5 shadow-2xl space-y-4 pointer-events-none">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">MindGraph Engine</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm">📄</span>
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Articles</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm">🎬</span>
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">YouTube</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm">📕</span>
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Documents</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm">🧠</span>
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Thoughts</span>
          </div>
        </div>
        <div className="pt-2 border-t border-white/5">
          <p className="text-[9px] text-text-tertiary leading-relaxed">Nodes connect via shared semantics & tags</p>
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="title"
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        linkColor={() => 'rgba(255, 255, 255, 0.08)'}
        linkWidth={link => link.value * 0.5}
        backgroundColor="rgba(0,0,0,0)"
        minZoom={0.5}
        maxZoom={5}
        onEngineStop={handleEngineStop}
        cooldownTicks={150}
      />

      {/* Detail Overlay */}
      <MemoryDetailDrawer 
        save={selectedSave}
        isOpen={!!selectedSave}
        onClose={() => {
          setSelectedSave(null)
          setSelectedSaveId(null)
        }}
        onDeleteSuccess={fetchGraphData}
      />
      
    </div>
  );
};

export default KnowledgeGraph;
