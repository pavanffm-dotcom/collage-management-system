import React, { createContext, useContext, useEffect, useState } from 'react';

export type LightDarkTheme = 'light' | 'dark';
export type ColorTheme = 'lavender' | 'peach' | 'mint' | 'cyber' | 'rose' | 'superblack' | 'glass' | 'clayglass' | 'blueprint3d';

export interface ThemePreset {
  id: ColorTheme;
  name: string;
  emoji: string;
  tagline: string;
  gradientBg: string;
  bannerBg: string;
  buttonBg: string;
  accentText: string;
  badgeBg: string;
  borderColor: string;
  previewColors: string[];
  // Dynamic Glassmorphism & Site-Wide Theme Properties
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  innerCardBg: string;
  headerBg: string;
  heroCardBg: string;
  inputBg: string;
  secondaryButtonBg: string;
  modalBg: string;
  glowShadow: string;
  // Dynamic Shape & Aesthetic Distinctive Traits
  cardRadius: string;
  buttonRadius: string;
  inputRadius: string;
  badgeRadius: string;
  cardExtraClass: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'lavender',
    name: 'Royal Amethyst',
    emoji: '🍇',
    tagline: 'Hyper-frosted violet glassmorphism with soft glowing curves',
    gradientBg: 'from-purple-600/30 via-indigo-600/20 to-purple-950/40',
    bannerBg: 'from-purple-900 via-indigo-950 to-purple-950 border-purple-500/40',
    buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30',
    accentText: 'text-purple-600 dark:text-purple-300',
    badgeBg: 'bg-purple-100/90 dark:bg-purple-950/80 text-purple-700 dark:text-purple-200 border border-purple-300 dark:border-purple-700/80',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    previewColors: ['#9333ea', '#c084fc', '#7e22ce'],
    pageBg: 'bg-[#f5f3ff] dark:bg-[#090412]',
    cardBg: 'bg-white/80 dark:bg-[#150928]/70 backdrop-blur-2xl',
    cardBorder: 'border border-purple-300/70 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500/80',
    innerCardBg: 'bg-purple-50/70 dark:bg-purple-950/50 backdrop-blur-lg',
    headerBg: 'bg-white/80 dark:bg-[#0d051c]/80 backdrop-blur-2xl border-purple-200/60 dark:border-purple-900/60',
    heroCardBg: 'bg-gradient-to-br from-white/90 via-purple-50/80 to-indigo-50/50 dark:from-[#210d3e]/90 dark:via-[#16072c]/90 dark:to-[#0a0316]/90 border border-purple-300/80 dark:border-purple-700/70 backdrop-blur-2xl shadow-2xl shadow-purple-500/15',
    inputBg: 'bg-purple-50/80 dark:bg-purple-950/60 border border-purple-300/80 dark:border-purple-700/80 text-purple-950 dark:text-purple-100 placeholder-purple-400 dark:placeholder-purple-400/60',
    secondaryButtonBg: 'bg-purple-100/80 hover:bg-purple-200/80 dark:bg-purple-900/50 dark:hover:bg-purple-900/80 text-purple-900 dark:text-purple-200 border border-purple-300/80 dark:border-purple-700/60',
    modalBg: 'bg-white/95 dark:bg-[#140828]/95 border-purple-300 dark:border-purple-700/80 backdrop-blur-2xl',
    glowShadow: 'shadow-xl shadow-purple-500/25',
    cardRadius: 'rounded-[28px]',
    buttonRadius: 'rounded-full',
    inputRadius: 'rounded-2xl',
    badgeRadius: 'rounded-full',
    cardExtraClass: 'ring-1 ring-purple-500/10 dark:ring-purple-400/20 shadow-purple-900/20'
  },
  {
    id: 'peach',
    name: 'Amber Sunrise',
    emoji: '🌅',
    tagline: 'Warm terracotta & honey paper aesthetic with soft tactile bevels',
    gradientBg: 'from-orange-600/30 via-amber-600/20 to-orange-950/40',
    bannerBg: 'from-orange-900 via-amber-950 to-orange-950 border-orange-700/50',
    buttonBg: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-600/30',
    accentText: 'text-orange-600 dark:text-amber-400',
    badgeBg: 'bg-orange-100/90 dark:bg-orange-950/90 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-800',
    borderColor: 'border-orange-200 dark:border-orange-900/60',
    previewColors: ['#ea580c', '#fb923c', '#c2410c'],
    pageBg: 'bg-[#fff7ed] dark:bg-[#120703]',
    cardBg: 'bg-amber-50/90 dark:bg-[#220d05]/90 backdrop-blur-md',
    cardBorder: 'border-2 border-orange-200/90 dark:border-orange-900/80 hover:border-orange-400 dark:hover:border-orange-600',
    innerCardBg: 'bg-orange-100/60 dark:bg-orange-950/60',
    headerBg: 'bg-amber-50/90 dark:bg-[#180803]/90 backdrop-blur-xl border-orange-200/80 dark:border-orange-900/80',
    heroCardBg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-[#2e1005]/95 dark:via-[#1c0a03]/95 dark:to-[#100501]/95 border-2 border-orange-300 dark:border-orange-800 shadow-xl shadow-orange-950/30',
    inputBg: 'bg-orange-100/60 dark:bg-orange-950/70 border-2 border-orange-300/80 dark:border-orange-800 text-orange-950 dark:text-orange-100 placeholder-orange-400',
    secondaryButtonBg: 'bg-orange-200/70 hover:bg-orange-300/70 dark:bg-orange-900/50 dark:hover:bg-orange-900/80 text-orange-950 dark:text-orange-100 border border-orange-300 dark:border-orange-800',
    modalBg: 'bg-amber-50/95 dark:bg-[#200b04]/95 border-2 border-orange-300 dark:border-orange-800 backdrop-blur-xl',
    glowShadow: 'shadow-lg shadow-orange-600/20',
    cardRadius: 'rounded-xl',
    buttonRadius: 'rounded-lg',
    inputRadius: 'rounded-xl',
    badgeRadius: 'rounded-md',
    cardExtraClass: 'shadow-md shadow-orange-950/20'
  },
  {
    id: 'mint',
    name: 'Emerald Sage',
    emoji: '🌿',
    tagline: 'Sharp precision botanical grid & high-tech minimalist frame',
    gradientBg: 'from-emerald-600/30 via-teal-600/20 to-emerald-950/40',
    bannerBg: 'from-emerald-900 via-teal-950 to-emerald-950 border-emerald-500/50',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white font-mono shadow-md shadow-emerald-500/20',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-700/80 font-mono',
    borderColor: 'border-emerald-200 dark:border-emerald-800/80',
    previewColors: ['#059669', '#34d399', '#047857'],
    pageBg: 'bg-[#f0fdf4] dark:bg-[#02140e]',
    cardBg: 'bg-white/90 dark:bg-[#052117]/90 backdrop-blur-sm',
    cardBorder: 'border-2 border-emerald-300/80 dark:border-emerald-700/70 hover:border-emerald-500 dark:hover:border-emerald-400',
    innerCardBg: 'bg-emerald-50/80 dark:bg-emerald-950/70',
    headerBg: 'bg-white/90 dark:bg-[#031811]/90 backdrop-blur-md border-b-2 border-emerald-200 dark:border-emerald-800',
    heroCardBg: 'bg-gradient-to-br from-white via-emerald-50 to-teal-50 dark:from-[#082e20]/95 dark:via-[#041a12]/95 dark:to-[#010c08]/95 border-2 border-emerald-400 dark:border-emerald-600 shadow-none',
    inputBg: 'bg-emerald-50/80 dark:bg-emerald-950/80 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 placeholder-emerald-500/60 font-mono',
    secondaryButtonBg: 'bg-emerald-100/90 hover:bg-emerald-200/90 dark:bg-emerald-900/60 dark:hover:bg-emerald-900/90 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 font-mono',
    modalBg: 'bg-white/95 dark:bg-[#041e15]/95 border-2 border-emerald-400 dark:border-emerald-600 backdrop-blur-md',
    glowShadow: 'shadow-none',
    cardRadius: 'rounded-md',
    buttonRadius: 'rounded-sm',
    inputRadius: 'rounded-md',
    badgeRadius: 'rounded-md',
    cardExtraClass: 'border-l-4 border-l-emerald-500'
  },
  {
    id: 'cyber',
    name: 'Sapphire Executive',
    emoji: '💎',
    tagline: 'Holographic cyber HUD with glowing cyan contours & asymmetric edges',
    gradientBg: 'from-blue-600/30 via-indigo-600/20 to-blue-950/40',
    bannerBg: 'from-blue-900 via-indigo-950 to-blue-950 border-blue-500/50',
    buttonBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/30',
    accentText: 'text-blue-600 dark:text-cyan-300',
    badgeBg: 'bg-blue-100/90 dark:bg-cyan-950/90 text-blue-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-600/80',
    borderColor: 'border-blue-200 dark:border-blue-800/80',
    previewColors: ['#2563eb', '#60a5fa', '#1d4ed8'],
    pageBg: 'bg-[#eff6ff] dark:bg-[#020917]',
    cardBg: 'bg-white/85 dark:bg-[#061833]/85 backdrop-blur-xl',
    cardBorder: 'border border-blue-300/80 dark:border-cyan-500/50 hover:border-cyan-400 dark:hover:border-cyan-300 shadow-lg shadow-cyan-500/10',
    innerCardBg: 'bg-blue-50/70 dark:bg-blue-950/70',
    headerBg: 'bg-white/85 dark:bg-[#031024]/85 backdrop-blur-xl border-blue-200/80 dark:border-cyan-900/80',
    heroCardBg: 'bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-[#0a2347]/95 dark:via-[#05142b]/95 dark:to-[#010816]/95 border border-cyan-400 dark:border-cyan-500 shadow-2xl shadow-cyan-500/20',
    inputBg: 'bg-blue-50/80 dark:bg-blue-950/80 border border-blue-300 dark:border-cyan-600 text-blue-950 dark:text-cyan-100 placeholder-blue-400',
    secondaryButtonBg: 'bg-blue-100/90 hover:bg-blue-200/90 dark:bg-blue-900/50 dark:hover:bg-blue-900/80 text-blue-900 dark:text-cyan-100 border border-blue-300 dark:border-cyan-700',
    modalBg: 'bg-white/95 dark:bg-[#05152e]/95 border border-cyan-400 dark:border-cyan-500 backdrop-blur-2xl',
    glowShadow: 'shadow-xl shadow-cyan-500/20',
    cardRadius: 'rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg',
    buttonRadius: 'rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm',
    inputRadius: 'rounded-xl',
    badgeRadius: 'rounded-tr-lg rounded-bl-lg rounded-tl-xs rounded-br-xs',
    cardExtraClass: 'ring-1 ring-cyan-500/30'
  },
  {
    id: 'rose',
    name: 'Ruby Crimson',
    emoji: '🌹',
    tagline: 'Luxurious velvet crimson & golden ruby arching curves',
    gradientBg: 'from-rose-600/30 via-pink-600/20 to-rose-950/40',
    bannerBg: 'from-rose-900 via-pink-950 to-rose-950 border-rose-500/50',
    buttonBg: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-600/30',
    accentText: 'text-rose-600 dark:text-rose-300',
    badgeBg: 'bg-rose-100/90 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700/80',
    borderColor: 'border-rose-200 dark:border-rose-800/80',
    previewColors: ['#e11d48', '#fb7185', '#be123c'],
    pageBg: 'bg-[#fff1f2] dark:bg-[#120308]',
    cardBg: 'bg-white/85 dark:bg-[#220713]/80 backdrop-blur-xl',
    cardBorder: 'border-2 border-rose-200/90 dark:border-rose-800/70 hover:border-rose-500 dark:hover:border-rose-400',
    innerCardBg: 'bg-rose-50/70 dark:bg-rose-950/60',
    headerBg: 'bg-white/85 dark:bg-[#17040d]/85 backdrop-blur-xl border-rose-200/80 dark:border-rose-900/80',
    heroCardBg: 'bg-gradient-to-br from-white via-rose-50 to-pink-50 dark:from-[#310a1b]/95 dark:via-[#1e0510]/95 dark:to-[#0f0208]/95 border-2 border-rose-300 dark:border-rose-700 shadow-2xl shadow-rose-950/40',
    inputBg: 'bg-rose-50/80 dark:bg-rose-950/70 border-2 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100 placeholder-rose-400',
    secondaryButtonBg: 'bg-rose-100/90 hover:bg-rose-200/90 dark:bg-rose-900/50 dark:hover:bg-rose-900/80 text-rose-900 dark:text-rose-100 border border-rose-300 dark:border-rose-800',
    modalBg: 'bg-white/95 dark:bg-[#200611]/95 border-2 border-rose-300 dark:border-rose-700 backdrop-blur-2xl',
    glowShadow: 'shadow-xl shadow-rose-600/25',
    cardRadius: 'rounded-2xl',
    buttonRadius: 'rounded-2xl',
    inputRadius: 'rounded-2xl',
    badgeRadius: 'rounded-xl',
    cardExtraClass: 'shadow-xl shadow-rose-950/30'
  },
  {
    id: 'superblack',
    name: 'Super Black OLED',
    emoji: '🖤',
    tagline: 'Pure OLED monochrome pitch black & high-contrast soft rounded square layout',
    gradientBg: 'from-zinc-900 via-black to-zinc-950',
    bannerBg: 'from-black via-zinc-950 to-black border-zinc-800',
    buttonBg: 'bg-zinc-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-extrabold shadow-md shadow-black/10 dark:shadow-white/10',
    accentText: 'text-zinc-950 dark:text-white font-mono font-black',
    badgeBg: 'bg-zinc-900 text-white dark:bg-white dark:text-black border border-zinc-800 dark:border-zinc-200 font-mono font-bold',
    borderColor: 'border-zinc-300 dark:border-zinc-800',
    previewColors: ['#000000', '#27272a', '#ffffff'],
    pageBg: 'bg-zinc-100 dark:bg-black',
    cardBg: 'bg-white dark:bg-[#080808] backdrop-blur-md',
    cardBorder: 'border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600',
    innerCardBg: 'bg-zinc-100/80 dark:bg-[#121212] backdrop-blur-xs',
    headerBg: 'bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800',
    heroCardBg: 'bg-white dark:bg-[#0d0d0d] text-zinc-950 dark:text-white border border-zinc-300 dark:border-zinc-800 shadow-2xl shadow-black/5 dark:shadow-black/80',
    inputBg: 'bg-zinc-50 dark:bg-[#121212] border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 font-mono',
    secondaryButtonBg: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 font-bold',
    modalBg: 'bg-white dark:bg-[#0c0c0c] border border-zinc-300 dark:border-zinc-800',
    glowShadow: 'shadow-2xl shadow-white/5',
    cardRadius: 'rounded-2xl',
    buttonRadius: 'rounded-xl',
    inputRadius: 'rounded-xl',
    badgeRadius: 'rounded-lg',
    cardExtraClass: 'border border-zinc-300 dark:border-zinc-800 shadow-xl shadow-black/5 dark:shadow-black/80'
  },
  {
    id: 'glass',
    name: 'Crystal Glass',
    emoji: '🫧',
    tagline: 'Modern frosted glassmorphism with soft floating spheres & glossy sky highlights',
    gradientBg: 'from-cyan-400/20 via-sky-500/10 to-indigo-500/20',
    bannerBg: 'from-cyan-500/80 via-sky-600/80 to-indigo-600/80 border-cyan-300/40',
    buttonBg: 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-semibold shadow-lg shadow-cyan-500/30 backdrop-blur-md',
    accentText: 'text-cyan-600 dark:text-cyan-300',
    badgeBg: 'bg-white/40 dark:bg-sky-950/40 text-cyan-900 dark:text-cyan-100 border border-white/60 dark:border-sky-700/60 backdrop-blur-md',
    borderColor: 'border-white/30 dark:border-sky-900/30',
    previewColors: ['#06b6d4', '#38bdf8', '#3b82f6'],
    pageBg: 'bg-gradient-to-tr from-[#e0f2fe] via-[#f0f9ff] to-[#e0e7ff] dark:from-[#030d1a] dark:via-[#07162c] dark:to-[#020713]',
    cardBg: 'bg-white/45 dark:bg-white/5 backdrop-blur-xl',
    cardBorder: 'border border-white/50 dark:border-white/10 hover:border-white/70 dark:hover:border-white/20 shadow-[0_8px_32px_0_rgba(14,165,233,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
    innerCardBg: 'bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/5',
    headerBg: 'bg-white/40 dark:bg-black/30 backdrop-blur-2xl border-b border-white/30 dark:border-white/5',
    heroCardBg: 'bg-white/45 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl shadow-cyan-500/5',
    inputBg: 'bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/10 text-slate-800 dark:text-sky-100 placeholder-slate-400 dark:placeholder-sky-400/50',
    secondaryButtonBg: 'bg-white/30 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-sky-200 border border-white/40 dark:border-white/10',
    modalBg: 'bg-white/60 dark:bg-[#07162c]/80 border border-white/50 dark:border-white/10 backdrop-blur-3xl',
    glowShadow: 'shadow-xl shadow-cyan-500/10',
    cardRadius: 'rounded-3xl',
    buttonRadius: 'rounded-2xl',
    inputRadius: 'rounded-2xl',
    badgeRadius: 'rounded-xl',
    cardExtraClass: 'ring-1 ring-white/20 dark:ring-white/5 shadow-2xl'
  },
  {
    id: 'clayglass',
    name: 'Dreamy Glass',
    emoji: '🌸',
    tagline: 'Soft, pastel claymorphism & ultra-frosted white glass cards with dreamy lavender gradients',
    gradientBg: 'from-violet-200/50 via-purple-200/40 to-pink-200/30 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20',
    bannerBg: 'from-violet-500 via-purple-500 to-pink-500 border-white/30',
    buttonBg: 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white font-extrabold shadow-lg shadow-purple-500/20 border border-white/20 backdrop-blur-md',
    accentText: 'text-violet-600 dark:text-violet-300 font-bold',
    badgeBg: 'bg-white/80 dark:bg-purple-950/40 text-violet-900 dark:text-violet-100 border border-white dark:border-purple-800/40 backdrop-blur-md shadow-sm',
    borderColor: 'border-white/50 dark:border-white/10',
    previewColors: ['#a78bfa', '#ec4899', '#f43f5e'],
    pageBg: 'bg-gradient-to-tr from-[#bcc0f2] via-[#dfd3f6] to-[#fad2e1] dark:from-[#090815] dark:via-[#110c1f] dark:to-[#170611]',
    cardBg: 'bg-white/55 dark:bg-[#120e24]/60 backdrop-blur-2xl',
    cardBorder: 'border border-white/70 dark:border-white/10 hover:border-white dark:hover:border-white/20 shadow-[0_15px_45px_rgba(141,105,255,0.08)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.55)]',
    innerCardBg: 'bg-white/35 dark:bg-white/5 backdrop-blur-md border border-white/45 dark:border-white/5',
    headerBg: 'bg-white/40 dark:bg-[#0d0a1b]/70 backdrop-blur-3xl border-b border-white/40 dark:border-white/5',
    heroCardBg: 'bg-white/55 dark:bg-[#120e24]/70 backdrop-blur-3xl border border-white/70 dark:border-white/15 shadow-2xl shadow-purple-500/5',
    inputBg: 'bg-white/60 dark:bg-black/35 backdrop-blur-md border border-white/60 dark:border-white/10 text-slate-800 dark:text-purple-100 placeholder-slate-400 dark:placeholder-purple-400/50',
    secondaryButtonBg: 'bg-white/40 hover:bg-white/65 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-purple-200 border border-white/55 dark:border-white/10 font-medium',
    modalBg: 'bg-white/80 dark:bg-[#0d0a1b]/95 border border-white/70 dark:border-white/10 backdrop-blur-3xl',
    glowShadow: 'shadow-[0_0_40px_rgba(167,139,250,0.15)]',
    cardRadius: 'rounded-[32px]',
    buttonRadius: 'rounded-[24px]',
    inputRadius: 'rounded-[24px]',
    badgeRadius: 'rounded-xl',
    cardExtraClass: 'ring-1 ring-white/40 dark:ring-white/5 shadow-2xl'
  },
  {
    id: 'blueprint3d',
    name: 'Blueprint 3D Studio',
    emoji: '🎨',
    tagline: 'Google Blueprint 3D claymorphism canvas with volumetric porcelain cards & tactile 3D clay buttons',
    gradientBg: 'from-[#5865F2]/50 via-indigo-600/40 to-cyan-500/40',
    bannerBg: 'from-[#4F46E5] via-[#5865F2] to-[#06B6D4] border-4 border-white/80 shadow-[0_20px_50px_rgba(79,70,229,0.45)]',
    buttonBg: 'bg-gradient-to-r from-[#5865F2] via-[#6366F1] to-[#06B6D4] hover:from-[#4338CA] hover:to-[#0891B2] text-white font-black shadow-[inset_0_2px_0_rgba(255,255,255,0.5),0_10px_25px_-5px_rgba(88,101,242,0.6)] border-b-4 border-indigo-900/60 active:translate-y-0.5 active:border-b-2',
    accentText: 'text-[#5865F2] dark:text-[#818CF8] font-black',
    badgeBg: 'bg-[#5865F2]/15 dark:bg-[#5865F2]/25 text-[#3730A3] dark:text-[#C7D2FE] border-2 border-white/80 dark:border-[#5865F2]/40 font-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]',
    borderColor: 'border-[#5865F2]/40 dark:border-[#5865F2]/30',
    previewColors: ['#5865f2', '#06b6d4', '#8b5cf6'],
    pageBg: 'bg-gradient-to-br from-[#5359F6] via-[#6366F1] to-[#4F46E5] dark:from-[#0B0D2A] dark:via-[#111642] dark:to-[#1B205B]',
    cardBg: 'bg-gradient-to-b from-[#FFFFFF] to-[#F2F5FF] dark:from-[#151A48] dark:to-[#0E1238] shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_25px_60px_-15px_rgba(20,15,65,0.35)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.12),0_25px_60px_-15px_rgba(0,0,0,0.85)]',
    cardBorder: 'border-4 border-white dark:border-[#384288] ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 hover:border-cyan-400 dark:hover:border-cyan-400 transition-all shadow-2xl',
    innerCardBg: 'bg-[#EAF0FF]/95 dark:bg-[#1A215C]/90 backdrop-blur-xl border-2 border-white/90 dark:border-[#333D82] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_20px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_3px_rgba(255,255,255,0.1),0_8px_20px_rgba(0,0,0,0.4)]',
    headerBg: 'bg-white/95 dark:bg-[#0C0F33]/95 backdrop-blur-2xl border-b-4 border-white dark:border-[#384288] shadow-lg',
    heroCardBg: 'bg-gradient-to-b from-[#FFFFFF] via-[#F6F8FF] to-[#E9EEFF] dark:from-[#181F54] dark:via-[#131846] dark:to-[#0C1032] shadow-[inset_0_3px_6px_rgba(255,255,255,1),0_30px_70px_-15px_rgba(30,25,90,0.4)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_30px_70px_-15px_rgba(0,0,0,0.9)] border-4 border-white dark:border-[#3B4694]',
    inputBg: 'bg-[#F3F6FF] dark:bg-[#0F1336] border-2 border-[#C0CCFF] dark:border-[#323C85] text-slate-900 dark:text-indigo-50 placeholder-indigo-400/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] font-bold',
    secondaryButtonBg: 'bg-[#E2E9FF] hover:bg-[#D4E0FF] dark:bg-[#20286E] dark:hover:bg-[#2A348C] text-[#312E81] dark:text-indigo-100 border-2 border-white dark:border-[#3C48A0] font-black shadow-[inset_0_2px_0_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_0_rgba(255,255,255,0.15)] border-b-3 border-indigo-300 dark:border-indigo-950',
    modalBg: 'bg-gradient-to-b from-[#FFFFFF] to-[#F0F4FF] dark:from-[#131742] dark:to-[#0A0D2A] border-4 border-white dark:border-[#3E4AA0] shadow-[0_35px_80px_-15px_rgba(15,10,50,0.5)] dark:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.95)]',
    glowShadow: 'shadow-[0_0_60px_rgba(88,101,242,0.45)]',
    cardRadius: 'rounded-[32px]',
    buttonRadius: 'rounded-[22px]',
    inputRadius: 'rounded-[22px]',
    badgeRadius: 'rounded-2xl',
    cardExtraClass: 'ring-4 ring-white/80 dark:ring-[#5865F2]/30 shadow-2xl'
  }
];

