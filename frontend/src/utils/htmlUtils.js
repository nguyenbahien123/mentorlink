/**
 * Sanitize HTML content for safe display
 * This is a basic sanitization - for production, consider using DOMPurify
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Basic sanitization - remove script tags and other potentially dangerous elements
  const cleanHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/<applet[\s\S]*?<\/applet>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+='[^']*'/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: urls
    
  return cleanHtml;
};

/**
 * Extract plain text from HTML content for preview/summary
 */
export const extractTextFromHtml = (html, maxLength = 200) => {
  if (!html) return '';
  
  // Create a temporary element to extract text content
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const textContent = temp.textContent || temp.innerText || '';
  
  if (maxLength && textContent.length > maxLength) {
    return textContent.substring(0, maxLength) + '...';
  }
  
  return textContent;
};

/**
 * Check if content appears to be HTML (contains HTML tags)
 */
export const isHtmlContent = (content) => {
  if (!content) return false;
  return /<[^>]+>/.test(content);
};