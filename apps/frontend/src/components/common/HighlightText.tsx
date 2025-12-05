import React from "react";

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

/**
 * Component to highlight matching text within a string
 * Used for displaying search results with highlighted query terms
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className = "",
}) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters in the highlight string
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create regex to match all occurrences (case insensitive)
  const regex = new RegExp(`(${escapedHighlight})`, "gi");

  // Split text by matching parts
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = regex.test(part);
        // Reset regex lastIndex after each test
        regex.lastIndex = 0;

        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-200 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};
