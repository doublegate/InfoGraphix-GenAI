import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Rich option for dropdown menus with preview support.
 * Used in RichSelect component for style and palette selection.
 */
export interface RichOption {
  /** Unique value identifier for the option */
  value: string;
  /** Display label shown in the dropdown */
  label: string;
  /** Descriptive text explaining the option */
  description: string;
  /** Optional preview component (e.g., color swatch, style thumbnail) */
  preview?: React.ReactNode;
}

/**
 * Props for RichSelect component.
 * A custom dropdown component with keyboard navigation, previews, and accessibility features.
 */
interface RichSelectProps {
  /** Label text displayed above the dropdown */
  label: string;
  /** Icon displayed next to the label */
  icon: React.ReactNode;
  /** Currently selected value (must match an option's value) */
  value: string;
  /** Array of available options */
  options: RichOption[];
  /** Callback fired when selection changes */
  onChange: (value: string) => void;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
}

const RichSelect: React.FC<RichSelectProps> = ({ label, icon, value, options, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];
  const listboxId = `listbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focused index when opening
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex(o => o.value === value);
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, value, options]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
          buttonRef.current?.focus();
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => Math.min(prev + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Home':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(0);
        }
        break;
      case 'End':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(options.length - 1);
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
    }
  }, [disabled, isOpen, focusedIndex, options, onChange]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      focusedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <span id={`${listboxId}-label`} className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
        {icon} {label}
      </span>

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${listboxId}-label`}
          aria-controls={isOpen ? listboxId : undefined}
          className={`w-full text-left bg-slate-900 border ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-700'} text-white text-sm rounded-lg px-4 py-3 outline-none transition-all flex justify-between items-center shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600'}`}
        >
          <span className="truncate font-medium">{selectedOption.label}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {isOpen && (
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={`${listboxId}-label`}
            aria-activedescendant={focusedIndex >= 0 ? `${listboxId}-option-${focusedIndex}` : undefined}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className="absolute z-[100] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="p-1.5 space-y-1">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  data-index={index}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    buttonRef.current?.focus();
                  }}
                  onMouseEnter={() => {
                    setHoveredOption(option.value);
                    setFocusedIndex(index);
                  }}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border border-transparent flex flex-col items-start gap-1 group relative overflow-hidden ${
                    value === option.value
                      ? 'bg-blue-600/10 border-blue-600/20'
                      : focusedIndex === index
                        ? 'bg-slate-700/50 border-slate-600/50'
                        : 'hover:bg-slate-700/50 hover:border-slate-600/50'
                  }`}
                >
                  <div className="w-full flex justify-between items-center relative z-10">
                    <span className={`font-semibold ${value === option.value ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'}`}>
                      {option.label}
                    </span>
                    {value === option.value && <Check className="w-4 h-4 text-blue-400" aria-hidden="true" />}
                  </div>

                  <span className={`text-xs leading-relaxed relative z-10 max-w-[75%] ${value === option.value ? 'text-blue-300/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {option.description}
                  </span>

                  {/* Preview Image on Hover */}
                  {option.preview && (
                    <div
                      aria-hidden="true"
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