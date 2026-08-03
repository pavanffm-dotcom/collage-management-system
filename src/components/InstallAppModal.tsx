import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle, X, ShieldCheck, Zap, Globe, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  isInstalled: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  isInstalled
}) => {
  const { currentPreset } = useTheme();
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [promptTriggered, setPromptTriggered] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(isInstalled);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstalledSuccess(true);
        }
        setPromptTriggered(true);
      } catch (err) {
        console.error('Error triggering install prompt:', err);
      }
    } else {
      setPromptTriggered(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`${currentPreset.modalBg} ${currentPreset.cardRadius} max-w-lg w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-6 relative space-y-5 my-auto max-h-[92vh] flex flex-col`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg ring-4 ring-indigo-500/20">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Install Smart CMS App</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  PWA
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Install directly on your phone or PC for fast access
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {installedSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                App Installed Successfully!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You can now open Smart CMS from your device home screen or app drawer anytime.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/30 border border-indigo-500/10 text-center space-y-1">
                  <Zap className="w-4 h-4 text-indigo-500 mx-auto" />
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 block">Instant Load</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/30 border border-purple-500/10 text-center space-y-1">
                  <Smartphone className="w-4 h-4 text-purple-500 mx-auto" />
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 block">Native Feel</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/10 text-center space-y-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto" />
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 block">Offline Ready</span>
                </div>
              </div>

              {/* Direct Prompt Action */}
              {deferredPrompt && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold">One-Click Direct Installation</h4>
                      <p className="text-xs text-indigo-100 opacity-90">
                        Tap below to add the application to your home screen immediately.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-white text-indigo-600 hover:bg-slate-100 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Application Now</span>
                  </button>
                </div>
              )}

              {/* Tab Selector for Manual Instructions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Platform Setup Instructions
                  </span>
                  <div className="flex bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setPlatform('android')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        platform === 'android'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('ios')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        platform === 'ios'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      iOS (iPhone)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        platform === 'desktop'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      PC / Chrome
                    </button>
                  </div>
                </div>

                {/* Step Instructions */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {platform === 'android' && (
                    <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                      <li>
                        Open this page in <strong>Google Chrome</strong> or <strong>Edge</strong> browser on Android.
                      </li>
                      <li>
                        Tap the <strong>Three Dots ⋮</strong> menu icon in the top right corner.
                      </li>
                      <li>
                        Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </li>
                      <li>
                        Confirm installation. The app icon will appear on your phone home screen!
                      </li>
                    </ol>
                  )}

                  {platform === 'ios' && (
                    <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                      <li>
                        Open this link in <strong>Safari browser</strong> on your iPhone / iPad.
                      </li>
                      <li>
                        Tap the <Share2 className="w-3.5 h-3.5 inline text-indigo-500 mx-1" /> <strong>Share</strong> button at the bottom navigation bar.
                      </li>
                      <li>
                        Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline text-indigo-500 mx-1" /> <strong>"Add to Home Screen"</strong>.
                      </li>
                      <li>
                        Tap <strong>"Add"</strong> in the top right. You can now use Smart CMS as a full native app!
                      </li>
                    </ol>
                  )}

                  {platform === 'desktop' && (
                    <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                      <li>
                        Look at the right side of your Chrome / Edge address bar at the top.
                      </li>
                      <li>
                        Click the <Monitor className="w-3.5 h-3.5 inline text-indigo-500 mx-1" /> <strong>"Install Smart CMS"</strong> icon in the address bar.
                      </li>
                      <li>
                        Click <strong>"Install"</strong> in the popup dialog.
                      </li>
                      <li>
                        A desktop shortcut will be created for instant launcher access!
                      </li>
                    </ol>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-200/60 dark:border-zinc-800 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Universal App Support</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
