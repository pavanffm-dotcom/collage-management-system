import React from 'react';
import {
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { College } from '../types';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { CuteQRCodeSVG } from './CuteQRCodeSVG';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan?: () => void;
  currentCollege?: College | null;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  onSimulateScan,
  currentCollege
}) => {
  const { currentPreset } = useTheme();

  if (!isOpen) return null;

  const collegeId = currentCollege?.id || 'col-gec-goa';
  const collegeName = currentCollege?.name || 'Goa Engineering College';
  const collegeCode = currentCollege?.code || 'GEC-LIB';
  const publicPageUrl = `${window.location.origin}${window.location.pathname}?collegeId=${collegeId}&public=true`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`${currentPreset.modalBg} ${currentPreset.cardRadius} max-w-md w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden p-6 text-center relative space-y-5 my-auto`}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cute Header Badge */}
        <div className="space-y-1 text-center">
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 ${currentPreset.badgeRadius} ${currentPreset.badgeBg} text-xs font-bold tracking-wide shadow-xs`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Cute SVG Entrance QR Code</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate pt-1">
            {collegeName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scan with any mobile camera or download vector SVG for printing
          </p>
        </div>

        {/* Cute SVG QR Code Component */}
        <div className="py-2 flex justify-center">
          <CuteQRCodeSVG
            value={publicPageUrl}
            size={200}
            title={`${collegeCode} • Digital Gate Pass`}
            subtitle="Scan to browse library catalog & book locations"
            badgeText="Scan Me 💕"
            showScanMeBadge={true}
          />
        </div>

        {/* Action: Simulate Scan / Open Link Direct */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => {
              if (onSimulateScan) {
                onSimulateScan();
                onClose();
              } else {
                window.open(publicPageUrl, '_blank');
              }
            }}
            className={`w-full py-3 px-4 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95`}
          >
            <ExternalLink className="w-4 h-4 text-indigo-500" />
            <span>Open Public Student Catalog Page</span>
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};
