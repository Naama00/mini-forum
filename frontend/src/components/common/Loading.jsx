import { Zap } from 'lucide-react';

export function Loading({ text = 'Loading...' }) {
  return (
    <div className="py-32 text-center">
      <Zap className="w-10 h-10 text-cyan-400 animate-pulse mx-auto mb-4" />
      <p className="text-slate-500 uppercase tracking-widest text-sm">
        {text}
      </p>
    </div>
  );
}

export default Loading;
