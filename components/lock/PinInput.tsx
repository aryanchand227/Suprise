'use client';

import { useRef, useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  isShaking?: boolean;
  isSuccess?: boolean;
}

export default function PinInput({ length = 6, onComplete, isShaking, isSuccess }: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const newVals = [...values];
    newVals[index] = val;
    setValues(newVals);
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newVals.every((v) => v !== '') && newVals.join('').length === length) {
      onComplete(newVals.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newVals = [...values];
      newVals[index - 1] = '';
      setValues(newVals);
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    const newVals = [...Array(length).fill('')];
    text.split('').forEach((c, i) => { if (i < length) newVals[i] = c; });
    setValues(newVals);
    inputRefs.current[Math.min(text.length, length - 1)]?.focus();
    if (text.length === length) onComplete(text);
  };

  // Reset on shake
  useEffect(() => {
    if (isShaking) {
      const t = setTimeout(() => {
        setValues(Array(length).fill(''));
        inputRefs.current[0]?.focus();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isShaking, length]);

  return (
    <motion.div
      className="flex gap-3 justify-center"
      animate={isShaking ? { x: [0, -10, 10, -10, 10, -6, 6, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {values.map((val, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: 'backOut' }}
          className="relative"
        >
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={2}
            value={val}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="pin-digit"
            style={{
              borderColor: isSuccess
                ? '#d4af37'
                : val
                ? '#9b72cf'
                : undefined,
              boxShadow: isSuccess
                ? '0 0 20px rgba(212,175,55,0.5)'
                : val
                ? '0 0 12px rgba(155,114,207,0.3)'
                : undefined,
            }}
          />
          {/* Dot indicator */}
          <AnimatePresence>
            {val && !isSuccess && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                style={{ background: '#9b72cf', boxShadow: '0 0 6px #9b72cf' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
}
