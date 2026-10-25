import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function TutorButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to="/tutor"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 group"
      aria-label="Open AI Tutor"
    >
      <MessageCircle className="w-5 h-5" />
      <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'max-w-32 opacity-100' : 'max-w-0 opacity-0'}`}>
        Ask the Network
      </span>
    </Link>
  );
}
