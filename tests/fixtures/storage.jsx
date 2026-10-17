import React from 'react';
import { createRoot } from 'react-dom/client';
import { useStickyState } from '../../src/hooks/useStickyState.js';
import StorageGate from '../../src/components/common/StorageGate.jsx';
import BackupPanel from '../../src/components/modals/BackupPanel.jsx';
import '../../src/index.css';

function Fixture() {
    const [password, setPassword] = useStickyState('', 'app_settings_password');
    const [tasks, setTasks] = useStickyState({}, 'app_tasks_v2');
    const [backup, setBackup] = React.useState(false);
    const [toast, setToast] = React.useState('');
    return <>
        <button onClick={() => {setPassword('1234');setTasks({孩子:[{id:'math',name:'数学'}]});}}>修改设置和任务</button>
        <button onClick={() => setPassword('')}>清空密码</button>
        <output data-testid="password">{password}</output>
        <output data-testid="tasks">{JSON.stringify(tasks)}</output>
        <button onClick={() => setBackup(true)}>打开备份</button>
        <div role="status">{toast}</div>
        <BackupPanel show={backup} onClose={() => setBackup(false)} showToast={(_, message) => setToast(message)} />
    </>;
}
createRoot(document.getElementById('root')).render(<StorageGate><Fixture /></StorageGate>);
