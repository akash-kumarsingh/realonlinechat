'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';

/* ─── Emoji data (static — no network, no library) ──────────── */
const CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: 'Smileys',
    icon: '😊',
    emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊',
      '😇','🥰','😍','🤩','😘','😗','😙','😚','🙃','😉',
      '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔',
      '😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔',
      '😪','🤤','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶',
      '😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲',
      '😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱',
      '😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠',
    ],
  },
  {
    label: 'Gestures',
    icon: '👍',
    emojis: [
      '👍','👎','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙',
      '👈','👉','👆','🖕','👇','☝️','👋','🤚','🖐️','✋',
      '🖖','👏','🙌','🤲','🤝','🙏','✍️','💅','🤳','💪',
      '🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴',
    ],
  },
  {
    label: 'People',
    icon: '👤',
    emojis: [
      '👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓',
      '👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇',
      '🤦','🤷','💆','💇','🚶','🧍','🧎','🏃','💃','🕺',
      '🧑‍🤝‍🧑','👫','👬','👭','💑','💏','👨‍👩‍👦','👨‍👩‍👧',
    ],
  },
  {
    label: 'Animals',
    icon: '🐶',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
      '🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧',
      '🐦','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝',
      '🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🐢','🐍',
      '🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐟',
      '🐬','🐳','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣',
    ],
  },
  {
    label: 'Food',
    icon: '🍕',
    emojis: [
      '🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍑','🍒','🥭',
      '🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌽',
      '🍕','🍔','🍟','🌭','🍿','🧂','🥓','🥚','🍳','🧇',
      '🥞','🧈','🍞','🥐','🥖','🫓','🥨','🥯','🧀','🥗',
      '🍝','🍜','🍲','🍛','🍣','🍱','🍤','🍙','🍚','🍘',
      '🍥','🥮','🍡','🧁','🍰','🎂','🍮','🍭','🍬','🍫',
      '🍦','🍧','🍨','🍩','🍪','☕','🍵','🧃','🥤','🧋',
    ],
  },
  {
    label: 'Travel',
    icon: '✈️',
    emojis: [
      '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐',
      '🛻','🚚','🚛','🚜','🏍️','🛵','🚲','🛴','🛹','🛼',
      '🚁','🛸','✈️','🚀','🛩️','🪂','🚃','🚄','🚅','🚆',
      '🚇','🚈','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐',
      '⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','🗺️','🧭','🌍',
      '🌎','🌏','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏝️','🏜️',
    ],
  },
  {
    label: 'Objects',
    icon: '💡',
    emojis: [
      '💡','🔦','🕯️','🪔','💰','💳','💎','⚖️','🔑','🗝️',
      '🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','🔫','🛡️','🪚',
      '🔧','🪛','🔩','⚙️','🗜️','🔗','⛓️','🪝','🧲','🪜',
      '📱','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💾','📀','🎥',
      '📷','📸','📹','📽️','🎞️','📞','☎️','📟','📠','📺',
      '📻','🧭','⏱️','⏰','⏲️','🕰️','⌛','⏳','📡','🔋',
      '🔌','💡','🔦','🕯️','🪔','📕','📗','📘','📙','📚',
    ],
  },
  {
    label: 'Symbols',
    icon: '❤️',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
      '❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️',
      '✝️','☪️','🕉️','✡️','🔯','🕎','☯️','☦️','🛐','⛎',
      '♈','♉','♊','♋','♌','♍','♎','♏','♐','♑',
      '⚡','🌟','⭐','💫','✨','🎇','🎆','🌈','☀️','🌤️',
      '⛅','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️',
      '🌀','🌊','🌁','🌫️','🌿','☘️','🍀','🎋','🍃','🍂',
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker = memo(function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Small delay to prevent immediate close from the button click that opened it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSelect = useCallback((emoji: string) => {
    onSelect(emoji);
    onClose();
  }, [onSelect, onClose]);

  return (
    <div
      ref={pickerRef}
      className="roc-emoji-picker"
      role="dialog"
      aria-label="Emoji picker"
      aria-modal="true"
    >
      {/* Category tabs */}
      <div className="roc-emoji-tabs" role="tablist" aria-label="Emoji categories">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            role="tab"
            aria-selected={activeCategory === i}
            aria-label={cat.label}
            onClick={() => setActiveCategory(i)}
            className={`roc-emoji-tab ${activeCategory === i ? 'active' : ''}`}
            title={cat.label}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Category label */}
      <div className="px-3 py-1.5 border-b border-[#111]">
        <span className="text-[10px] font-semibold text-[#333] uppercase tracking-wider">
          {CATEGORIES[activeCategory].label}
        </span>
      </div>

      {/* Emoji grid */}
      <div
        className="roc-emoji-grid"
        role="tabpanel"
        aria-label={`${CATEGORIES[activeCategory].label} emojis`}
      >
        {CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSelect(emoji)}
            className="roc-emoji-btn"
            aria-label={emoji}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
});

export default EmojiPicker;
