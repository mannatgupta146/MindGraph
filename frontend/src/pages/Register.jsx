import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background transition-colors duration-500 relative px-4 overflow-hidden">
      
      {/* Decorative Neural Background Elements */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 blur-[100px] animate-pulse rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[100px] animate-pulse rounded-full pointer-events-none delay-700" />
      
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[480px] p-6 sm:p-10 bg-surface/60 backdrop-blur-2xl rounded-3xl border border-border transition-all duration-500 shadow-2xl relative z-10 group overflow-hidden">
        
        {/* Progress Bar Detail */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-primary animate-gradient" />

        <div className="text-center mb-10">
           <div className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center text-primary mb-6 border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
           </div>
           <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-text-primary mb-2">Register Identity</h2>
           <p className="text-sm font-medium text-text-tertiary uppercase tracking-widest">MindGraph Registration</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-bold p-4 rounded-xl text-center mb-8 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-widest text-text-tertiary ml-1">Directive: Full Name</label>
            <div className="relative group">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
               <input
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="Enter display name"
                 required
                 className="w-full pl-12 pr-4 py-4 bg-background/40 border border-border/40 rounded-2xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:bg-background/80 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500"
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-widest text-text-tertiary ml-1">Directive: Email</label>
            <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Enter system identifier"
                 required
                 className="w-full pl-12 pr-4 py-4 bg-background/40 border border-border/40 rounded-2xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:bg-background/80 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500"
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-widest text-text-tertiary ml-1">Directive: Password</label>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
               <input
                 type={showPassword ? "text" : "password"}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Create access code"
                 required
                 className="w-full pl-12 pr-12 py-4 bg-background/40 border border-border/40 rounded-2xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:bg-background/80 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500"
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1"
               >
                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
               </button>
            </div>
          </div>

          <button
            type="submit"
            className="group/btn w-full py-4 px-6 mt-4 bg-text-primary text-background font-black rounded-2xl flex items-center justify-center space-x-3 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 relative overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1 uppercase tracking-tighter">Initialize Identity</span>
            <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-500 group-hover/btn:translate-x-2" />
            
            {/* Gloss Effect */}
            <div className="absolute inset-x-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-border/40 text-center">
           <p className="text-sm font-medium text-text-tertiary tracking-tight">
             Identity already indexed? <Link to="/login" className="text-primary font-black hover:underline cursor-pointer">Enter MindGraph</Link>
           </p>
        </div>
      </div>

      {/* CRT Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
};

export default Register;
