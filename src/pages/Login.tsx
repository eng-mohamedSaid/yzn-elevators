import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-primary"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-line rounded-2xl p-8 shadow-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 text-accent rounded-xl mx-auto flex items-center justify-center mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-1 italic">اليزن للمصاعد</h1>
          <p className="text-secondary text-sm">نظام الإدارة الداخلي</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm border border-red-100"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary uppercase mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-bg border border-line text-primary rounded-lg py-3 pr-4 pl-12 focus:border-accent outline-none transition-all text-sm"
                placeholder="admin@alyazen.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary uppercase mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-bg border border-line text-primary rounded-lg py-3 pr-4 pl-12 focus:border-accent outline-none transition-all text-sm"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3.5 rounded-lg shadow-sm hover:translate-y-[-1px] active:translate-y-[0] transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    <span>دخول النظام</span>
                    <LogIn size={18} />
                </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
