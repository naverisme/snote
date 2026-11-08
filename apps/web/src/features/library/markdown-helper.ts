import React from 'react';

/**
 * CUXB-07 / LIB-09 / LIB-10 Markdown list auto-completion and formatting helper.
 */

export interface MarkdownLineResult {
  newValue: string;
  newCursorPos: number;
  handled: boolean;
}

/**
 * Pure calculation for Enter key in a Markdown textarea with list auto-continuation.
 * - '- ' continues bullet list, Enter on empty bullet line ends list.
 * - '1. ' continues numbered list (increments number), Enter on empty number ends list.
 */
export function calculateListEnter(
  value: string,
  selectionStart: number,
): MarkdownLineResult {
  const beforePos = value.substring(0, selectionStart);
  const afterPos = value.substring(selectionStart);
  const lines = beforePos.split('\n');
  const currentLine = lines[lines.length - 1];

  // 1. Bullet list check: "- "
  const bulletMatch = currentLine.match(/^(\s*)-\s(.*)$/);
  if (bulletMatch) {
    const indent = bulletMatch[1];
    const textAfterBullet = bulletMatch[2];
    if (textAfterBullet.trim() === '') {
      // Empty bullet item -> end list (remove current bullet prefix)
      const prefixLen = currentLine.length;
      const newValue = value.substring(0, selectionStart - prefixLen) + '\n' + afterPos;
      const newCursorPos = selectionStart - prefixLen + 1;
      return { newValue, newCursorPos, handled: true };
    }
    // Continue bullet list
    const continuation = `\n${indent}- `;
    const newValue = beforePos + continuation + afterPos;
    const newCursorPos = selectionStart + continuation.length;
    return { newValue, newCursorPos, handled: true };
  }

  // 2. Numbered list check: "1. " or "N. "
  const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s(.*)$/);
  if (numberMatch) {
    const indent = numberMatch[1];
    const num = parseInt(numberMatch[2], 10);
    const textAfterNumber = numberMatch[3];
    if (textAfterNumber.trim() === '') {
      // Empty numbered item -> end list (remove current number prefix)
      const prefixLen = currentLine.length;
      const newValue = value.substring(0, selectionStart - prefixLen) + '\n' + afterPos;
      const newCursorPos = selectionStart - prefixLen + 1;
      return { newValue, newCursorPos, handled: true };
    }
    // Continue numbered list with next number
    const continuation = `\n${indent}${num + 1}. `;
    const newValue = beforePos + continuation + afterPos;
    const newCursorPos = selectionStart + continuation.length;
    return { newValue, newCursorPos, handled: true };
  }

  return { newValue: value, newCursorPos: selectionStart, handled: false };
}

/**
 * Normalizes URL string to have https:// if protocol is missing (LIB-10)
 */
export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Regular expression to identify URLs in text.
 */
export const URL_REGEX = /(https?:\/\/[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;

/**
 * Extracts all URLs from text.
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  return matches.map((m) => normalizeUrl(m));
}

/**
 * Returns the first URL for preview card generation (CUXB-07, LIB-09/10/18)
 */
export function getFirstUrl(text: string): string | null {
  const urls = extractUrls(text);
  return urls.length > 0 ? urls[0] : null;
}
