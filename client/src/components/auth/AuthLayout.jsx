import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-[#0a0a0f] text-gray-100 selection:bg-blue-500/30">
      
      {/* ── Left Marketing Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-white/10 bg-gradient-to-br from-[#0a0a0f] via-[#12121c] to-[#0a0a0f]">
        
        {/* Animated Background Gradients / Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 mix-blend-screen" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          
          <Link to="/" className="flex items-center gap-3 w-max group">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={24} className="text-blue-400" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Smart Expense Tracker</span>
          </Link>

          <div className="max-w-md mt-20">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-tight mb-6">
              Master your money with AI.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Track expenses effortlessly, scan bills instantly, and get personalized insights to grow your savings. The future of personal finance is here.
            </p>
          </div>

          {/* Testimonial / Features */}
          <div className="space-y-4 mt-auto border-l-2 border-blue-500/30 pl-6">
            <p className="text-gray-300 italic">
              "This app completely changed how I look at my finances. The AI insights are scary accurate!"
            </p>
            <p className="text-sm font-semibold text-blue-400">— Happy User</p>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-[#050508]">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 w-[300px] h-[300px] bg-blue-600/15 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-2xl">
              <Sparkles size={24} className="text-blue-400" />
            </div>
            <span className="font-bold text-white text-xl">Smart Expense Tracker</span>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            {subtitle && <p className="text-gray-400">{subtitle}</p>}
          </div>

          {/* Render Form */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
            {children}
          </div>

        </div>
      </div>

    </div>
  );
}
