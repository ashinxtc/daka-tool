import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SilenceBanner } from '../../src/components/status/SilenceBanner.jsx';
import { PetFloatingButton } from '../../src/components/pet/PetFloatingButton.jsx';
import AtmosphereLayer from '../../src/components/backgrounds/AtmosphereLayer.jsx';
window.parentRenders=0;
function Harness() {
    window.parentRenders++;
    const [mutes,setMutes]=useState({});
    const [adventures,setAdventures]=useState({});
    const [background,setBackground]=useState(null);
    window.fixture={setMutes,setAdventures,setBackground,mutes};
    return <><SilenceBanner mutes={mutes} setMutes={setMutes}/>
        <PetFloatingButton activeChild="孩子" petAdventures={adventures}/>
        <AtmosphereLayer type={background}/></>;
}
createRoot(document.getElementById('root')).render(<Harness/>);
