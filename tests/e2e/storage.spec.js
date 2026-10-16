import { test, expect } from '@playwright/test';

const fixture = '/tests/fixtures/storage.html';
const snapshot = { version:'2.0', _allSyncData:{
    app_profiles_v1:JSON.stringify([{id:'child',name:'孩子',theme:'rose'}]),
    app_tasks_v2:JSON.stringify({孩子:[{id:'math',name:'数学',frequencyType:'daily_must',reward:1}]}),
    app_wheel_history:JSON.stringify({'孩子-BASE-1792000000000':100}),
    app_evil_auto_trigger:'false',app_gamification_config_v1:'{"firstBloodEnabled":false}',
    app_notified_levels:'{"孩子":1}',app_weekend_settings:'{"enabled":false}'
}};
test.beforeEach(async({page})=>{
    await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
});
async function importFile(page, button, data) {
    const chooser=page.waitForEvent('filechooser');
    await button.click();
    await (await chooser).setFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
}
test('slow startup keeps the real App and cloud sync inactive until saved tasks load',async({page})=>{
    await page.goto(fixture);await page.getByRole('button',{name:'修改设置和任务'}).click();
    await page.evaluate(async data=>{for(const[k,v]of Object.entries(data))window.storage.setItem(k,v);await window.storage.flush();},snapshot._allSyncData);
    await page.addInitScript(()=>{
        const open=IDBFactory.prototype.open;
        IDBFactory.prototype.open=function(...args){
            const req={};setTimeout(()=>{const actual=open.apply(this,args);for(const name of ['onsuccess','onerror','onblocked','onupgradeneeded']) actual[name]=e=>req[name]?.(e);},2500);return req;
        };
    });
    await page.goto('/');
    await expect(page.getByRole('heading',{name:'正在读取你的打卡数据'})).toBeAttached();
    await expect(page.locator('main')).toHaveCount(0);
    await expect(page.locator('main')).toBeAttached();
    expect(await page.evaluate(()=>JSON.parse(window.storage.getItem('app_tasks_v2')).孩子[0].id)).toBe('math');
});
test('read failure shows retry instead of a new empty family, and retry recovers data',async({page})=>{
    await page.goto(fixture);await page.getByRole('button',{name:'修改设置和任务'}).click();
    await page.evaluate(async()=>{await window.storage.flush();localStorage.setItem('_e2e_fail_reads','1')});
    await page.addInitScript(()=>{
        if(!localStorage.getItem('_e2e_fail_reads'))return;
        const transaction=IDBDatabase.prototype.transaction;
        IDBDatabase.prototype.transaction=function(...args){if(args[1]==='readonly')throw new Error('injected read error');return transaction.apply(this,args)};
    });
    await page.reload();await expect(page.getByRole('heading',{name:'本地数据暂时无法读取'})).toBeVisible();
    await expect(page.getByRole('button',{name:'修改设置和任务'})).toHaveCount(0);
    await page.evaluate(()=>localStorage.removeItem('_e2e_fail_reads'));
    await page.getByRole('button',{name:'重新尝试'}).click();
    await expect(page.getByTestId('password')).toHaveText('1234');
});
test('pagehide journals React pending state even if the database cannot finish writing',async({page})=>{
    await page.goto(fixture);await expect(page.getByRole('button',{name:'修改设置和任务'})).toBeVisible();
    await page.evaluate(()=>{
        const transaction=IDBDatabase.prototype.transaction;
        IDBDatabase.prototype.transaction=function(...args){if(args[1]==='readwrite')throw new Error('injected suspended write');return transaction.apply(this,args)};
    });
    await page.getByRole('button',{name:'修改设置和任务'}).click();
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('_accounting_journal_v1')).entries.app_settings_password)).toBe('"1234"');
    await page.reload();
    await expect(page.getByTestId('password')).toHaveText('1234');
    await expect(page.getByTestId('tasks')).toContainText('数学');
});
test('backup export includes edits still waiting in the React debounce queue',async({page})=>{
    await page.goto(fixture);
    await page.getByRole('button',{name:'打开备份'}).click();
    const download=page.waitForEvent('download');
    await page.evaluate(()=>{
        window._pendingWrites={app_settings_password:'new password',app_tasks_v2:{孩子:[{id:'latest'}]}};
        [...document.querySelectorAll('button')].find(b=>b.textContent.includes('导出全量时空备份')).click();
    });
    const file=await download;const stream=await file.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);
    const data=JSON.parse(Buffer.concat(chunks).toString());
    expect(data._allSyncData.app_settings_password).toBe('"new password"');
    expect(JSON.parse(data._allSyncData.app_tasks_v2).孩子[0].id).toBe('latest');
});
test('a redundant sync notification never suppresses a later edit back to the original value',async({page})=>{
    await page.goto(fixture);await expect(page.getByRole('button',{name:'修改设置和任务'})).toBeVisible();
    await page.evaluate(()=>{
        window.storage.setItem('app_settings_password','""');
        window.dispatchEvent(new Event('_syncDataMerged'));
    });
    await page.getByRole('button',{name:'修改设置和任务'}).click();
    await page.evaluate(()=>window.storage.flush());
    await page.getByRole('button',{name:'清空密码'}).click();
    await page.reload();
    await expect(page.getByTestId('password')).toHaveText('');
    expect(await page.evaluate(()=>window.storage.getItem('app_settings_password'))).toBe('""');
});
test('both welcome and settings importers restore validated data and retain a pre-restore snapshot',async({page})=>{
    page.on('dialog',d=>d.accept());
    await page.goto('/');
    await importFile(page,page.getByRole('button',{name:/从本地备份文件还原/}),snapshot);
    await expect(page.locator('main')).toBeAttached();
    expect(await page.evaluate(()=>JSON.parse(window.storage.getItem('app_wheel_history'))['孩子-BASE-1792000000000'])).toBe(100);
    await page.goto(fixture);await page.getByRole('button',{name:'打开备份'}).click();
    await page.evaluate(()=>Object.defineProperty(File.prototype,'text',{configurable:true,value:undefined}));
    await importFile(page,page.getByRole('button',{name:/从备份文件恢复/}),{version:'2.0',settingsPassword:'"restored"'});
    await expect(page.getByTestId('password')).toHaveText('restored');
    await page.getByRole('button',{name:'打开备份'}).click();
    await expect(page.getByRole('button',{name:'下载上次恢复前的数据快照'})).toBeVisible();
});
test('invalid backup and failed restore never replace existing task data or report success',async({page})=>{
    page.on('dialog',d=>d.accept());
    await page.goto(fixture);await page.getByRole('button',{name:'修改设置和任务'}).click();
    await page.getByRole('button',{name:'打开备份'}).click();
    await importFile(page,page.getByRole('button',{name:/从备份文件恢复/}),{version:'2.0',tasks:'{"孩子":{}}'});
    await expect(page.getByText(/恢复未完成：备份中的任务列表无效/)).toBeVisible();
    await page.evaluate(async()=>{
        await window.storage.flush();const put=IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put=function(value,key){if(key==='app_wheel_history')throw new Error('injected quota failure');return put.call(this,value,key)};
    });
    await importFile(page,page.getByRole('button',{name:/从备份文件恢复/}),{version:'2.0',tasks:'{"other":[]}',wheelHistory:'{"credit":50}'});
    await expect(page.getByText(/恢复未完成：injected quota failure/)).toBeVisible();
    expect(await page.evaluate(()=>JSON.parse(window.storage.getItem('app_tasks_v2')).孩子[0].id)).toBe('math');
    await page.reload();await expect(page.getByTestId('tasks')).toContainText('数学');
});
