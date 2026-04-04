import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
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
  Sparkles,
  Shield,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const fgRef = useRef();
  const [hoverStage, setHoverStage] = useState(0);

  const handleCTAClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };
  
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
      icon: <Network className="w-5 h-5 text-blue-500" />,
      tag: 'OS Core',
      color: 'blue'
    },
    {
      title: 'Vision-First Engine',
      desc: 'Automated OCR and Image Captioning turn static screen-captures into searchable intelligence.',
      icon: <Cpu className="w-5 h-5 text-cyan-500" />,
      tag: 'Neural Logic',
      color: 'cyan'
    },
    {
       title: 'Contextual Siphoning',
       desc: 'Every link you touch or idea you record is automatically bridged to relevant historical memories.',
       icon: <Zap className="w-5 h-5 text-amber-500" />,
       tag: 'Active Sync',
       color: 'amber'
    }
  ];

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} overflow-x-hidden transition-colors duration-500`}>
      
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
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center relative">
          
          {/* LEFT: Logo */}
          <div className="flex items-center space-x-3 bg-background/60 backdrop-blur-xl border border-border px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl shadow-xl pointer-events-auto">
             <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm md:text-base">M</div>
             <span className="font-bold tracking-tighter text-lg md:text-xl uppercase text-text-primary">MindGraph</span>
          </div>
          
          {/* CENTER: Stats HUD */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center bg-background/40 backdrop-blur-xl border border-border rounded-2xl px-6 py-2.5 space-x-8 text-[9px] font-black uppercase tracking-[0.2em] opacity-60 pointer-events-auto">
             {stats.map((s, i) => (
                <div key={i} className="flex items-center space-x-2">
                   <span className="text-primary">{s.icon}</span>
                   <span>{s.label}: {s.val}</span>
                </div>
             ))}
          </div>

          {/* RIGHT: Theme + Auth HUD */}
          <div className="flex items-center space-x-3 pointer-events-auto">
            <ThemeToggle />
          </div>

        </div>
      </nav>

      {/* 3. HERO CONTENT - WIDE & ACCESSIBLE */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-12 md:pt-30 pb-20 md:pb-40 flex flex-col items-start text-left pointer-events-none">
        
        <div className="max-w-4xl">
           <div className="flex items-center space-x-3 mb-4">
              <span className="w-12 h-[1px] bg-primary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">MindGraph v1.0</span>
           </div>

           <h1 className="text-4xl sm:text-6xl md:text-[108px] font-black mb-6 md:mb-8 leading-[0.95] md:leading-[0.85] tracking-tight pointer-events-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
             Experience Your <br className="hidden md:block"/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Total Memory.</span>
           </h1>

           <p className="max-w-2xl text-lg md:text-xl text-text-secondary mb-10 md:mb-12 font-medium leading-relaxed pointer-events-auto opacity-70">
             MindGraph builds neural bridges between every link, image, and discovery you encounter. 
             Stop searching. Start discovering your personal knowledge constellation.
           </p>

           <button 
              onClick={handleCTAClick}
              className="group pointer-events-auto px-10 md:px-12 py-4 md:py-5 bg-text-primary text-background font-black rounded-xl md:rounded-2xl flex items-center shadow-2xl hover:scale-105 transition-all text-sm md:text-base"
           >
              {user ? 'Resume Brain Sync' : 'Sync Consciousness'}
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </main>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/20 to-transparent" />

      {/* 3.1 ENAGAGING 'HOW IT WORKS' - NEURAL LIFECYCLE */}
      <section className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-20 md:py-40 pointer-events-auto">
         <div className="text-center w-full max-w-[1400px] mx-auto">
            <div className="flex items-center justify-center space-x-6 mb-12 animate-fade-in opacity-40">
               <div className="w-12 h-[1px] bg-primary/20"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary whitespace-nowrap">Neural Lifecycle</span>
               <div className="w-12 h-[1px] bg-primary/20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
               
               {/* Stage 1: SIPHONING */}
               <div 
                  className="relative group perspective-[1000px]"
                  onMouseEnter={() => setHoverStage(1)}
                  onMouseLeave={() => setHoverStage(0)}
               >
                  <div className="p-6 md:p-8 rounded-[32px] bg-background/40 backdrop-blur-3xl border border-border/50 shadow-3xl flex flex-col items-center h-full transform transition-all duration-700 group-hover:scale-[1.02] group-hover:border-primary/50 border-t-primary/20 overflow-hidden will-change-transform">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] group-hover:bg-primary/20 transition-all pointer-events-none" />
                     
                     {/* SIPHON ANIMATION BOX */}
                     <div className="w-full aspect-video rounded-[24px] bg-surface/20 border border-border/30 mb-6 relative overflow-hidden flex items-center justify-center pointer-events-none">
                        {/* Neural Core */}
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] z-20 animate-pulse relative">
                           <Cpu className="w-8 h-8 text-white" />
                        </div>

                        {/* Siphoning Particles - Framer Motion */}
                        <motion.div 
                           className="absolute z-10"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: hoverStage === 1 ? 1 : 0 }}
                        >
                           {[Zap, Search, Network, Sparkles].map((Icon, idx) => (
                              <motion.div
                                 key={idx}
                                 className="absolute"
                                 animate={hoverStage === 1 ? {
                                    x: [idx % 2 === 0 ? -150 : 150, 0],
                                    y: [idx < 2 ? -150 : 150, 0],
                                    scale: [0.5, 1],
                                    opacity: [0, 1, 0]
                                 } : { opacity: 0 }}
                                 transition={{
                                    duration: 3,
                                    repeat: hoverStage === 1 ? Infinity : 0,
                                    delay: idx * 0.5,
                                    ease: "circOut"
                                 }}
                              >
                                 <Icon className="w-6 h-6 text-primary/40" />
                              </motion.div>
                           ))}
                        </motion.div>

                        {/* Wave Propagation */}
                        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent)] opacity-20 pointer-events-none ${hoverStage === 1 ? 'animate-ping' : ''}`} />
                     </div>

                     <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-black uppercase text-primary mb-5 inline-block tracking-[0.2em] w-fit">Directive 01: Siphon</div>
                     <h4 className="text-2xl font-black mb-3 leading-tight tracking-tight">Input Intelligence</h4>
                     <p className="text-[14px] text-text-secondary leading-relaxed opacity-80 font-medium">
                        Screens, links, and documents are automatically capture-indexed into raw neural data pools. 
                     </p>
                  </div>
               </div>

               {/* Stage 2: BRIDGING */}
               <div 
                  className="relative group"
                  onMouseEnter={() => setHoverStage(2)}
                  onMouseLeave={() => setHoverStage(0)}
               >
                  <div className="p-6 md:p-8 rounded-[32px] bg-background/40 backdrop-blur-3xl border border-border/50 shadow-3xl flex flex-col items-center h-full transform transition-all duration-700 group-hover:scale-[1.02] group-hover:border-secondary/50 border-t-secondary/20 overflow-hidden will-change-transform">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[60px] group-hover:bg-secondary/20 transition-all pointer-events-none" />
                     
                     {/* BRIDGING ANIMATION BOX */}
                     <div className="w-full aspect-video rounded-[24px] bg-surface/20 border border-border/30 mb-6 relative overflow-hidden flex items-center justify-center pointer-events-none">
                        <svg className="absolute inset-0 w-full h-full p-12">
                           {/* Central Node */}
                           <circle cx="50%" cy="50%" r="8" className="fill-secondary shadow-lg" />
                           
                           {/* Peripheral Nodes & Animated Bridges */}
                           {[
                              { x: '20%', y: '20%' },
                              { x: '80%', y: '30%' },
                              { x: '70%', y: '80%' },
                              { x: '25%', y: '75%' }
                           ].map((pos, idx) => (
                              <React.Fragment key={idx}>
                                 <motion.circle 
                                    cx={pos.x} cy={pos.y} r="4" 
                                    className="fill-secondary/40"
                                    animate={hoverStage === 2 ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.2 }}
                                    transition={{ duration: 2, repeat: hoverStage === 2 ? Infinity : 0, delay: idx * 0.4 }}
                                 />
                                 <motion.line
                                    x1="50%" y1="50%" x2={pos.x} y2={pos.y}
                                    className="stroke-secondary/20 stroke-1"
                                    initial={{ pathLength: 0 }}
                                    animate={hoverStage === 2 ? { pathLength: [0, 1, 0] } : { pathLength: 0 }}
                                    transition={{ duration: 3, repeat: hoverStage === 2 ? Infinity : 0, delay: idx * 0.5 }}
                                 />
                              </React.Fragment>
                           ))}
                        </svg>
                        <div className={`relative z-10 w-20 h-20 rounded-full border border-secondary/30 flex items-center justify-center ${hoverStage === 2 ? 'animate-spin-slow' : ''}`}>
                           <Network className="w-8 h-8 text-secondary" />
                        </div>
                     </div>

                     <div className="px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-lg text-[10px] font-black uppercase text-secondary mb-5 inline-block tracking-[0.2em] w-fit">Directive 02: Bridge</div>
                     <h4 className="text-2xl font-black mb-3 leading-tight tracking-tight">Neural Coupling</h4>
                     <p className="text-[14px] text-text-secondary leading-relaxed opacity-80 font-medium">
                        AI builds automated context bridges between your new discoveries and your historical memories. 
                     </p>
                  </div>
               </div>

               {/* Stage 3: DISCOVERY */}
               <div 
                  className="relative group"
                  onMouseEnter={() => setHoverStage(3)}
                  onMouseLeave={() => setHoverStage(0)}
               >
                  <div className="p-6 md:p-8 rounded-[32px] bg-background/40 backdrop-blur-3xl border border-border/50 shadow-3xl flex flex-col items-center h-full transform transition-all duration-700 group-hover:scale-[1.02] group-hover:border-amber-500/50 border-t-amber-500/20 overflow-hidden will-change-transform">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                     
                     {/* DISCOVERY ANIMATION BOX */}
                     <div className="w-full aspect-video rounded-[24px] bg-surface/20 border border-border/30 mb-6 relative overflow-hidden flex items-center justify-center pointer-events-none">
                        {/* Pulsing Cluster */}
                        <div className="relative">
                           <motion.div 
                              className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center z-10 relative"
                              animate={hoverStage === 3 ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                              transition={{ duration: 2, repeat: hoverStage === 3 ? Infinity : 0 }}
                           >
                              <Sparkles className="w-8 h-8 text-amber-500" />
                           </motion.div>
                           
                           {/* Mini-Nodes orbiting */}
                           {[...Array(6)].map((_, i) => (
                              <motion.div
                                 key={i}
                                 className="absolute w-2 h-2 rounded-full bg-amber-400/60"
                                 animate={hoverStage === 3 ? {
                                    x: [Math.cos(i * 60 * Math.PI/180) * 40, Math.cos(i * 60 * Math.PI/180) * 80, Math.cos(i * 60 * Math.PI/180) * 40],
                                    y: [Math.sin(i * 60 * Math.PI/180) * 40, Math.sin(i * 60 * Math.PI/180) * 80, Math.sin(i * 60 * Math.PI/180) * 40],
                                    opacity: [0.3, 1, 0.3]
                                 } : {
                                    x: Math.cos(i * 60 * Math.PI/180) * 40,
                                    y: Math.sin(i * 60 * Math.PI/180) * 40,
                                    opacity: 0.3
                                 }}
                                 transition={{ duration: 3, repeat: hoverStage === 3 ? Infinity : 0, delay: i * 0.2 }}
                              />
                           ))}
                        </div>
                        
                        {/* Scanner Effect */}
                        <motion.div 
                           className="absolute w-full h-[2px] bg-amber-500/30 blur-sm pointer-events-none"
                           initial={{ opacity: 0 }}
                           animate={{ 
                              top: hoverStage === 3 ? ['0%', '100%', '0%'] : '50%',
                              opacity: hoverStage === 3 ? 1 : 0
                           }}
                           transition={{ 
                              top: { duration: 4, repeat: hoverStage === 3 ? Infinity : 0, ease: "linear" },
                              opacity: { duration: 0.3 }
                           }}
                        />
                     </div>

                     <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-black uppercase text-amber-500 mb-5 inline-block tracking-[0.2em] w-fit">Directive 03: Evolve</div>
                     <h4 className="text-2xl font-black mb-3 leading-tight tracking-tight">Visual Discovery</h4>
                     <p className="text-[14px] text-text-secondary leading-relaxed opacity-80 font-medium">
                        Navigate your second brain. Experience discovery, not just documentation, through a living graph of your own intelligence. 
                     </p>
                  </div>
               </div>

            </div>
         </div>
      </section>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/20 to-transparent" />

      {/* 4. HIGH-FIDELITY BENTO DASHBOARD */}
      <section className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-20 md:py-40 pointer-events-none">
          
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-16">
             <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-text-primary">System Core Features</h2>
             <div className="flex-1 h-[1px] bg-border opacity-30 w-full md:w-auto" />
             <div className="flex items-center space-x-2 text-[10px] font-black uppercase opacity-40">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>Monitoring Active</span>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
             
             {/* Main Hub Terminal Card */}
             <div className="p-0.5 md:p-1 rounded-[32px] md:rounded-[48px] bg-gradient-to-br from-border/50 to-transparent pointer-events-auto shadow-3xl">
                <div className="w-full h-full rounded-[30px] md:rounded-[44px] bg-background/80 backdrop-blur-3xl p-6 md:p-10 flex flex-col md:flex-row justify-between items-center border border-white/5 relative overflow-hidden group min-h-[400px] md:min-h-[450px]">
                   
                   <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/5 blur-[100px] md:blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                   
                   <div className="max-w-2xl relative z-10 text-center md:text-left">
                      <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black uppercase text-primary mb-6 inline-block tracking-widest">Global Graph v1.0</div>
                      <h3 className="text-3xl md:text-6xl font-black mb-6 md:mb-8 leading-tight">Visualizing 1.2M+ Memory Bridges</h3>
                      <p className="text-lg md:text-xl text-text-secondary leading-relaxed opacity-70 mb-8 max-w-xl mx-auto md:mx-0">
                         Our proprietary force-directed engine maps your entire digital existence in real-time. No more folder trees. 
                         Just a floating consciousness of your own discoveries.
                      </p>

                   </div>

                   <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto md:h-full rounded-[24px] md:rounded-[32px] overflow-hidden border border-border/40 bg-surface/10 group-hover:scale-[1.01] transition-transform duration-700 min-h-[220px] md:min-h-[300px] flex items-center justify-center mt-8 md:mt-0">
                      <div className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-screen">
                         <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
                         <Network className="w-24 md:w-48 h-24 md:h-48 text-primary animate-pulse opacity-20" />
                      </div>
                   </div>
                </div>
             </div>

             {/* Horizontal Bento Row */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, i) => {
                   const hoverThemes = {
                      blue: 'hover:border-blue-500/50 group-hover:text-blue-400',
                      cyan: 'hover:border-cyan-500/50 group-hover:text-cyan-400',
                      amber: 'hover:border-amber-500/50 group-hover:text-amber-400'
                   };
                   const tagThemes = {
                      blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                      cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
                      amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                   };

                   return (
                      <div key={i} className={`p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-background/60 backdrop-blur-xl border border-border shadow-2xl pointer-events-auto group relative overflow-hidden flex flex-col h-full transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ${hoverThemes[f.color]}`}>
                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-40 group-hover:scale-125 transition-all duration-500">
                            {f.icon}
                         </div>
                         <div className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest mb-8 inline-block w-fit transition-colors duration-500 ${tagThemes[f.color]}`}>
                            {f.tag}
                         </div>
                         <h4 className="text-2xl md:text-3xl font-black mb-4 leading-tight transition-colors duration-500">{f.title}</h4>
                         <p className="text-base text-text-secondary leading-relaxed opacity-70 mb-8 flex-1">{f.desc}</p>
                      </div>
                   );
                })}
             </div>

          </div>
      </section>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/20 to-transparent" />

      {/* 4.5 FINAL SYSTEM CTA - NEURAL CONVERGENCE */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-20 md:py-40 pointer-events-auto">
          <motion.div 
             className="relative group text-center"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1, ease: "easeOut" }}
          >
             
             {/* Deep Neural Glow System (Blue, Cyan, Amber) */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-1/2 left-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-blue-500/10 blur-[80px] md:blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/2 right-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-cyan-500/10 blur-[80px] md:blur-[120px] animate-pulse delay-700" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] md:w-[300px] h-[250px] md:h-[300px] bg-amber-500/10 blur-[70px] md:blur-[100px] animate-pulse delay-1000" />
             </div>
             
             {/* THE CONVERGENCE CORE */}
             <div className="mb-12 md:mb-16 relative inline-flex items-center justify-center">
                
                {/* Rotating Rings (Asynchronous) */}
                <motion.div 
                   className="absolute w-36 md:w-48 h-36 md:h-48 rounded-full border-2 border-blue-500/20 border-t-blue-500/60"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                   className="absolute w-28 md:w-40 h-28 md:h-40 rounded-full border-2 border-cyan-500/20 border-b-cyan-500/60"
                   animate={{ rotate: -360 }}
                   transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                   className="absolute w-20 md:w-32 h-20 md:h-32 rounded-full border-2 border-amber-500/20 border-l-amber-500/60"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Core Nucleus */}
                <div className="w-16 md:w-24 h-16 md:h-24 rounded-2xl md:rounded-3xl bg-background border border-white/10 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                   <Cpu className="w-7 md:w-10 h-7 md:h-10 text-primary relative z-20" />
                </div>
                
                {/* Floating Memories (Icons) */}
                <motion.div 
                   className="absolute"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                   <Network className="absolute -top-24 md:-top-32 -left-24 md:-left-32 w-5 md:w-6 h-5 md:h-6 text-blue-400/30" />
                   <Globe className="absolute -top-24 md:-top-32 -right-24 md:-right-32 w-5 md:w-6 h-5 md:h-6 text-cyan-400/30" />
                   <Zap className="absolute top-24 md:top-32 -left-24 md:-left-32 w-5 md:w-6 h-5 md:h-6 text-amber-400/30" />
                </motion.div>
             </div>

             <h2 className="text-4xl md:text-8xl font-black mb-8 md:mb-10 leading-[0.95] tracking-tighter max-w-5xl mx-auto drop-shadow-2xl">
                Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-500 animate-gradient">Evolve?</span><br/>
                Initialize Your Second Brain.
             </h2>
             
             <p className="text-lg md:text-xl text-text-secondary opacity-60 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-medium px-4">
                Stop the endless scroll. Start the neural siphoning. 
                MindGraph is the first Memory OS designed for the research-intensive future. 
                Initialize and deploy across every device you own. 
             </p>

             <div className="flex flex-col items-center space-y-12">
                <button 
                   onClick={handleCTAClick}
                   className="group/btn relative px-8 md:px-10 py-4 bg-text-primary text-background rounded-xl md:rounded-2xl font-black text-lg md:text-xl flex items-center space-x-4 overflow-hidden transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] active:scale-95 shadow-2xl"
                >
                   <span className="relative z-10">{user ? 'Enter MindGraph' : 'Initialize MindGraph'}</span>
                   <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-2 transition-transform duration-500" />
                   
                   {/* Particle Gloss & Inner Glow */}
                   <div className="absolute inset-x-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                </button>

                {/* Platform HUD Badges */}
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-12 px-10 py-8 md:py-5 bg-surface/40 backdrop-blur-3xl border border-border/40 rounded-3xl md:rounded-2xl opacity-40 hover:opacity-80 transition-all duration-700 w-full md:w-auto">
                   <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-cyan-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">Chrome Ext</span>
                   </div>
                   <div className="hidden md:block w-[1px] h-4 bg-border/40" />
                   <div className="flex items-center space-x-3">
                      <Monitor className="w-5 h-5 text-blue-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">Desktop OS</span>
                   </div>
                   <div className="hidden md:block w-[1px] h-4 bg-border/40" />
                   <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-amber-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">Mobile HUD</span>
                   </div>
                </div>
             </div>
          </motion.div>
      </section>

      {/* 5. FOOTER HUD UPGRADE */}
      <footer className="relative z-10 border-t border-border bg-background/60 backdrop-blur-3xl px-6 md:px-12 py-12 md:py-16 pointer-events-auto">
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
                  <div className="flex items-center space-x-6 text-text-tertiary">
                     <span className="opacity-40 hover:opacity-100 hover:text-primary transition-all duration-300 cursor-default">v1.02a</span>
                     <span className="opacity-40 hover:opacity-100 hover:text-primary transition-all duration-300 cursor-default">© 2026 MG</span>
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
