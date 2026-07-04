"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryStatistics = getSummaryStatistics;
exports.getMovingAverage = getMovingAverage;
exports.getDistribution = getDistribution;
var date_range_utils_1 = require("../utils/date-range.utils");
/**
 * Computes summary statistics (total, average, median, min, max, stdDev)
 * for a given record set filtered to a date range.
 */
function getSummaryStatistics(records, dateRange) {
    var filteredRecords = records.filter(function (r) { return r.date >= dateRange.from && r.date <= dateRange.to; });
    var daysInRange = (0, date_range_utils_1.numberOfDays)(dateRange.from, dateRange.to);
    if (filteredRecords.length === 0) {
        return {
            total: 0,
            recordCount: 0,
            dailyAverage: 0,
            median: 0,
            min: 0,
            max: 0,
            stdDev: 0
        };
    }
    var counts = filteredRecords.map(function (r) { return r.count; }).sort(function (a, b) { return a - b; });
    var total = counts.reduce(function (sum, val) { return sum + val; }, 0);
    var recordCount = counts.length;
    var min = counts[0];
    var max = counts[counts.length - 1];
    var median = 0;
    if (recordCount % 2 === 0) {
        median = (counts[recordCount / 2 - 1] + counts[recordCount / 2]) / 2;
    }
    else {
        median = counts[Math.floor(recordCount / 2)];
    }
    var dailyAverage = daysInRange > 0 ? total / daysInRange : 0;
    var averagePerRecord = total / recordCount;
    var sumOfSquaredDifferences = counts.reduce(function (sum, val) { return sum + Math.pow(val - averagePerRecord, 2); }, 0);
    // Using sample standard deviation (N - 1) when N > 1, else 0
    var stdDev = recordCount > 1 ? Math.sqrt(sumOfSquaredDifferences / (recordCount - 1)) : 0;
    return {
        total: total,
        recordCount: recordCount,
        dailyAverage: Number(dailyAverage.toFixed(2)),
        median: median,
        min: min,
        max: max,
        stdDev: Number(stdDev.toFixed(2))
    };
}
/**
 * Computes a simple moving average over a time series.
 * @param series The daily or weekly time series
 * @param windowSize The smoothing window size (default 7)
 */
function getMovingAverage(series, windowSize) {
    if (windowSize === void 0) { windowSize = 7; }
    if (series.length === 0)
        return [];
    if (windowSize < 1)
        windowSize = 1;
    return series.map(function (entry, index) {
        // For early entries where we don't have a full window, we use whatever we have (expanding window)
        var startIndex = Math.max(0, index - windowSize + 1);
        var windowSlice = series.slice(startIndex, index + 1);
        var sum = windowSlice.reduce(function (acc, val) { return acc + val.count; }, 0);
        var average = sum / windowSlice.length;
        return __assign(__assign({}, entry), { count: Number(average.toFixed(2)) });
    });
}
/**
 * Computes the distribution of a numeric field.
 * For `urgeLevel`: 10 buckets (1-10).
 * For `count`: `bucketCount` equal-width buckets from min to max.
 */
function getDistribution(records, field, bucketCount) {
    if (bucketCount === void 0) { bucketCount = 10; }
    if (records.length === 0)
        return [];
    var values = [];
    for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
        var r = records_1[_i];
        if (field === 'urgeLevel') {
            if (r.urgeLevel !== null && r.urgeLevel !== undefined) {
                values.push(r.urgeLevel);
            }
        }
        else {
            values.push(r.count);
        }
    }
    if (values.length === 0)
        return [];
    var total = values.length;
    if (field === 'urgeLevel') {
        // Fixed 1-10 buckets
        var result = Array.from({ length: 10 }, function (_, i) { return ({
            label: String(i + 1),
            min: i + 1,
            max: i + 1,
            count: 0,
            percentage: 0
        }); });
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var val = values_1[_a];
            if (val >= 1 && val <= 10) {
                result[val - 1].count++;
            }
        }
        return result.map(function (bucket) { return (__assign(__assign({}, bucket), { percentage: Number(((bucket.count / total) * 100).toFixed(1)) })); });
    }
    else {
        // Equal-width buckets for count
        var minVal_1 = Math.min.apply(Math, values);
        var maxVal_1 = Math.max.apply(Math, values);
        if (minVal_1 === maxVal_1) {
            return [{
                    label: "".concat(minVal_1),
                    min: minVal_1,
                    max: maxVal_1,
                    count: total,
                    percentage: 100
                }];
        }
        var range = maxVal_1 - minVal_1;
        // ensure bucket size is at least 1 since count is an integer
        var bucketSize_1 = Math.max(1, Math.ceil(range / bucketCount));
        // adjust bucketCount if bucketSize is 1 to avoid many empty trailing buckets
        if (bucketSize_1 === 1) {
            bucketCount = range + 1;
        }
        var buckets = Array.from({ length: bucketCount }, function (_, i) {
            var bMin = minVal_1 + (i * bucketSize_1);
            var bMax = bMin + bucketSize_1 - 1;
            // The last bucket might need to just catch the max value exactly
            if (i === bucketCount - 1) {
                bMax = Math.max(bMax, maxVal_1);
            }
            return {
                label: bMin === bMax ? "".concat(bMin) : "".concat(bMin, "-").concat(bMax),
                min: bMin,
                max: bMax,
                count: 0,
                percentage: 0
            };
        });
        for (var _b = 0, values_2 = values; _b < values_2.length; _b++) {
            var val = values_2[_b];
            // Find which bucket this value belongs to
            for (var i = 0; i < buckets.length; i++) {
                if (val >= buckets[i].min && val <= buckets[i].max) {
                    buckets[i].count++;
                    break;
                }
            }
        }
        return buckets.map(function (bucket) { return (__assign(__assign({}, bucket), { percentage: Number(((bucket.count / total) * 100).toFixed(1)) })); });
    }
}
