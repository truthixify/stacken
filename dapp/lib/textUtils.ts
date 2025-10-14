/**
 * Utility functions for text formatting and cleaning
 */

/**
 * Remove HTML tags and decode HTML entities from a string
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';

  // Remove HTML tags
  const withoutTags = html.replace(/<[^>]*>/g, '');

  // Decode HTML entities using browser API
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = withoutTags;
    const decoded = textarea.value;

    // Clean up extra whitespace and newlines
    return decoded.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
  }

  // Fallback for server-side rendering
  return withoutTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Truncate text to a specific length, preserving word boundaries
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;

  // Find the last space before the limit to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If the last space is reasonably close to the limit, use it
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
};

/**
 * Format text for social media sharing
 */
export const formatForSocialMedia = (title: string, description?: string) => {
  const cleanTitle = stripHtml(title);
  const cleanDescription = description ? stripHtml(description) : '';

  // For Twitter, we have ~280 characters total
  // Reserve space for URL (~23 chars) and separators
  const maxTitleLength = 120;
  const maxDescLength = 100;

  const formattedTitle = truncateText(cleanTitle, maxTitleLength);
  const formattedDescription = truncateText(cleanDescription, maxDescLength);

  return {
    title: formattedTitle,
    description: formattedDescription,
  };
};

/**
 * Create a clean excerpt from HTML content
 */
export const createExcerpt = (html: string, maxLength: number = 150): string => {
  const cleanText = stripHtml(html);
  return truncateText(cleanText, maxLength);
};
