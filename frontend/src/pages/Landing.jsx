import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';
import { 
  Zap, 
  ArrowRight, 
  Search, 
  PlusCircle, 
  Cpu, 
  Network,
  Command,
  Activity,
  User,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const fgRef = useRef();
  
  // Fake graph data for background attraction
  const [graphData] = useState(() => {
    const nodes = [
      { id: 'me', name: 'Identity', color: '#3B82F6', size: 12 },
      { id: 'ai', name: 'AI Models', color: '#06B6D4' },
      { id: 'ideas', name: 'Research Ideas', color: '#10B981' },
      { id: 'work', name: 'Work Project', color: '#8B5CF6' },
      { id: 'life', name: 'Life Vision', color: '#F59E0B' },
      { id: 'coding', name: 'Code Base', color: '#EC4899' },
      { id: 'notes', name: 'Second Brain', color: '#3B82F6' },
      { id: 'sync', name: 'Real-time Sync', color: '#06B6D4' }
    ];
    
    const links = [
      { source: 'me', target: 'ai' },
      { source: 'me', target: 'ideas' },
      { source: 'me', target: 'work' },
      { source: 'ai', target: 'coding' },
      { source: 'ideas', target: 'notes' },
      { source: 'work', target: 'life' },
      { source: 'notes', target: 'sync' }
    ];

    // Add extra decorative nodes
    for (let i = 0; i < 20; i++) {
        const id = `node-${i}`;
        nodes.push({ id, name: '', size: 3, color: '#94A3B8' });
        links.push({ source: nodes[Math.floor(Math.random() * 8)].id, target: id });
    }

    return { nodes, links };
  });

  useEffect(() => {
    if (fgRef.current) {
      // Use the component's force method for charge, which is stable
      fgRef.current.d3Force('charge').strength(-200);
    }
  }, []);

  const stats = [
    { label: 'Latency', val: '12ms', icon: <Zap className="w-3 h-3" /> },
    { label: 'Uptime', val: '99.9%', icon: <Activity className="w-3 h-3" /> },
    { label: 'Neural Nodes', val: '1.2M+', icon: <Network className="w-3 h-3" /> },
    { label: 'System', val: 'Active', icon: <Command className="w-3 h-3" /> }
  ];

  const features = [
    {
      title: 'Neural Discovery',
      desc: 'Semantically navigate your entire archive as a living, interconnected constellation of thoughts.',
      icon: <Network className="w-5 h-5 text-primary" />,
      tag: 'OS Core'
    },
    {
      title: 'Vision-First Engine',
      desc: 'Automated OCR and Image Captioning turn static screen-captures into searchable intelligence.',
      icon: <Cpu className="w-5 h-5 text-secondary" />,
      tag: 'Neural Logic'
    },
    {
       title: 'Contextual Siphoning',
       desc: 'Every link you touch or idea you record is automatically bridged to relevant historical memories.',
       icon: <Zap className="w-5 h-5 text-amber-500" />,
       tag: 'Active Sync'
    }
  ];

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} overflow-hidden transition-colors duration-500`}>
      
      {/* 1. INTERACTIVE NEURAL BACKGROUND (FULL SCREEN & DYNAMNIC) */}
      <div className="absolute inset-0 z-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 11 / globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size || 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = theme === 'dark' ? node.color : (node.color === '#94A3B8' ? '#CBD5E1' : node.color);
            ctx.fill();

            if (label) {
              ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
              ctx.fillText(label, node.x, node.y + (node.size || 5) + 14);
            }
          }}
          linkColor={() => theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
          linkWidth={1}
          nodeRelSize={6}
          enableNodeDrag={true}
          enableZoomInteraction={false}
          enablePanInteraction={true}
          cooldownTicks={Infinity}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.1}
          linkDirectionalParticles={3}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={() => '#60A5FA'}
          linkDirectionalParticleWidth={2.5}
        />
      </div>

      {/* 2. COMMAND HEADER NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-background/60 backdrop-blur-xl border border-border px-5 py-2.5 rounded-2xl shadow-xl">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base">M</div>
             <span className="font-bold tracking-tighter text-xl uppercase text-text-primary">MindGraph</span>
          </div>
          
          <div className="hidden md:flex items-center bg-background/40 backdrop-blur-xl border border-border rounded-2xl px-6 py-2.5 space-x-8 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
             {stats.map((s, i) => (
                <div key={i} className="flex items-center space-x-2">
                   <span className="text-primary">{s.icon}</span>
                   <span>{s.label}: {s.val}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            Terminal
          </button>
        </div>
      </nav>

      {/* 3. HERO CONTENT - WIDE & ACCESSIBLE */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-12 pt-32 pb-32 flex flex-col items-start text-left pointer-events-none">
        
        <div className="max-w-4xl">
           <div className="flex items-center space-x-3 mb-8">
              <span className="w-12 h-[1px] bg-primary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence OS v1.0</span>
           </div>

           <h1 className="text-6xl md:text-[108px] font-black mb-8 leading-[0.85] tracking-tight pointer-events-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
             Experience Your <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Total Memory.</span>
           </h1>

           <p className="max-w-2xl text-xl text-text-secondary mb-12 font-medium leading-relaxed pointer-events-auto opacity-70">
             MindGraph builds neural bridges between every link, image, and discovery you encounter. 
             Stop searching. Start discovering your personal knowledge constellation.
           </p>

           <button 
              onClick={() => navigate('/register')}
              className="group pointer-events-auto px-12 py-5 bg-text-primary text-background font-black rounded-2xl flex items-center shadow-2xl hover:scale-105 transition-all"
           >
              Sync Consciousness
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </main>

      {/* 4. HIGH-FIDELITY BENTO DASHBOARD */}
      <section className="relative z-10 w-full max-w-[1600px] mx-auto px-12 py-32 pointer-events-none">
          
          <div className="flex items-center space-x-6 mb-16">
             <h2 className="text-4xl font-black uppercase tracking-widest text-text-primary">System Core Features</h2>
             <div className="flex-1 h-[1px] bg-border opacity-30" />
             <div className="flex items-center space-x-2 text-[10px] font-black uppercase opacity-40">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>Monitoring Active</span>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
             
             {/* Main Hub Terminal Card */}
             <div className="p-1 rounded-[48px] bg-gradient-to-br from-border/50 to-transparent pointer-events-auto shadow-3xl">
                <div className="w-full h-full rounded-[44px] bg-background/80 backdrop-blur-3xl p-10 flex flex-col md:flex-row justify-between items-center border border-white/5 relative overflow-hidden group min-h-[450px]">
                   
                   <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                   
                   <div className="max-w-2xl relative z-10">
                      <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black uppercase text-primary mb-6 inline-block tracking-widest">Global Graph v1.0</div>
                      <h3 className="text-5xl md:text-6xl font-black mb-8 leading-tight">Visualizing 1.2M+ Memory Bridges</h3>
                      <p className="text-xl text-text-secondary leading-relaxed opacity-70 mb-8 max-w-xl">
                         Our proprietary force-directed engine maps your entire digital existence in real-time. No more folder trees. 
                         Just a floating consciousness of your own discoveries.
                      </p>

                   </div>

                   <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-full rounded-[32px] overflow-hidden border border-border/40 bg-surface/10 group-hover:scale-[1.01] transition-transform duration-700 min-h-[300px] flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-screen">
                         <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
                         <Network className="w-48 h-48 text-primary animate-pulse opacity-20" />
                      </div>
                   </div>
                </div>
             </div>

             {/* Horizontal Bento Row */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, i) => (
                   <div key={i} className="p-10 rounded-[40px] bg-background/60 backdrop-blur-xl border border-border shadow-2xl pointer-events-auto group relative overflow-hidden flex flex-col h-full">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-40 group-hover:scale-125 transition-all duration-500">
                         {f.icon}
                      </div>
                      <div className="px-3 py-1 bg-surface border border-border rounded-lg text-[9px] font-black uppercase tracking-widest mb-8 inline-block text-text-tertiary w-fit">
                         {f.tag}
                      </div>
                      <h4 className="text-3xl font-black mb-4 leading-tight">{f.title}</h4>
                      <p className="text-base text-text-secondary leading-relaxed opacity-70 mb-8 flex-1">{f.desc}</p>
                   </div>
                ))}
             </div>

          </div>
      </section>

      {/* 5. FOOTER HUD UPGRADE */}
      <footer className="relative z-10 border-t border-border bg-background/60 backdrop-blur-3xl px-12 py-16 pointer-events-auto">
         <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
            
            <div className="md:col-span-1">
               <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base">M</div>
                  <span className="font-black text-lg text-text-primary tracking-tighter">MindGraph</span>
               </div>
               <p className="normal-case opacity-50 font-medium tracking-normal text-sm leading-relaxed max-w-xs">
                  MindGraph is a next-generation Memory Operating System designed for the research-intensive future. 
               </p>
            </div>

            <div>
               <h5 className="text-text-secondary mb-8">Directives</h5>
               <ul className="space-y-4">
                  <li><a href="#" className="hover:text-primary transition-colors">Neural Sync</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Memory Core</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Visual Nodes</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terminal Access</a></li>
               </ul>
            </div>

            <div>
               <h5 className="text-text-secondary mb-8">Security</h5>
               <ul className="space-y-4">
                  <li><a href="#" className="hover:text-primary transition-colors">Neural Privacy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Data Sovereignty</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Encryption Logic</a></li>
               </ul>
            </div>

            <div>
               <h5 className="text-text-secondary mb-8">System Status</h5>
               <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
                     <span>Core Pulse</span>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
                  </div>
                  <div className="flex items-center space-x-6 opacity-40">
                     <span>v1.02a</span>
                     <span>© 2026 MG</span>
                  </div>
               </div>
            </div>

         </div>
      </footer>

      {/* CRT SCANLINE OVERLAY - FOR OS FEEL */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

    </div>
  );
};

export default Landing;
