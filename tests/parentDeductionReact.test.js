import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { useState } from 'react';
import { create, act } from 'react-test-renderer';
import { applyParentDeduction, nextDeductionNotice } from '../src/utils/parentDeductions.js';

test('React batches original single-notice setters and loses earlier notifications', () => {
    let dispatch;
    function Original() {
        const [notice, setNotice] = useState(null);
        dispatch = setNotice;
        return React.createElement('span', null, notice?.reason || '');
    }
    let view;
    act(() => { view = create(React.createElement(Original)); });
    act(() => { [{ reason: '第一笔' }, { reason: '第二笔' }].map(dispatch); });
    assert.equal(view.toJSON().children[0], '第二笔');
    act(() => { view.unmount(); });
});

test('receipt queue renders all notices across batching, acknowledgement and remount', () => {
    let receipts = {}, history = {};
    for (const [id, amount] of [[1, 10], [2, 20]]) {
        ({ receipts, history } = applyParentDeduction({ action: { id, amount, reason: `事由${id}`, timestamp: id },
            child: '孩子', receipts, history, balance: id === 1 ? 100 : 90 }));
    }
    let acknowledge;
    function Fixed({ initial }) {
        const [state, setState] = useState(initial);
        const notice = nextDeductionNotice(state, '孩子');
        acknowledge = () => setState(prev => {
            const next = { ...prev, [notice.id]: { ...notice, acknowledged: true } };
            receipts = JSON.parse(JSON.stringify(next));
            return next;
        });
        return React.createElement('span', null, notice ? `${notice.amount}/${notice.reason}/${notice.balanceAfter}` : '');
    }
    let view;
    act(() => { view = create(React.createElement(Fixed, { initial: receipts })); });
    assert.equal(view.toJSON().children[0], '10/事由1/90');
    act(() => { acknowledge(); });
    assert.equal(view.toJSON().children[0], '20/事由2/70');
    act(() => { view.unmount(); });
    act(() => { view = create(React.createElement(Fixed, { initial: receipts })); });
    assert.equal(view.toJSON().children[0], '20/事由2/70');
    act(() => { acknowledge(); });
    assert.equal(view.toJSON().children, null);
    act(() => { view.unmount(); });
});