interface ThemeContextType {
  theme: LightDarkTheme;
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (ct: ColorTheme) => void;
  currentPreset: ThemePreset;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<LightDarkTheme>(() => {
    const saved = localStorage.getItem('library_app_theme');
    return (saved as LightDarkTheme) || 'dark';
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('library_color_theme');
    return (saved as ColorTheme) || 'superblack';
  });

  useEffect(() => {
    localStorage.setItem('library_app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('library_color_theme', colorTheme);
    document.documentElement.setAttribute('data-color-theme', colorTheme);

    // Synchronize HTML & Body backgrounds dynamically for mobile viewport coverage
    const preset = THEME_PRESETS.find(p => p.id === colorTheme) || THEME_PRESETS[0];
    
    // Clean up previous background/theme utility classes
    const cleanClasses = (el: HTMLElement) => {
      const classes = Array.from(el.classList);
      classes.forEach(cls => {
        if (
          cls.startsWith('bg-') || 
          cls.startsWith('from-') || 
          cls.startsWith('via-') || 
          cls.startsWith('to-') || 
          cls === 'bg-fixed' || 
          cls === 'bg-no-repeat' || 
          cls === 'transition-colors' || 
          cls === 'duration-500' || 
          cls === 'min-h-screen'
        ) {
          el.classList.remove(cls);
        }
      });
    };

    cleanClasses(document.body);
    cleanClasses(document.documentElement);

    // Apply the active preset pagebg and pinning parameters
    const newClasses = preset.pageBg.split(' ').filter(Boolean);
    document.body.classList.add(...newClasses, 'transition-colors', 'duration-500', 'min-h-screen', 'bg-no-repeat');
    document.documentElement.classList.add(...newClasses, 'transition-colors', 'duration-500', 'min-h-screen', 'bg-no-repeat');

    // Dynamically update mobile browser/PWA status bar theme-color
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeMeta);
    }
    const hexBg = colorTheme === 'superblack' ? '#000000' : (theme === 'dark' ? '#090d16' : '#f8fafc');
    themeMeta.setAttribute('content', hexBg);
  }, [colorTheme, theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setColorTheme = (ct: ColorTheme) => {
    setColorThemeState(ct);
  };

  const currentPreset = THEME_PRESETS.find(p => p.id === colorTheme) || THEME_PRESETS[0];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorTheme, setColorTheme, currentPreset }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
