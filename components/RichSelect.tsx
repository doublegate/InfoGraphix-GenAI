import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface RichOption {
  value: string;
  label: string;
  description: string;
  preview?: React.ReactNode;
}

interface RichSelectProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: RichOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RichSelect: React.FC<RichSelectProps> = ({ label, icon, value, options, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <span className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
        {icon} {label}
      </span>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full text-left bg-slate-900 border ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-700'} text-white text-sm rounded-lg px-4 py-3 outline-none transition-all flex justify-between items-center shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600'}`}
        >
          <span className="truncate font-medium">{selectedOption.label}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[100] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1.5 space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHoveredOption(option.value)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border border-transparent flex flex-col items-start gap-1 group relative overflow-hidden ${
                    value === option.value 
                      ? 'bg-blue-600/10 border-blue-600/20' 
                      : 'hover:bg-slate-700/50 hover:border-slate-600/50'
                  }`}
                >
                  <div className="w-full flex justify-between items-center relative z-10">
                    <span className={`font-semibold ${value === option.value ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'}`}>
                      {option.label}
                    </span>
                    {value === option.value && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  
                  <span className={`text-xs leading-relaxed relative z-10 max-w-[75%] ${value === option.value ? 'text-blue-300/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {option.description}
                  </span>

                  {/* Preview Image on Hover */}
                  {option.preview && (
                    <div 
                      className={`absolute right-2 top-1/2 -translate-y-1/2 w-16 h-12 rounded-md overflow-hidden border border-slate-600 shadow-lg transition-all duration-300 pointer-events-none ${
                        hoveredOption === option.value ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                      }`}
                    >
                      {option.preview}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RichSelect;