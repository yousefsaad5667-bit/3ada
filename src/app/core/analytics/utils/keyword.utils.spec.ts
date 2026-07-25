import { extractKeywords } from './keyword.utils';

describe('Keyword Utils - extractKeywords', () => {
  it('should return empty array for null or empty text', () => {
    expect(extractKeywords('')).toEqual([]);
    expect(extractKeywords('   ')).toEqual([]);
  });

  it('should filter out Arabic stop words', () => {
    const text = 'في العمل مع بعض الأصدقاء من أجل هذا المشروع';
    const keywords = extractKeywords(text);
    expect(keywords).toContain('العمل');
    expect(keywords).toContain('الأصدقاء');
    expect(keywords).toContain('أجل');
    expect(keywords).toContain('المشروع');
    expect(keywords).not.toContain('في');
    expect(keywords).not.toContain('مع');
    expect(keywords).not.toContain('بعض');
    expect(keywords).not.toContain('من');
    expect(keywords).not.toContain('هذا');
  });

  it('should filter out short tokens (length <= 1)', () => {
    const text = 'و ف ب ل ك أ العمل';
    const keywords = extractKeywords(text);
    expect(keywords).toEqual(['العمل']);
  });

  it('should strip punctuation and special characters', () => {
    const text = 'توتر، تعب! قلق... إجهاد؟';
    const keywords = extractKeywords(text);
    expect(keywords).toEqual(['توتر', 'تعب', 'قلق', 'إجهاد']);
  });
});
