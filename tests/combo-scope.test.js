import test from 'node:test';
import assert from 'node:assert/strict';
import { isHabitTask, isReadingTask, isCalendarTask } from '../src/utils/checkinSync.js';
import { calculateComboBonus, getComboInfo } from '../src/utils/gamification.js';

test('Task Scope: correctly classifies habit, reading, and calendar tasks', () => {
    // 1. 常规日历打卡任务
    const mathTask = { id: 'task-1', name: '数学作业', frequencyType: 'daily_must' };
    const englishTask = { id: 'task-2', name: '英语背诵', frequencyType: 'weekly_optional' };
    const pianoTask = { id: 'task-3', name: '钢琴练习', frequencyType: 'count' };
    const legacyTask = { id: 'task-4', name: '整理书桌' }; // 历史无 frequencyType 的普通任务

    assert.equal(isCalendarTask(mathTask), true);
    assert.equal(isHabitTask(mathTask), false);
    assert.equal(isReadingTask(mathTask), false);

    assert.equal(isCalendarTask(englishTask), true);
    assert.equal(isCalendarTask(pianoTask), true);
    assert.equal(isCalendarTask(legacyTask), true);

    // 2. 习惯类任务（frequencyType: 'habit' 或带有 habit 标识）
    const habitTask1 = { id: 'habit-1', name: '早睡早起', frequencyType: 'habit' };
    const habitTask2 = { id: 'habit-2', name: '眼保健操', isHabit: true };
    const habitTask3 = { id: 'habit-3', name: '按时喝水', habitConfig: { isHabit: true } };

    assert.equal(isHabitTask(habitTask1), true);
    assert.equal(isCalendarTask(habitTask1), false);
    assert.equal(isReadingTask(habitTask1), false);

    assert.equal(isHabitTask(habitTask2), true);
    assert.equal(isCalendarTask(habitTask2), false);

    assert.equal(isHabitTask(habitTask3), true);
    assert.equal(isCalendarTask(habitTask3), false);

    // 3. 伴读类任务（frequencyType: 'reading' 或 readingConfig.isReading）
    const readingTask1 = { id: 'read-1', name: '每日伴读', frequencyType: 'reading' };
    const readingTask2 = { id: 'read-2', name: '西游记精读', readingConfig: { isReading: true, bookTitle: '西游记' } };

    assert.equal(isReadingTask(readingTask1), true);
    assert.equal(isCalendarTask(readingTask1), false);
    assert.equal(isHabitTask(readingTask1), false);

    assert.equal(isReadingTask(readingTask2), true);
    assert.equal(isCalendarTask(readingTask2), false);

    // 4. 空任务防御
    assert.equal(isCalendarTask(null), false);
    assert.equal(isHabitTask(null), false);
    assert.equal(isReadingTask(null), false);
});

test('Calendar Scope: habit and reading tasks are excluded from calendar column combo and liquid fill', () => {
    // 模拟孩子当天的全部进行中任务列表
    const allChildTasks = [
        { id: 'math', name: '数学作业', frequencyType: 'daily_must', days: [0, 1, 2, 3, 4, 5, 6] },
        { id: 'english', name: '英语背诵', frequencyType: 'daily_must', days: [0, 1, 2, 3, 4, 5, 6] },
        { id: 'habit_sleep', name: '早睡早起', frequencyType: 'habit' },
        { id: 'read_book', name: '每日伴读', frequencyType: 'reading', readingConfig: { isReading: true } }
    ];

    // 筛选出日历任务（应该只包含数学与英语）
    const calendarTasks = allChildTasks.filter(isCalendarTask);
    assert.equal(calendarTasks.length, 2);
    assert.deepEqual(calendarTasks.map(t => t.id), ['math', 'english']);

    // 模拟用户只完成了习惯打卡和阅读打卡，未完成日历打卡
    const checkinState = {
        habit_sleep: { '2026-10-19': 1 },
        read_book: { '2026-10-19': 30 }
    };

    // 计算日历当天完成数
    const today = '2026-10-19';
    const calendarDoneCount = calendarTasks.filter(t => !!checkinState[t.id]?.[today]).length;
    assert.equal(calendarDoneCount, 0, '习惯和阅读打卡绝不能算进日历完成数中');

    // 验证日历光晕与连击档位：0 完成处于蓄力中，无光柱与连击特效
    const comboInfo = getComboInfo(calendarDoneCount, calendarTasks.length);
    assert.equal(comboInfo.tier, 'none');
    assert.equal(comboInfo.title, '蓄力中');
    assert.equal(comboInfo.auraType, 'none');

    // 当用户完成 1 项日历打卡（如数学）
    checkinState['math'] = { '2026-10-19': 1 };
    const updatedDoneCount = calendarTasks.filter(t => !!checkinState[t.id]?.[today]).length;
    assert.equal(updatedDoneCount, 1);

    const combo1 = getComboInfo(updatedDoneCount, calendarTasks.length);
    assert.equal(combo1.tier, 'start');
    assert.equal(combo1.title, '旗开得胜');
    assert.equal(combo1.auraType, 'white');

    // 完成全部 2 项日历打卡：达到大满贯全勤
    checkinState['english'] = { '2026-10-19': 1 };
    const fullDoneCount = calendarTasks.filter(t => !!checkinState[t.id]?.[today]).length;
    assert.equal(fullDoneCount, 2);

    const comboFull = getComboInfo(fullDoneCount, calendarTasks.length);
    assert.equal(comboFull.tier, 'perfect');
    assert.equal(comboFull.title, '大满贯全勤');
});
