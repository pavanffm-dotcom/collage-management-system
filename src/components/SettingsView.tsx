import React, { useState } from 'react';
import { Building2, Save, MapPin, Mail, Sparkles, CheckCircle2, Edit3, Palette, Check, X, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { College } from '../types';
import { useTheme, THEME_PRESETS, ColorTheme } from '../context/ThemeContext';

interface SettingsViewProps {
  currentCollege: College | null;
  onUpdateCollege: (updatedCollege: Partial<College>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCollege,
  onUpdateCollege
}) => {
  const { colorTheme, setColorTheme, currentPreset } = useTheme();

  // Modal State for College Info Editor & Theme Selector
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState(currentCollege?.name || '');
  const [code, setCode] = useState(currentCollege?.code || '');
  const [location, setLocation] = useState(currentCollege?.location || '');
  const [librarianName, setLibrarianName] = useState(currentCollege?.librarianName || '');
  const [email, setEmail] = useState(currentCollege?.email || '');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateCollege({
        name,
        code,
        location,
        librarianName,
        email
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setIsCollegeModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Error updating college settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Settings Title Header */}
      <div className={`${currentPreset.cardBg} rounded-[28px] p-6 sm:p-8 border ${currentPreset.cardBorder} shadow-xl flex flex-wrap items-center justify-between gap-4 transition-all duration-500`}>
        <div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${currentPreset.innerCardBg} border ${currentPreset.borderColor} text-slate-700 dark:text-slate-300 text-xs font-bold mb-2`}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Control Panel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>System Settings & Configuration</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure institution details and select custom glassmorphic color themes.
          </p>
        </div>

        <span className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-full ${currentPreset.innerCardBg} text-slate-600 dark:text-slate-300 border ${currentPreset.borderColor}`}>
          ID: {currentCollege?.id || 'col-gec-goa'}
        </span>
      </div>

      {/* Main Settings Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Option 1: College Info Card */}
        <div className={`${currentPreset.cardBg} rounded-[28px] p-6 border ${currentPreset.cardBorder} shadow-xl flex flex-col justify-between space-y-5 transition-all duration-500`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl ${currentPreset.buttonBg} flex items-center justify-center shadow-lg`}>
                <Building2 className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentPreset.badgeBg}`}>
                {currentCollege?.code || 'GEC-LIB'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentCollege?.name || 'Institution Library Profile'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Librarian: {currentCollege?.librarianName || 'Not specified'} • {currentCollege?.location || 'Main Campus'}
              </p>
            </div>

            {/* Information Summary */}
            <div className={`p-3 ${currentPreset.innerCardBg} rounded-2xl border ${currentPreset.borderColor} space-y-1.5 text-xs text-slate-600 dark:text-slate-300`}>
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{currentCollege?.location || 'Campus Address'}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{currentCollege?.email || 'librarian@college.ac.in'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollegeModalOpen(true)}
            className={`w-full py-3 px-4 ${currentPreset.buttonBg} font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Add / Edit College Information</span>
          </button>
        </div>

        {/* Option 2: Themes & Palette Overview Card */}
        <div className={`${currentPreset.cardBg} rounded-[28px] p-6 border ${currentPreset.cardBorder} shadow-xl flex flex-col justify-between space-y-5 transition-all duration-500`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl ${currentPreset.buttonBg} flex items-center justify-center shadow-lg`}>
                <Palette className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentPreset.badgeBg}`}>
                Active: {currentPreset.emoji} {currentPreset.name}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Application Themes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select from 5 professionally designed glassmorphic color palettes.
              </p>
            </div>

            {/* Quick Palette Preview Dots */}
            <div className={`flex items-center justify-center gap-2 p-3 ${currentPreset.innerCardBg} rounded-2xl border ${currentPreset.borderColor}`}>
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setColorTheme(preset.id)}
                  title={preset.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    colorTheme === preset.id
                      ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.previewColors[0]}, ${preset.previewColors[1]})`
                  }}
                >
                  <span className="text-xs">{preset.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className={`w-full py-3 px-4 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]`}
          >
            <Palette className="w-4 h-4" />
            <span>Choose Theme Preset</span>
          </button>
        </div>

      </div>

      {/* Modal: Select Theme Preset Popover */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`${currentPreset.modalBg} ${currentPreset.cardRadius} max-w-3xl w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-7 relative space-y-5 my-auto max-h-[88vh] flex flex-col`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} flex items-center justify-center text-white shrink-0 shadow-md`}>
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Select Application Theme
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any theme to instantly apply across the portal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of 6 Theme Cards inside modal with proper internal padding so edges/shadows don't clip */}
            <div className="overflow-y-auto p-2 sm:p-3 -mx-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = colorTheme === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setColorTheme(preset.id)}
                      className={`p-4 ${preset.cardRadius} border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? `border-indigo-500 dark:border-indigo-400 ${preset.cardBg} ring-2 ring-indigo-500/30 shadow-lg`
                          : `border-slate-200 dark:border-slate-800/90 ${preset.innerCardBg} hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md`
                      }`}
                    >
                      {/* Selected Indicator Badge */}
                      {isSelected && (
                        <div className={`absolute top-3 right-3 w-5 h-5 ${preset.badgeRadius} ${preset.buttonBg} flex items-center justify-center shadow-md z-10`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-3 pr-6">
                        <div
                          className={`w-10 h-10 ${preset.buttonRadius} flex items-center justify-center text-lg shadow-sm shrink-0 border border-white/20`}
                          style={{
                            background: `linear-gradient(135deg, ${preset.previewColors[0]}, ${preset.previewColors[1]})`
                          }}
                        >
                          <span>{preset.emoji}</span>
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                            {preset.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Color Palette Swatches & Status Pill */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-auto">
                        <div className="flex items-center gap-1.5">
                          {preset.previewColors.map((color, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs inline-block"
                              style={{ backgroundColor: color }}
                              title={`Color ${i + 1}: ${color}`}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 ${preset.badgeRadius} ${preset.badgeBg}`}>
                          {isSelected ? 'Active' : 'Apply'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Action */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current Active: <strong className="text-slate-900 dark:text-white capitalize">{currentPreset.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className={`px-5 py-2 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs shadow-md transition-all hover:opacity-90`}
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Add / Edit College Profile Info */}
      {isCollegeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className={`${currentPreset.modalBg} rounded-[32px] max-w-lg w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden p-6 sm:p-8 relative space-y-5`}>
            
            <button
              type="button"
              onClick={() => setIsCollegeModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${currentPreset.badgeBg} flex items-center justify-center shrink-0`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  College Information Setup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update library name, code, librarian details, and location.
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>College profile saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  College / Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Goa Engineering College"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Library Short Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="GEC-LIB"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Campus
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Farmagudi, Ponda, Goa"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Librarian Name
                  </label>
                  <input
                    type="text"
                    required
                    value={librarianName}
                    onChange={e => setLibrarianName(e.target.value)}
                    placeholder="Dr. Ramesh Naik"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="librarian@college.ac.in"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none`}
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCollegeModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`py-2.5 px-5 ${currentPreset.buttonBg} font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 transition-all`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save College Profile'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
