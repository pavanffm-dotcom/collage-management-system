import React from 'react';
import { Palette, Check, X, Moon, Sun } from 'lucide-react';
import { useTheme, THEME_PRESETS } from '../context/ThemeContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, colorTheme, setColorTheme, currentPreset } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`${currentPreset.modalBg} ${currentPreset.cardRadius} max-w-2xl w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-6 relative space-y-4 my-auto max-h-[90vh] flex flex-col`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} flex items-center justify-center text-white shrink-0 shadow-md`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Customize Portal Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any theme to apply it directly across the app in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all border border-slate-200 dark:border-zinc-700/60 flex items-center gap-1.5 text-xs font-bold"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Theme Presets Grid */}
        <div className="overflow-y-auto p-1 max-h-[60vh] space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected = colorTheme === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setColorTheme(preset.id)}
                  className={`p-3.5 ${preset.cardRadius} border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? `border-indigo-500 dark:border-indigo-400 ${preset.cardBg} ring-2 ring-indigo-500/30 shadow-md`
                      : `border-slate-200 dark:border-zinc-800 ${preset.innerCardBg} hover:border-slate-300 dark:hover:border-zinc-700`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 ${preset.buttonRadius} flex items-center justify-center text-base shadow-xs shrink-0 border border-white/20`}
                        style={{
                          background: `linear-gradient(135deg, ${preset.previewColors[0]}, ${preset.previewColors[1]})`
                        }}
                      >
                        <span>{preset.emoji}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {preset.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {preset.tagline}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                        Apply
                      </span>
                    )}
                  </div>

                  {/* Swatches */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/40 dark:border-zinc-800/60">
                    <div className="flex items-center gap-1.5">
                      {preset.previewColors.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-700 shadow-xs inline-block"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {preset.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-200/60 dark:border-zinc-800 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Active: <strong className="text-indigo-600 dark:text-indigo-400">{currentPreset.emoji} {currentPreset.name}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all`}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
