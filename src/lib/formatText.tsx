import React from 'react';

/**
 * Safely parses bold patterns (**text**, <strong>text</strong>, <b>text</b>)
 * and returns React elements with styled strong tags.
 */
export function renderFormattedText(
  text: string,
  strongClassName = 'font-bold text-ink'
): React.ReactNode {
  if (!text) return null;

  // Match **bold**, <strong>bold</strong>, or <b>bold</b>
  const regex = /(\*\*.*?\*\*|<strong>.*?<\/strong>|<b>.*?<\/b>)/g;
  const parts = text.split(regex);

  // If no formatting tags were found, return the plain string
  if (parts.length === 1 && !parts[0].startsWith('**') && !parts[0].startsWith('<')) {
    return text;
  }

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className={strongClassName}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
      return (
        <strong key={index} className={strongClassName}>
          {part.slice(8, -9)}
        </strong>
      );
    }
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return (
        <strong key={index} className={strongClassName}>
          {part.slice(3, -4)}
        </strong>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
