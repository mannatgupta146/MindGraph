import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Neural3DGraph from '../components/ui/Neural3DGraph';
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
  Globe,
  Loader2,
  CheckCircle,
  X,
  Download
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const fgRef = useRef();
  const [hoverStage, setHoverStage] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);

  const handleDeployExtension = () => {
    setIsDeploying(true);
    // Simulate Neural Inversion / Siphoning delay
    setTimeout(() => {
      setIsDeploying(false);
      setDeploymentSuccess(true);
      setShowDeployGuide(true);
      
      const element = document.createElement('a');
      element.href = '/mindgraph_helper.zip';
      element.download = 'mindgraph_helper.zip';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setTimeout(() => setDeploymentSuccess(false), 5000);
    }, 2400);
   };
   
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
    { label: 'SEARCH', val: 'HYBRID', icon: <Zap className="w-3 h-3" /> },
    { label: 'SYNC', val: 'REALTIME', icon: <Activity className="w-3 h-3" /> },
    { label: 'GRAPH', val: '3D NEURAL', icon: <Network className="w-3 h-3" /> },
    { label: 'STATUS', val: 'ACTIVE', icon: <Command className="w-3 h-3" /> }
  ];

  const features = [
    {
      title: 'Visual Knowledge Graph',
      desc: 'Explore your entire library as an interactive, interconnected web of thoughts and ideas.',
      icon: <Network className="w-5 h-5 text-blue-500" />,
      tag: 'Core Feature',
      color: 'blue'
    },
    {
      title: 'Smart Text & Image OCR',
      desc: 'Automatic text recognition turns your screenshots, images, and documents into searchable notes.',
      icon: <Cpu className="w-5 h-5 text-cyan-500" />,
      tag: 'Smart AI',
      color: 'cyan'
    },
    {
      title: 'One-Click Web Collector',
      desc: 'Save any web link, text snippet, or image instantly and link it to your existing collection.',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      tag: 'Auto Sync',
      color: 'amber'
    }
  ];

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} overflow-x-hidden transition-colors duration-500`}>
      
      {/* 1. INTERACTIVE 3D NEURAL CONSTELLATION BACKGROUND (TOP HERO VIEWPORT) */}
      <div className="absolute top-0 left-0 right-0 h-screen z-0 opacity-90 pointer-events-none overflow-hidden">
        <Neural3DGraph theme={theme} />
      </div>

      {/* 2. COMMAND HEADER NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
        <div className="max-w-400 mx-auto flex justify-between items-center relative">
          
          {/* LEFT: Logo */}
          <div className="flex items-center space-x-3 bg-background/60 backdrop-blur-xl border border-border px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl shadow-xl pointer-events-auto">
             <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm md:text-base">M</div>
             <span className="font-bold tracking-tighter text-lg md:text-xl uppercase text-text-primary">MindGraph</span>
          </div>
          
          {/* CENTER: Stats HUD */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center bg-background/40 backdrop-blur-xl border border-border rounded-2xl px-6 py-2.5 space-x-6 text-[9px] font-black uppercase tracking-[0.2em] opacity-70 pointer-events-auto whitespace-nowrap">
             {stats.map((s, i) => (
                <div key={i} className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
                   <span className="text-primary">{s.icon}</span>
                   <span className="whitespace-nowrap">{s.label}: <span className="text-text-primary font-bold">{s.val}</span></span>
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
      <main className="relative z-10 w-full max-w-400 mx-auto px-6 md:px-12 pt-40 md:pt-48 pb-20 md:pb-40 flex flex-col items-start text-left pointer-events-none">
        
        <div className="max-w-4xl">
           <div className="flex items-center space-x-3 mb-4">
              <span className="w-12 h-px bg-primary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">MindGraph v2.0</span>
           </div>

           <h1 className="text-4xl sm:text-6xl md:text-[108px] font-black mb-6 md:mb-8 leading-[0.95] md:leading-[0.85] tracking-tight pointer-events-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
             Experience Your <br className="hidden md:block"/>
             <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-gradient">Total Memory.</span>
           </h1>

           <p className="max-w-2xl text-lg md:text-xl text-text-secondary mb-10 md:mb-12 font-medium leading-relaxed pointer-events-auto opacity-70">
             MindGraph connects your links, images, and notes automatically. 
             Stop searching endlessly. Start discovering your personal digital workspace.
           </p>

           <button 
              onClick={handleCTAClick}
              className="group pointer-events-auto px-10 md:px-12 py-4 md:py-5 bg-text-primary text-background font-black rounded-xl md:rounded-2xl flex items-center shadow-2xl hover:scale-105 transition-all text-sm md:text-base cursor-pointer"
           >
              {user ? 'Open Workspace' : 'Get Started Free'}
              <ArrowRight className="ml-3 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
           </button>
        </div>
      </main>

      <div className="h-px w-full bg-linear-to-r from-transparent via-border/20 to-transparent" />

      {/* SUPPORTED CONTENT FORMATS SHOWCASE */}
      <section className="relative z-10 w-full max-w-400 mx-auto px-6 md:px-12 py-16 md:py-24 pointer-events-auto">
        <div className="text-center md:text-left mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Supports All Your Daily Formats.
          </h2>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl opacity-70">
            One click to extract transcripts, text, OCR images, and metadata automatically into your connected memory graph.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {/* 1. YouTube */}
          <div className="bg-surface/40 backdrop-blur-2xl border border-border shadow-sm hover:border-red-500/40 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186c-.273-1.011-1.04-1.802-2.028-2.074C19.694 3.827 12 3.827 12 3.827s-7.694 0-9.47.285C1.542 4.384.775 5.175.502 6.186.225 7.99.225 12 .225 12s0 4.01.277 5.814c.273 1.011 1.04 1.802 2.028 2.074 1.776.285 9.47.285 9.47.285s7.694 0 9.47-.285c.988-.272 1.755-1.063 2.028-2.074.277-1.804.277-5.814.277-5.814s0-4.01-.277-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-text-primary mb-1">YouTube</h3>
              <p className="text-xs text-text-tertiary leading-relaxed">Auto transcript & key takeaway summary.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-red-400">Video & Audio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            </div>
          </div>

          {/* 2. X / Twitter (Original Black Brand Color) */}
          <div className="bg-surface/40 backdrop-blur-2xl border border-border shadow-sm hover:border-text-primary/50 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-text-primary/10 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-black border border-zinc-700/80 flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:bg-black group-hover:border-zinc-400 group-hover:shadow-[0_0_20px_rgba(161,161,170,0.35)] transition-all duration-300 shadow-md">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-text-primary mb-1">X / Twitter</h3>
              <p className="text-xs text-text-tertiary leading-relaxed">Thread capture, post text & author metadata.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Social Threads</span>
              <span className="w-1.5 h-1.5 rounded-full bg-text-primary animate-pulse"></span>
            </div>
          </div>

          {/* 3. PDF Documents (Adobe Crimson Theme) */}
          <div className="bg-surface/40 backdrop-blur-2xl border border-border shadow-sm hover:border-rose-600/50 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-700/15 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-600/10 border border-rose-600/25 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-110 group-hover:bg-rose-700 group-hover:border-rose-600 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.63 15.3c-.71-.745-2.166-1.17-4.224-1.17-1.1 0-2.377.106-3.761.354a19.443 19.443 0 0 1-2.307-2.661c-.532-.71-.994-1.49-1.42-2.236.817-2.484 1.207-4.507 1.207-5.962 0-1.632-.603-3.336-2.342-3.336-.532 0-1.065.32-1.349.781-.78 1.384-.425 4.4.923 7.381a60.277 60.277 0 0 1-2.66 6.958c-3.233 1.17-5.358 2.596-5.646 3.857-.106.507.054 1.003.426 1.384.408.424.887.585 1.348.585 1.42 0 3.08-1.7 4.996-5.11a46.11 46.11 0 0 1 4.32-1.065c.958.958 1.843 1.682 2.691 2.192 2.414 1.453 4.115.958 4.896.426.674-.462 1.022-1.278.887-2.379zM2.946 20.36c.426-.958 1.917-2.093 3.58-2.946-1.065 1.933-2.022 2.946-3.58 2.946zM10.346 1.74c.639 0 .887.958.887 2.13 0 1.491-.355 2.84-.746 4.08-.674-1.775-1.03-3.535-.746-5.13.124-.71.355-1.08.605-1.08zm-.32 12.072c.532-1.065 1.065-2.272 1.526-3.585.497.887 1.065 1.738 1.668 2.555-1.03.248-2.13.639-3.194 1.03zm11.71 2.555c-.497.355-1.81.497-3.37-.461-.533-.355-1.066-.746-1.597-1.172 3.088-.355 4.968.07 5.04.532.106.39.07.887-.073 1.1z" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-text-primary mb-1">PDF Docs</h3>
              <p className="text-xs text-text-tertiary leading-relaxed">Full text extraction & document intelligence.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-rose-500">Documents</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            </div>
          </div>

          {/* 4. Images & Vision OCR */}
          <div className="bg-surface/40 backdrop-blur-2xl border border-border shadow-sm hover:border-yellow-500/50 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-500/15 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-500 mb-4 group-hover:scale-110 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-text-primary mb-1">Image & OCR</h3>
              <p className="text-xs text-text-tertiary leading-relaxed">AI visual recognition & text extraction.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-yellow-500">Vision AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            </div>
          </div>

          {/* 5. Articles & Personal Notes (Combined) */}
          <div className="bg-surface/40 backdrop-blur-2xl border border-border shadow-sm hover:border-blue-500/40 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
                  <path d="M2 6h4M2 10h4M2 14h4M2 18h4" />
                  <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-text-primary mb-1">Articles & Notes</h3>
              <p className="text-xs text-text-tertiary leading-relaxed">Clean reader mode, manual thoughts & code blocks.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-400">Reader & Snippets</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-linear-to-r from-transparent via-border/20 to-transparent" />

      {/* 2.0 NEURAL HELPER - UNIVERSAL CAPTURE */}
      <section className="relative z-10 w-full max-w-400 mx-auto px-6 md:px-12 py-20 md:py-32 pointer-events-auto">
          <div className="bg-surface/40 backdrop-blur-3xl border border-border/40 rounded-4xl md:rounded-6xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group shadow-2xl transition-all duration-700 hover:border-primary/50">
             
             {/* Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-primary/5 via-transparent to-amber-500/5 pointer-events-none" />
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] animate-pulse" />

             <div className="max-w-2xl relative z-10 text-center md:text-left mb-12 md:mb-0">
                <div className="inline-flex items-center space-x-3 mb-6 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Web Extension</span>
                </div>
                <h3 className="text-3xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">Save Anything from the Web.</h3>
                <p className="text-lg md:text-xl text-text-secondary opacity-70 mb-10 max-w-xl leading-relaxed">
                   MindGraph works where you work. Save articles, screenshots, and bookmarks directly into your personal library with one click.
                </p>
                
                <button 
                   onClick={handleDeployExtension}
                   disabled={isDeploying}
                   className={`group/ext px-8 md:px-10 py-4 ${deploymentSuccess ? 'bg-emerald-500' : 'bg-primary'} text-white rounded-xl md:rounded-2xl font-black text-base flex items-center space-x-4 shadow-2xl hover:scale-105 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-wait`}
                >
                   {isDeploying ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                   ) : deploymentSuccess ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                   ) : (
                      <Download className="w-5 h-5 text-white" />
                   )}
                   <span className="uppercase tracking-tighter">
                      {isDeploying ? 'Preparing Download...' : deploymentSuccess ? 'Downloaded!' : 'Download Web Extension'}
                   </span>
                   {!isDeploying && !deploymentSuccess && (
                      <ArrowRight className="w-5 h-5 group-hover/ext:translate-x-1 transition-transform duration-500" />
                   )}
                </button>
             </div>

             <div className="relative w-full md:w-1/3 aspect-square max-w-75 flex items-center justify-center mt-12 md:mt-0">
                <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full animate-pulse" />
                <div className="relative z-10 w-full h-full bg-background/60 backdrop-blur-2xl border border-border/40 rounded-3xl p-6 shadow-3xl transform rotate-3 transition-transform group-hover:rotate-0 duration-700 overflow-hidden">
                   <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">M</div>
                      <div className="h-2 w-20 bg-text-tertiary/20 rounded-full" />
                   </div>
                   <div className="space-y-4">
                      <div className="h-3 w-full bg-primary/10 rounded-lg animate-pulse" />
                      <div className="h-3 w-4/5 bg-text-tertiary/10 rounded-lg" />
                      <div className="h-3 w-2/3 bg-text-tertiary/10 rounded-lg" />
                   </div>
                   <div className="mt-12 h-10 w-full bg-primary/20 rounded-xl flex items-center justify-center text-primary text-[10px] font-black uppercase">Indexing active</div>
                   
                   {/* Mini Floating Orb */}
                   <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-full blur-sm animate-ping" />
                </div>
             </div>

          </div>
      </section>

      <div className="h-px w-full bg-linear-to-r from-transparent via-border/20 to-transparent" />

      {/* 3.1 ENAGAGING 'HOW IT WORKS' - NEURAL LIFECYCLE */}
      <section className="relative z-10 w-full max-w-400 mx-auto px-6 md:px-12 py-20 md:py-40 pointer-events-auto">
         <div className="text-center w-full max-w-350 mx-auto">
            <div className="flex items-center justify-center space-x-6 mb-12 animate-fade-in opacity-40">
               <div className="w-12 h-px bg-primary/20"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary whitespace-nowrap">Neural Lifecycle</span>
               <div className="w-12 h-px bg-primary/20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
               
               {/* Stage 1: SIPHONING */}
               <div 
                  className="relative group perspective-[1000px]"
                  onMouseEnter={() => setHoverStage(1)}
                  onMouseLeave={() => setHoverStage(0)}
               >
                  <div className="p-6 md:p-8 rounded-4xl bg-background/40 backdrop-blur-3xl border border-border/50 shadow-3xl flex flex-col items-center h-full transform transition-all duration-700 group-hover:scale-[1.02] group-hover:border-primary/50 border-t-primary/20 overflow-hidden will-change-transform">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] group-hover:bg-primary/20 transition-all pointer-events-none" />
                     
                     {/* SIPHON ANIMATION BOX */}
                     <div className="w-full aspect-video rounded-3xl bg-surface/20 border border-border/30 mb-6 relative overflow-hidden flex items-center justify-center pointer-events-none">
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
                  <div className="p-6 md:p-8 rounded-4xl bg-background/40 backdrop-blur-3xl border border-border/50 shadow-3xl flex flex-col items-center h-full transform transition-all duration-700 group-hover:scale-[1.02] group-hover:border-secondary/50 border-t-secondary/20 overflow-hidden will-change-transform">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[60px] group-hover:bg-secondary/20 transition-all pointer-events-none" />
                     
                     {/* BRIDGING ANIMATION BOX */}
                     <div className="w-full aspect-video rounded-3xl bg-surface/20 border border-border/30 mb-6 relative overflow-hidden flex items-center justify-center pointer-events-none">
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
                  <div className="p-6 md:p-8 rounded-4xl bg-background/40 backdrop-blur-3xl border border-border/50 shadow-3xl flex flex-col items-center h-full transform transition-all duration-700 group-hover:scale-[1.02] group-hover:border-amber-500/50 border-t-amber-500/20 overflow-hidden will-change-transform">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                     
                     {/* DISCOVERY ANIMATION BOX */}
                     <div className="w-full aspect-video rounded-3xl bg-surface/20 border border-border/30 mb-6 relative overflow-hidden flex items-center justify-center pointer-events-none">
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
                           className="absolute w-full h-0.5 bg-amber-500/30 blur-sm pointer-events-none"
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

      <div className="h-px w-full bg-linear-to-r from-transparent via-border/20 to-transparent" />

      {/* 4. HIGH-FIDELITY BENTO DASHBOARD */}
      <section className="relative z-10 w-full max-w-400 mx-auto px-6 md:px-12 py-20 md:py-40 pointer-events-none">
          
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-16">
             <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-text-primary">Core Platform Features</h2>
             <div className="flex-1 h-px bg-border opacity-30 w-full md:w-auto" />
             <div className="flex items-center space-x-2 text-[10px] font-black uppercase opacity-40">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>System Online</span>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
             
             {/* Main Hub Terminal Card */}
             <div className="p-0.5 md:p-1 rounded-4xl md:rounded-6xl bg-linear-to-br from-border/50 to-transparent pointer-events-auto shadow-3xl">
                <div className="w-full h-full rounded-[30px] md:rounded-[44px] bg-background/80 backdrop-blur-3xl p-6 md:p-10 flex flex-col md:flex-row justify-between items-center border border-white/5 relative overflow-hidden group min-h-100 md:min-h-112.5">
                   
                   <div className="absolute top-0 right-0 w-100 md:w-150 h-100 md:h-150 bg-primary/5 blur-[100px] md:blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                   
                   <div className="max-w-2xl relative z-10 text-center md:text-left">
                      <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black uppercase text-primary mb-6 inline-block tracking-widest">Interactive Knowledge Graph</div>
                      <h3 className="text-3xl md:text-6xl font-black mb-6 md:mb-8 leading-tight">Visualize All Your Saved Content</h3>
                      <p className="text-lg md:text-xl text-text-secondary leading-relaxed opacity-70 mb-8 max-w-xl mx-auto md:mx-0">
                         Our interactive visual map connects your notes, links, and documents automatically. 
                         Find what you need without digging through complex folder structures.
                      </p>

                   </div>

                   <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto md:h-full rounded-3xl md:rounded-4xl overflow-hidden border border-border/40 bg-surface/10 group-hover:scale-[1.01] transition-transform duration-700 min-h-55 md:min-h-75 flex items-center justify-center mt-8 md:mt-0">
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
                      <div key={i} className={`p-8 md:p-10 rounded-4xl md:rounded-[40px] bg-background/60 backdrop-blur-xl border border-border shadow-2xl pointer-events-auto group relative overflow-hidden flex flex-col h-full transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ${hoverThemes[f.color]}`}>
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


      {/* 4.5 FINAL SYSTEM CTA - NEURAL CONVERGENCE */}
      <section className="relative z-10 w-full max-w-350 mx-auto px-6 md:px-12 py-20 md:py-40 pointer-events-auto">
          <motion.div 
             className="relative group text-center"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1, ease: "easeOut" }}
          >
             
             {/* Deep Neural Glow System (Blue, Cyan, Amber) */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-1/2 left-0 w-75 md:w-100 h-75 md:h-100 bg-blue-500/10 blur-[80px] md:blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/2 right-0 w-75 md:w-100 h-75 md:h-100 bg-cyan-500/10 blur-[80px] md:blur-[120px] animate-pulse delay-700" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-62.5 md:w-75 h-62.5 md:h-75 bg-amber-500/10 blur-[70px] md:blur-[100px] animate-pulse delay-1000" />
             </div>
             
             {/* THE NEURAL HUB BADGE GRID */}
             <div className="mb-8 md:mb-10 relative inline-flex flex-col items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[90px] rounded-full pointer-events-none" />
                
                {/* Floating Glass Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                   <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-border/60 text-xs font-bold text-text-primary shadow-lg backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Smart Conceptual Index</span>
                   </div>
                   <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-border/60 text-xs font-bold text-text-primary shadow-lg backdrop-blur-md">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>0ms Instant Sync</span>
                   </div>
                   <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-border/60 text-xs font-bold text-text-primary shadow-lg backdrop-blur-md">
                      <Network className="w-3.5 h-3.5 text-secondary" />
                      <span>Visual 2D Graph</span>
                   </div>
                </div>
             </div>

             <h2 className="text-4xl md:text-8xl font-black mb-8 md:mb-10 leading-[0.95] tracking-tighter max-w-5xl mx-auto drop-shadow-2xl">
                Ready to <span className="text-primary font-black drop-shadow-[0_0_40px_rgba(59,130,246,0.6)]">Organize</span> Your Knowledge?
             </h2>
             
             <p className="text-lg md:text-xl text-text-secondary opacity-60 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-medium px-4">
                Stop losing important links and ideas. MindGraph keeps your research, bookmarks, and notes connected in one place.
             </p>

             <div className="flex flex-col items-center space-y-12">
                <button 
                   onClick={handleCTAClick}
                   className="group/btn relative px-8 md:px-10 py-4 bg-text-primary text-background rounded-xl md:rounded-2xl font-black text-lg md:text-xl flex items-center space-x-4 overflow-hidden transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] active:scale-95 shadow-2xl cursor-pointer"
                >
                   <span className="relative z-10">{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
                   <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-2 transition-transform duration-500" />
                   
                   {/* Particle Gloss & Inner Glow */}
                   <div className="absolute inset-x-0 h-full w-full bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                </button>

                {/* Platform Badges */}
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-12 px-10 py-8 md:py-5 bg-surface/40 backdrop-blur-3xl border border-border/40 rounded-3xl md:rounded-2xl opacity-40 hover:opacity-80 transition-all duration-700 w-full md:w-auto">
                   <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-cyan-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">Web Extension</span>
                   </div>
                   <div className="hidden md:block w-px h-4 bg-border/40" />
                   <div className="flex items-center space-x-3">
                      <Monitor className="w-5 h-5 text-blue-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">Desktop App</span>
                   </div>
                   <div className="hidden md:block w-px h-4 bg-border/40" />
                   <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-amber-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">Mobile Friendly</span>
                   </div>
                </div>
             </div>
          </motion.div>
       </section>

      {/* 5. FOOTER HUD UPGRADE */}
      <footer className="relative z-10 border-t border-border bg-background/60 backdrop-blur-3xl px-6 md:px-12 py-12 md:py-16 pointer-events-auto">
         <div className="max-w-400 mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
            
            <div className="md:col-span-1">
               <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base">M</div>
                  <span className="font-black text-lg text-text-primary tracking-tighter">MindGraph</span>
               </div>
               <p className="normal-case opacity-50 font-medium tracking-normal text-sm leading-relaxed max-w-xs">
                  MindGraph is a smart knowledge workspace designed to save, organize, and visually connect your digital notes and bookmarks.
               </p>
            </div>

            <div>
               <h5 className="text-text-secondary mb-8">Navigation</h5>
               <ul className="space-y-4">
                  <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                  <li><a href="/collections" className="hover:text-primary transition-colors">Collections</a></li>
                  <li><a href="/inbox" className="hover:text-primary transition-colors">Inbox Queue</a></li>
                  <li><a href="/graph" className="hover:text-primary transition-colors">Knowledge Graph</a></li>
               </ul>
            </div>

            <div>
               <h5 className="text-text-secondary mb-8">Features</h5>
               <ul className="space-y-4">
                  <li><a href="#" className="hover:text-primary transition-colors">Visual Graph</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Text & Image OCR</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">One-Click Extension</a></li>
               </ul>
            </div>

            <div>
               <h5 className="text-text-secondary mb-8">Server Status</h5>
               <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
                     <span>Status: Online</span>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
                  </div>
                  <div className="flex items-center space-x-6 text-text-tertiary">
                     <span className="opacity-40 hover:opacity-100 hover:text-primary transition-all duration-300 cursor-default">v2.0</span>
                     <span className="opacity-40 hover:opacity-100 hover:text-primary transition-all duration-300 cursor-default">© 2026 MindGraph</span>
                  </div>
               </div>
            </div>

         </div>
      </footer>

      {/* CRT SCANLINE OVERLAY - FOR OS FEEL */}
      <div className="fixed inset-0 pointer-events-none z-100 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]"></div>

      {/* 9.0 TECHNICAL HUD OVERLAY - HANDSHAKE GUIDE */}
      <AnimatePresence>
        {showDeployGuide && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-surface/90 border border-border/50 rounded-4xl p-8 md:p-12 max-w-xl w-full relative shadow-3xl"
            >
               <button 
                  onClick={() => setShowDeployGuide(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
               >
                  <X className="w-6 h-6 text-text-secondary" />
               </button>

               <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                     <Monitor className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black uppercase tracking-widest">MindGraph Web Extension</h3>
                     <p className="text-[10px] font-black uppercase opacity-60 text-primary">Status: Ready to Install</p>
                  </div>
               </div>

               <div className="space-y-6 mb-10">
                  <div className="flex space-x-4">
                     <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">01</div>
                     <p className="text-sm text-text-secondary">Extract the downloaded <span className="text-primary font-bold">mindgraph_helper.zip</span> folder.</p>
                  </div>
                  <div className="flex space-x-4">
                     <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">02</div>
                     <p className="text-sm text-text-secondary">Enable <span className="text-primary font-bold">Developer Mode</span> in your browser extension settings.</p>
                  </div>
                  <div className="flex space-x-4">
                     <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">03</div>
                     <p className="text-sm text-text-secondary">Click <span className="text-primary font-bold uppercase tracking-tighter">Load Unpacked</span> and select the extracted folder.</p>
                  </div>
               </div>

               <button 
                  onClick={() => setShowDeployGuide(false)}
                  className="w-full py-4 bg-text-primary text-background rounded-2xl font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all cursor-pointer"
               >
                  Got It - Continue
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Landing;
