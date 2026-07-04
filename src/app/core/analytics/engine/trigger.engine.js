"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTriggerAnalysis = getTriggerAnalysis;
// Arabic stop words and common noise words to filter out
var ARABIC_STOP_WORDS = new Set([
    'في', 'من', 'إلى', 'على', 'مع', 'هذا', 'هذه', 'لا', 'لم', 'لن',
    'كان', 'يكون', 'عن', 'بين', 'أو', 'ثم', 'حتى', 'أن', 'إن', 'ما',
    'يا', 'بما', 'كما', 'كل', 'بعض', 'أي', 'قد', 'لقد', 'هل', 'كيف',
    'متى', 'أين', 'ليس', 'بل', 'لكن', 'لأن', 'ذلك', 'تلك', 'الذي', 'التي',
    'و', 'ف', 'ب', 'ل', 'ك', 'أم'
]);
/**
 * Normalizes text and extracts valid Arabic keywords.
 */
function extractKeywords(text) {
    if (!text)
        return [];
    // Remove punctuation and non-Arabic/English letters, split by whitespace
    var tokens = text
        .replace(/[^\u0621-\u064A\w\s]/g, ' ')
        .split(/\s+/);
    return tokens
        .map(function (t) { return t.trim(); })
        // Keep words with > 1 character and not in stop words
        .filter(function (t) { return t.length > 1 && !ARABIC_STOP_WORDS.has(t); });
}
/**
 * Analyzes triggers from reason and notes fields.
 */
function getTriggerAnalysis(records) {
    var keywordStats = new Map();
    for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
        var record = records_1[_i];
        var combinedText = [record.reason || '', record.notes || ''].join(' ').trim();
        if (!combinedText)
            continue;
        var keywords = extractKeywords(combinedText);
        // De-duplicate keywords within the same record so a record only counts once per keyword
        var uniqueKeywords = new Set(keywords);
        for (var _a = 0, uniqueKeywords_1 = uniqueKeywords; _a < uniqueKeywords_1.length; _a++) {
            var kw = uniqueKeywords_1[_a];
            if (!keywordStats.has(kw)) {
                keywordStats.set(kw, { count: 0, totalUrge: 0, urgeRecords: 0 });
            }
            var stats = keywordStats.get(kw);
            stats.count += record.count; // Weight by record count
            if (record.urgeLevel !== null && record.urgeLevel !== undefined) {
                // Multiply urge level by count for weighted average
                stats.totalUrge += (record.urgeLevel * record.count);
                stats.urgeRecords += record.count;
            }
        }
    }
    var result = [];
    for (var _b = 0, _c = keywordStats.entries(); _b < _c.length; _b++) {
        var _d = _c[_b], keyword = _d[0], stats = _d[1];
        result.push({
            keyword: keyword,
            count: stats.count,
            avgUrge: stats.urgeRecords > 0 ? Number((stats.totalUrge / stats.urgeRecords).toFixed(1)) : null
        });
    }
    // Sort descending by count
    return result.sort(function (a, b) { return b.count - a.count; });
}
