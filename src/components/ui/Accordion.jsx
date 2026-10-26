import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const AccordionItem = ({ title, children, isOpen, onToggle, id }) => {
  return (
    <div className="border border-card-border/80 rounded-xl overflow-hidden glass-card transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-4 px-6 flex items-center justify-between text-left font-semibold text-text-main hover:text-primary-light transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-base pr-4">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-subtle shrink-0"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-5 pt-1 text-sm text-text-muted leading-relaxed border-t border-card-border/40">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Accordion = ({ items, className = '' }) => {
  const [openId, setOpenId] = useState(items[0]?.id || null);

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.question}
          isOpen={openId === item.id}
          onToggle={() => handleToggle(item.id)}
        >
          {item.answer}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
