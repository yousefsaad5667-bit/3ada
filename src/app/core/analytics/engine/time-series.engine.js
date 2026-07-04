"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyCounts = getDailyCounts;
exports.getWeeklyCounts = getWeeklyCounts;
exports.getMonthlyCounts = getMonthlyCounts;
exports.getTimeSeries = getTimeSeries;
var date_range_utils_1 = require("../utils/date-range.utils");
/**
 * Returns daily counts for the specified date range.
 * Zero-fills days with no activity.
 */
function getDailyCounts(records, dateRange) {
    var dates = (0, date_range_utils_1.iterateDateRange)(dateRange.from, dateRange.to);
    if (dates.length === 0)
        return [];
    var countsByDate = new Map();
    for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
        var record = records_1[_i];
        if (record.date >= dateRange.from && record.date <= dateRange.to) {
            countsByDate.set(record.date, (countsByDate.get(record.date) || 0) + record.count);
        }
    }
    return dates.map(function (date) {
        var d = new Date("".concat(date, "T00:00:00"));
        var day = d.getDate();
        var monthNamesAr = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        var month = monthNamesAr[d.getMonth()];
        return {
            date: date,
            label: "".concat(day, " ").concat(month),
            count: countsByDate.get(date) || 0
        };
    });
}
/**
 * Helper to get the ISO week number for a given date.
 */
function getISOWeekInfo(dateStr) {
    var date = new Date("".concat(dateStr, "T00:00:00"));
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1
    var diff = date.getTime() - week1.getTime();
    var weekNumber = 1 + Math.round(((diff / 86400000) - 3 + (week1.getDay() + 6) % 7) / 7);
    return { year: date.getFullYear(), week: weekNumber };
}
/**
 * Returns weekly counts for ISO weeks overlapping the date range.
 */
function getWeeklyCounts(records, dateRange) {
    var dates = (0, date_range_utils_1.iterateDateRange)(dateRange.from, dateRange.to);
    if (dates.length === 0)
        return [];
    // Identify all unique weeks in the range
    var weeks = new Map();
    for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
        var date = dates_1[_i];
        var _a = getISOWeekInfo(date), year = _a.year, week = _a.week;
        var key = "".concat(year, "-W").concat(String(week).padStart(2, '0'));
        if (!weeks.has(key)) {
            weeks.set(key, {
                date: date, // first date in range that falls into this week
                label: "\u0627\u0644\u0623\u0633\u0628\u0648\u0639 ".concat(week, " (").concat(year, ")"),
                count: 0
            });
        }
    }
    // Aggregate record counts
    for (var _b = 0, records_2 = records; _b < records_2.length; _b++) {
        var record = records_2[_b];
        if (record.date >= dateRange.from && record.date <= dateRange.to) {
            var _c = getISOWeekInfo(record.date), year = _c.year, week = _c.week;
            var key = "".concat(year, "-W").concat(String(week).padStart(2, '0'));
            var entry = weeks.get(key);
            if (entry) {
                entry.count += record.count;
            }
        }
    }
    return Array.from(weeks.values());
}
/**
 * Returns monthly counts overlapping the date range.
 */
function getMonthlyCounts(records, dateRange) {
    var dates = (0, date_range_utils_1.iterateDateRange)(dateRange.from, dateRange.to);
    if (dates.length === 0)
        return [];
    var monthNamesAr = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    var months = new Map();
    for (var _i = 0, dates_2 = dates; _i < dates_2.length; _i++) {
        var date = dates_2[_i];
        var d = new Date("".concat(date, "T00:00:00"));
        var year = d.getFullYear();
        var month = d.getMonth();
        var key = "".concat(year, "-").concat(String(month + 1).padStart(2, '0'));
        if (!months.has(key)) {
            months.set(key, {
                date: date, // first date in range that falls into this month
                label: "".concat(monthNamesAr[month], " ").concat(year),
                count: 0
            });
        }
    }
    // Aggregate record counts
    for (var _a = 0, records_3 = records; _a < records_3.length; _a++) {
        var record = records_3[_a];
        if (record.date >= dateRange.from && record.date <= dateRange.to) {
            var d = new Date("".concat(record.date, "T00:00:00"));
            if (isNaN(d.getTime()))
                continue; // invalid date
            var year = d.getFullYear();
            var month = d.getMonth();
            var key = "".concat(year, "-").concat(String(month + 1).padStart(2, '0'));
            var entry = months.get(key);
            if (entry) {
                entry.count += record.count;
            }
        }
    }
    return Array.from(months.values());
}
/**
 * Unified entry point for time series analytics.
 */
function getTimeSeries(records, dateRange, granularity) {
    switch (granularity) {
        case 'daily':
            return getDailyCounts(records, dateRange);
        case 'weekly':
            return getWeeklyCounts(records, dateRange);
        case 'monthly':
            return getMonthlyCounts(records, dateRange);
        default:
            return [];
    }
}
