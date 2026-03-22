import React from 'react';
import { Lightbulb, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourTipProps {
  show?: boolean;
  title: string;
  description?: string;
  text?: string;
}

export const TourTip: React.FC<TourTipProps> = ({ show = true, title, description, text }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
            <div className="bg-amber-100 p-2.5 rounded-full text-amber-600 flex-shrink-0">
              <Lightbulb className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                Dica do Tour: {title}
              </h4>
              <p className="text-amber-800/80 text-sm leading-relaxed">
                {description || text}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
