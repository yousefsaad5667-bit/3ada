// Arabic stop words and common noise words to filter out
const ARABIC_STOP_WORDS = new Set([
  'في', 'من', 'إلى', 'على', 'مع', 'هذا', 'هذه', 'لا', 'لم', 'لن', 
  'كان', 'يكون', 'عن', 'بين', 'أو', 'ثم', 'حتى', 'أن', 'إن', 'ما', 
  'يا', 'بما', 'كما', 'كل', 'بعض', 'أي', 'قد', 'لقد', 'هل', 'كيف',
  'متى', 'أين', 'ليس', 'بل', 'لكن', 'لأن', 'ذلك', 'تلك', 'الذي', 'التي',
  'و', 'ف', 'ب', 'ل', 'ك', 'أم'
]);

/**
 * Normalizes text and extracts valid Arabic keywords.
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Remove punctuation and non-Arabic/English letters, split by whitespace
  const tokens = text
    .replace(/[^\u0621-\u064A\w\s]/g, ' ')
    .split(/\s+/);
    
  return tokens
    .map(t => t.trim())
    // Keep words with > 1 character and not in stop words
    .filter(t => t.length > 1 && !ARABIC_STOP_WORDS.has(t));
}
