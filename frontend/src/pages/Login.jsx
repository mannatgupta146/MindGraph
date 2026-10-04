import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background transition-colors duration-500 relative px-4 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[100px] animate-pulse rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 blur-[100px] animate-pulse rounded-full pointer-events-none delay-700" />
      
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-120 p-6 sm:p-10 bg-surface/60 backdrop-blur-2xl rounded-3xl border border-border transition-all duration-500 shadow-2xl relative z-10 group overflow-hidden">
        
        <div className="text-center mb-8">
           <div className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center text-primary mb-4 border border-primary/20">
              <Lock className="w-6 h-6" />
           </div>
           <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary mb-1">Welcome Back</h2>
           <p className="text-sm sm:text-base font-medium text-text-tertiary">Log in to access your MindGraph vault</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm sm:text-base font-bold p-4 rounded-xl text-center mb-6 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-text-secondary ml-1">Email Address</label>
            <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="your.email@example.com"
                 required
                 disabled={loading}
                 className="w-full pl-12 pr-4 py-3.5 bg-background/40 border border-border/40 rounded-2xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:bg-background/80 transition-all text-base"
               />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-text-secondary ml-1">Password</label>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
               <input
                 type={showPassword ? "text" : "password"}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Enter your password"
                 required
                 disabled={loading}
                 className="w-full pl-12 pr-12 py-3.5 bg-background/40 border border-border/40 rounded-2xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:bg-background/80 transition-all text-base"
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
            disabled={loading}
            className="group/btn w-full py-4 px-6 mt-2 bg-primary text-white font-bold text-base sm:text-lg rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/40 text-center">
           <p className="text-sm sm:text-base font-medium text-text-tertiary">
             Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline cursor-pointer">Create Account</Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
