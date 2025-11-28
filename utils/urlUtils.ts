/**
 * Encodes text to Base64 safely handling UTF-8 strings (like Chinese).
 */
export const utf8_to_b64 = (str: string): string => {
  return window.btoa(encodeURIComponent(str));
};

/**
 * Decodes Base64 to UTF-8 string safely.
 */
export const b64_to_utf8 = (str: string): string => {
  return decodeURIComponent(window.atob(str));
};

/**
 * Generates the full player URL.
 */
export const generatePlayerUrl = (word: string, id: number, gameId: string): string => {
  // Use window.location.href as the single source of truth.
  // Split by '#' to discard any existing hash fragments.
  // Split by '?' to discard query parameters (optional, but cleaner for new session links).
  // This avoids issues where origin + pathname concatenation fails due to proxy rewrites (e.g. pathname starting with 'https').
  
  const rawHref = window.location.href;
  
  // Take everything before the hash
  let baseUrl = rawHref.split('#')[0];
  
  // Also remove query parameters to ensure a clean base URL for the player
  // (unless your environment relies on query params for routing, but usually # comes after)
  baseUrl = baseUrl.split('?')[0];

  // Remove trailing slash to ensure consistent appending of /#/
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  // If the base URL somehow lost the protocol (unlikely with href), ensure it's there? 
  // href always includes protocol.

  // IMPORTANT: encodeURIComponent is required because Base64 contains '+', '/', '='
  const encodedWord = encodeURIComponent(utf8_to_b64(word));
  
  // Construct the final URL. 
  // We use /#/ to ensure the hash is treated as root of the hash routing
  return `${baseUrl}/#/player?w=${encodedWord}&id=${id}&gid=${gameId}`;
};
