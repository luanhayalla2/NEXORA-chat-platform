import React from 'react';
import { motion } from 'framer-motion';

export function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary/80 border border-border/50 rounded-2xl rounded-bl-md px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          {name && (
            <span className="text-xs text-muted-foreground mr-1">{name}</span>
          )}
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="block h-2 w-2 rounded-full bg-muted-foreground/60"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
