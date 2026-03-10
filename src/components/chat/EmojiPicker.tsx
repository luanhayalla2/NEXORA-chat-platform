import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES = [
  {
    name: 'Rostos',
    emojis: ['😀','😂','🥹','😍','🤩','😘','😜','🤔','😎','🥳','😭','😡','🤯','🫡','😴','🤗','🫠','😈','💀','🤡']
  },
  {
    name: 'Gestos',
    emojis: ['👍','👎','👋','🤝','✌️','🤞','👏','🙌','💪','🫶','👀','🫰','🤙','✋','🖐️','👆','👇','👉','👈','🤟']
  },
  {
    name: 'Corações',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❤️‍🔥','💕','💖','💗','💘','💝','♥️','🩷','🩵','🩶','💟']
  },
  {
    name: 'Objetos',
    emojis: ['🔥','⭐','✨','🎉','🎊','💯','🏆','🎯','💡','📱','💻','📸','🎵','🎶','📝','📎','🔗','🔒','⏰','🚀']
  },
  {
    name: 'Natureza',
    emojis: ['🌸','🌺','🌻','🌹','🍀','🌈','☀️','🌙','⛈️','❄️','🌊','🐶','🐱','🦋','🐝','🌵','🌴','🍎','🍕','☕']
  }
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0">
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-72 p-0">
        {/* Category tabs */}
        <div className="flex border-b border-border px-1 pt-1 gap-0.5 overflow-x-auto">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={cn(
                'px-2.5 py-1.5 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap',
                i === activeCategory
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {/* Emoji grid */}
        <div className="p-2 grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelect(emoji)}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
