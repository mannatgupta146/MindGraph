import React from 'react';
import { X, Download, Monitor, Shield, Zap, ChevronRight, Link as LinkIcon } from 'lucide-react';

const ExtensionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Download className="w-5 h-5" />,
      title: "1. Download the Vault",
      desc: "Download the 'mindgraph_helper.zip' file to your local machine.",
      action: (
        <a 
          href="/mindgraph_helper.zip" 
          download 
          className="mt-3 flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-wider uppercase"
        >
          <Download className="w-4 h-4 mr-2" />
          Get ZIP File
        </a>
      )
    },
    {
      icon: <Monitor className="w-5 h-5" />,
      title: "2. Open Extensions",
      desc: "Navigate to chrome://extensions in your browser's address bar.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "3. Enable Developer Mode",
      desc: "Toggle the 'Developer mode' switch in the top-right corner of the page.",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "4. Load Unpacked",
      desc: "Click 'Load unpacked', select the unzipped extension folder, and you're ready!",
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-[500px] bg-surface border border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/40 bg-surface/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mr-4 shadow-lg shadow-primary/20">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-text-primary tracking-tight">MindGraph Installation</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="flex group">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-all group-hover:scale-110">
                  {step.icon}
                </div>
                {idx !== steps.length - 1 && (
                  <div className="w-0.5 h-full bg-border/40 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <h3 className="text-sm font-black text-text-primary mb-1 uppercase tracking-wider">{step.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">{step.desc}</p>
                {step.action}
              </div>
            </div>
          ))}

          <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 border-dashed">
            <div className="flex items-center mb-2">
              <LinkIcon className="w-4 h-4 text-primary mr-2" />
              <p className="text-xs font-black text-primary uppercase tracking-widest">Neural Sync Tip</p>
            </div>
            <p className="text-[11px] text-text-tertiary font-medium leading-relaxed">
              Once installed, click the MindGraph icon in your browser and use the <span className="text-primary font-bold">Sync Code</span> from your sidebar to link your brain!
            </p>
          </div>
        </div>

        <div className="p-6 bg-surface-hover/30 border-t border-border/40 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-surface border border-border text-text-primary text-xs font-black hover:bg-surface-hover transition-all tracking-widest uppercase"
          >
            I'm Ready 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionModal;
