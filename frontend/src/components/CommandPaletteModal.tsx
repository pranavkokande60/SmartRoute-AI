import React, { useState, useEffect, useRef } from 'react';
import {
  Search, X, ArrowRight, CornerDownLeft, Sparkles,
  Package, GitFork, Factory, MapPin, Box, ArrowUp, ArrowDown
} from 'lucide-react';
import { api } from '../api';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Query search backend with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchGlobal(query);
        setResults(res.results || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelectItem(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectItem = (item: any) => {
    onClose();
    if (item.target_tab) {
      onNavigateTab(item.target_tab);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'MODULE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>MODULE</span>
          </span>
        );
      case 'ORDER':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span>ORDER</span>
          </span>
        );
      case 'ROUTE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
            <GitFork className="w-3 h-3" />
            <span>ROUTE</span>
          </span>
        );
      case 'FACTORY':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Factory className="w-3 h-3" />
            <span>FACTORY</span>
          </span>
        );
      case 'STATE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>STATE</span>
          </span>
        );
      case 'PRODUCT':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <Box className="w-3 h-3" />
            <span>PRODUCT</span>
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
            {category}
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/80">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search orders, products, factories, states, routes, or modules..."
            className="flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-850/50"
        >
          {loading && results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Searching SmartRoute AI catalog...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching records found for "{query}".
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                      : 'hover:bg-slate-850/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {getCategoryBadge(item.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-mono text-slate-500">
                            • {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <span className="hidden sm:inline text-indigo-400 font-semibold">{item.target_tab}</span>
                    <CornerDownLeft className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Keyboard Hints Footer */}
        <div className="p-2.5 px-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">↵</kbd>
              <span className="ml-1">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">ESC</kbd>
              <span className="ml-1">Close</span>
            </span>
          </div>

          <div className="hidden sm:block text-slate-600 font-mono text-[10px]">
            SmartRoute AI Command Palette
          </div>
        </div>
      </div>
    </div>
  );
};
