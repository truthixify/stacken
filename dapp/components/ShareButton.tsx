import React, { useState } from 'react';
import { Share2, Copy, Twitter, Linkedin, Send } from 'lucide-react';
import { useShare } from '../hooks/useShare';

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  className?: string;
  showDropdown?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url,
  className = '',
  showDropdown = false,
}) => {
  const {
    sharing,
    shareNative,
    shareToClipboard,
    shareToTwitter,
    shareToLinkedIn,
    shareToTelegram,
  } = useShare();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleShare = () => {
    if (showDropdown) {
      setDropdownOpen(!dropdownOpen);
    } else {
      shareNative({ title, text, url });
    }
  };

  const handleShareOption = (shareFunction: () => void) => {
    shareFunction();
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={sharing}
        className={`flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors ${
          sharing ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <Share2 size={20} className={sharing ? 'animate-pulse' : ''} />
        <span className="text-sm font-medium">Share</span>
      </button>

      {showDropdown && dropdownOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={() => handleShareOption(() => shareToClipboard(url, title))}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
              >
                <Copy size={16} className="mr-3" />
                Copy Link
              </button>

              <button
                onClick={() => handleShareOption(() => shareToTwitter({ title, text, url }))}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
              >
                <Twitter size={16} className="mr-3" />
                Share on Twitter
              </button>

              <button
                onClick={() => handleShareOption(() => shareToLinkedIn({ title, text, url }))}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
              >
                <Linkedin size={16} className="mr-3" />
                Share on LinkedIn
              </button>

              <button
                onClick={() => handleShareOption(() => shareToTelegram({ title, text, url }))}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
              >
                <Send size={16} className="mr-3" />
                Share on Telegram
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
