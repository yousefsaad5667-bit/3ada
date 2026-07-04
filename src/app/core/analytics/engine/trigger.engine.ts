import { RelapseRecord } from '../../models/relapse-record.model';
import { TriggerEntry } from '../models/analytics.types';

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
function extractKeywords(text: string): string[] {
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

/**
 * Analyzes triggers from reason and notes fields.
 */
export function getTriggerAnalysis(records: RelapseRecord[]): TriggerEntry[] {
  const keywordStats = new Map<string, { count: number; totalUrge: number; urgeRecords: number }>();

  for (const record of records) {
    const combinedText = [record.reason || '', record.notes || ''].join(' ').trim();
    if (!combinedText) continue;

    const keywords = extractKeywords(combinedText);
    
    // De-duplicate keywords within the same record so a record only counts once per keyword
    const uniqueKeywords = new Set(keywords);

    for (const kw of uniqueKeywords) {
      if (!keywordStats.has(kw)) {
        keywordStats.set(kw, { count: 0, totalUrge: 0, urgeRecords: 0 });
      }
      
      const stats = keywordStats.get(kw)!;
      stats.count += record.count; // Weight by record count
      
      if (record.urgeLevel !== null && record.urgeLevel !== undefined) {
        // Multiply urge level by count for weighted average
        stats.totalUrge += (record.urgeLevel * record.count);
        stats.urgeRecords += record.count;
      }
    }
  }

  const result: TriggerEntry[] = [];
  
  for (const [keyword, stats] of keywordStats.entries()) {
    result.push({
      keyword,
      count: stats.count,
      avgUrge: stats.urgeRecords > 0 ? Number((stats.totalUrge / stats.urgeRecords).toFixed(1)) : null
    });
  }

  // Sort descending by count
  return result.sort((a, b) => b.count - a.count);
}
