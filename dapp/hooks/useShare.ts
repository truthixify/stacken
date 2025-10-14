import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatForSocialMedia } from '../lib/textUtils';

interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

export const useShare = () => {
  const [sharing, setSharing] = useState(false);

  const shareToClipboard = async (url: string, title?: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy link');
      return false;
    }
  };

  const shareNative = async (options: ShareOptions) => {
    if (!navigator.share) {
      // Fallback to clipboard
      return shareToClipboard(options.url, options.title);
    }

    try {
      setSharing(true);
      const { title, description } = formatForSocialMedia(options.title, options.text);

      await navigator.share({
        title: title,
        text: description,
        url: options.url,
      });
      return true;
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        return shareToClipboard(options.url, options.title);
      }
      return false;
    } finally {
      setSharing(false);
    }
  };

  const shareToTwitter = (options: ShareOptions) => {
    const { title, description } = formatForSocialMedia(options.title, options.text);

    let tweetText = title;
    if (description && description !== title) {
      tweetText += ` — ${description}`;
    }

    // Add URL with a space
    tweetText += ` ${options.url}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToLinkedIn = (options: ShareOptions) => {
    const { title, description } = formatForSocialMedia(options.title, options.text);

    // LinkedIn sharing with title and summary
    const params = new URLSearchParams({
      url: options.url,
      title: title,
      summary: description || title,
    });

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const shareToTelegram = (options: ShareOptions) => {
    const { title, description } = formatForSocialMedia(options.title, options.text);

    let telegramText = title;
    if (description && description !== title) {
      telegramText += `\n\n${description}`;
    }

    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      options.url
    )}&text=${encodeURIComponent(telegramText)}`;
    window.open(telegramUrl, '_blank', 'width=550,height=420');
  };

  return {
    sharing,
    shareNative,
    shareToClipboard,
    shareToTwitter,
    shareToLinkedIn,
    shareToTelegram,
  };
};
