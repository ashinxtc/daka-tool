import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { readStoredString, readStoredValue } from '../src/utils/storedValues.js';

test('stored string preferences accept current JSON, old plain strings, and empty values', () => {
    for(const [raw,value] of [['"1234"','1234'],['1234','1234'],['""',''],['', ''],[null,''],['"gold"','gold'],['gold','gold']]) {
        assert.equal(readStoredString(raw),value);assert.equal(readStoredValue(raw,''),value);
    }
});
test('actual direct-verification handler accepts correct passwords and rejects wrong passwords', () => {
    const source=fs.readFileSync(new URL('../src/components/modals/ExchangePanel.jsx',import.meta.url),'utf8');
    const handler=source.slice(source.indexOf('const handleParentDirectVerify = () => {'),source.indexOf('// 撤销待核销申请'));
    for(const [stored,input,success] of [['"1234"','1234',true],['1234','1234',true],['"1234"','wrong',false],['""','4567',true],[null,'4567',true],['""','1234',false]]) {
        const toasts=[];let history={};
        vm.runInNewContext(handler+'handleParentDirectVerify();',{
            readStoredString,storage:{getItem:()=>stored,setItem(){},removeItem(){}},
            applyResult:{applyId:'test',cnyAmount:5,goldAmount:500,verifyCode:'4567',isOffline:true},
            activeChild:'孩子',targetCny:5,neededGold:500,window:{prompt:()=>input},
            showToast:(...args)=>toasts.push(args),setWheelHistory:f=>history=f(history),setExchangeRecords:f=>f([]),
            mergeExchangeRecords:(_,entries)=>entries,setApplyResult(){},refreshRecords(){}
        });
        assert.equal(toasts.at(-1)[0],success?'success':'error');
        assert.equal(Object.keys(history).length,success?1:0);
    }
});
