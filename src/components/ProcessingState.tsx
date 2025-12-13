import React from 'react';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';

/**
 * Props for ProcessingState component.
 * Displays loading animations and status messages during infographic generation.
 */
interface ProcessingStateProps {
  /**
   * Current processing step:
   * - 'idle': No processing (component hidden)
   * - 'analyzing': Topic analysis in progress (Gemini 3 Pro)
   * - 'generating': Image generation in progress (Gemini 3 Pro Image)
   * - 'complete': Processing finished (component hidden)
   */
  step: 'idle' | 'analyzing' | 'generating' | 'complete';
}

const ProcessingState: React.FC<ProcessingStateProps> = ({ step }) => {
  if (step === 'idle' || step === 'complete') return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full"></div>
        <div className="relative w-24 h-24 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center shadow-2xl transition-all duration-500">
          {step === 'analyzing' ? (
            <BrainCircuit className="w-10 h-10 text-blue-400 animate-pulse" />
          ) : (
            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
          )}
          
          <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
        </div>
      </div>
      
      <div className="text-center space-y-2 max-w-md" key={step}>
        <h3 className="text-xl font-bold text-white animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step === 'analyzing' ? 'Deep Analysis in Progress' : 'Generating High-Fidelity Render'}
        </h3>
        <p className="text-slate-400 text-sm animate-in fade-in slide-in-from-bottom-1 duration-500 delay-100">
          {step === 'analyzing' 
            ? 'Gemini 3 Pro is researching the topic, checking references, and structuring the data...' 
            : 'Gemini 3 Pro Image (Nano Banana Pro) is creating your ' + ' infographic...'}
        </p>
      </div>

      <div className="flex gap-2">
        <div className={`h-1 w-12 rounded-full transition-colors duration-500 ${step === 'analyzing' ? 'bg-blue-500' : 'bg-blue-900'}`}></div>
        <div className={`h-1 w-12 rounded-full transition-colors duration-500 ${step === 'generating' ? 'bg-purple-500' : 'bg-slate-800'}`}></div>
      </div>
    </div>
  );
};

export default ProcessingState;