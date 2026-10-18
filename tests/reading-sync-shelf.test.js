import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    mergeReadingTaskItem,
    mergeReadingHistoryList,
    mergeReadingShelvedList,
    isBookTombstoned
} from '../src/utils/readingSync.js';

test('reading task sync: iPad with newer timestamp wins over PC stale task', () => {
    const pcTask = {
        id: 'read-1',
        name: '每日阅读打卡',
        updatedAt: 1000,
        readingConfig: {
            isReading: true,
            bookTitle: '西游记',
            currentProgress: 50,
            totalPages: 100,
            updatedAt: 1000
        }
    };

    const ipadTask = {
        id: 'read-1',
        name: '每日阅读打卡',
        updatedAt: 2000,
        readingConfig: {
            isReading: true,
            bookTitle: '西游记',
            currentProgress: 100,
            totalPages: 100,
            needsNextBook: true,
            updatedAt: 2000
        }
    };

    // When syncing on PC (pcTask is local lt, ipadTask is cloud ct)
    const mergedOnPc = mergeReadingTaskItem(pcTask, ipadTask);
    assert.equal(mergedOnPc.readingConfig.currentProgress, 100);
    assert.equal(mergedOnPc.readingConfig.needsNextBook, true);

    // When syncing on iPad (ipadTask is local lt, pcTask is cloud ct)
    const mergedOnIpad = mergeReadingTaskItem(ipadTask, pcTask);
    assert.equal(mergedOnIpad.readingConfig.currentProgress, 100);
    assert.equal(mergedOnIpad.readingConfig.needsNextBook, true);
});

test('reading task sync fallback: completed book wins even if timestamps are tied or missing', () => {
    const pcTask = {
        id: 'read-1',
        readingConfig: {
            isReading: true,
            bookTitle: '三国演义',
            currentProgress: 80,
            totalPages: 120
        }
    };

    const ipadTask = {
        id: 'read-1',
        readingConfig: {
            isReading: true,
            bookTitle: '三国演义',
            currentProgress: 120,
            totalPages: 120,
            needsNextBook: true
        }
    };

    const merged = mergeReadingTaskItem(pcTask, ipadTask);
    assert.equal(merged.readingConfig.currentProgress, 120);
    assert.equal(merged.readingConfig.needsNextBook, true);
});

test('reading task sync: combines reading notes from both devices without duplication', () => {
    const pcTask = {
        id: 'read-1',
        updatedAt: 1500,
        readingConfig: {
            isReading: true,
            bookTitle: '哈利波特',
            notes: [
                { text: '金句1: 魔法觉醒', date: '2026-10-15', progress: 20 },
                { text: '金句2: 分院帽', date: '2026-10-16', progress: 40 }
            ]
        }
    };

    const ipadTask = {
        id: 'read-1',
        updatedAt: 2000,
        readingConfig: {
            isReading: true,
            bookTitle: '哈利波特',
            notes: [
                { text: '金句2: 分院帽', date: '2026-10-16', progress: 40 },
                { text: '金句3: 魁地奇比赛', date: '2026-10-17', progress: 80 }
            ]
        }
    };

    const merged = mergeReadingTaskItem(pcTask, ipadTask);
    assert.equal(merged.readingConfig.notes.length, 3);
    const noteTexts = merged.readingConfig.notes.map(n => n.text);
    assert.deepEqual(noteTexts.sort(), ['金句1: 魔法觉醒', '金句2: 分院帽', '金句3: 魁地奇比赛']);
});

test('bookshelf history: deduplicates repeated check-ins of the same book and merges notes', () => {
    const localHistory = [
        {
            id: 'book-1',
            bookTitle: '昆虫记',
            totalPages: 200,
            completedDate: '2026-10-10',
            quotes: [{ text: '绿蚱蜢的鸣叫', date: '2026-10-10' }]
        }
    ];

    const cloudHistory = [
        {
            id: 'book-2-duplicate',
            bookTitle: '昆虫记',
            totalPages: 200,
            completedDate: '2026-10-12',
            quotes: [
                { text: '绿蚱蜢的鸣叫', date: '2026-10-10' },
                { text: '红蚂蚁的远征', date: '2026-10-12' }
            ]
        }
    ];

    const merged = mergeReadingHistoryList(localHistory, cloudHistory, {}, Date.now());
    assert.equal(merged.length, 1, 'Duplicate book should be combined into one single entry');
    assert.equal(merged[0].bookTitle, '昆虫记');
    assert.equal(merged[0].quotes.length, 2, 'Quotes from both completions should be merged');
});

test('tombstone filtering: deleted books are never resurrected by sync', () => {
    const now = Date.now();
    const childTombstones = {
        'book-deleted-1': now - 1000, // deleted 1s ago
        '格林童话': now - 5000       // deleted by title 5s ago
    };

    assert.equal(isBookTombstoned({ id: 'book-deleted-1', bookTitle: '安徒生童话' }, childTombstones, now), true);
    assert.equal(isBookTombstoned({ id: 'book-safe-2', bookTitle: '格林童话' }, childTombstones, now), true);
    assert.equal(isBookTombstoned({ id: 'book-safe-3', bookTitle: '小王子' }, childTombstones, now), false);

    const cloudHistory = [
        { id: 'book-deleted-1', bookTitle: '安徒生童话' },
        { id: 'book-safe-2', bookTitle: '格林童话' },
        { id: 'book-safe-3', bookTitle: '小王子' }
    ];

    const merged = mergeReadingHistoryList([], cloudHistory, childTombstones, now);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].bookTitle, '小王子');
});

test('tombstone expiry: tombstones older than 30 days expire', () => {
    const now = Date.now();
    const thirtyOneDaysMs = 31 * 86400000;
    const childTombstones = {
        'book-old': now - thirtyOneDaysMs
    };

    assert.equal(isBookTombstoned({ id: 'book-old', bookTitle: '旧书' }, childTombstones, now), false);
});

test('shelved books: deduplicates and filters tombstones', () => {
    const now = Date.now();
    const childTombstones = {
        'shelved-to-delete': now
    };

    const localShelved = [
        { id: 's1', bookTitle: '草房子', currentProgress: 60, totalPages: 150 },
        { id: 'shelved-to-delete', bookTitle: '放弃读的书', currentProgress: 10 }
    ];

    const cloudShelved = [
        { id: 's2', bookTitle: '草房子', currentProgress: 90, totalPages: 150 }
    ];

    const merged = mergeReadingShelvedList(localShelved, cloudShelved, childTombstones, now);
    assert.equal(merged.length, 1, 'Tombstoned book excluded, same book deduplicated');
    assert.equal(merged[0].bookTitle, '草房子');
    assert.equal(merged[0].currentProgress, 90, 'Highest reading progress preserved');
});
