import * as THREE from 'three';

/**
 * 【纯代码程序化 Canvas PBR 纹理生成引擎 · 极致高精版】
 * 0KB 外部模型与贴图网络依赖，纯原生 Canvas API 即时生成文博级真实感 PBR 材质
 * 包含：Diffuse Map (漫反射颜色)、Bump Map (微观凹凸高度)、Roughness Map (高光粗糙度)
 */

function setupTexture(texture, repeatX = 1, repeatY = 1) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    if (THREE.SRGBColorSpace) {
        texture.colorSpace = THREE.SRGBColorSpace;
    }
    texture.needsUpdate = true;
    return texture;
}

// ------------------------------------------------------------------------------
// 1. 【版筑夯土层纹】(Rammed Earth): 24层横向版筑夯打层理、木板夹缝与沙砾粗颗粒
// ------------------------------------------------------------------------------
export function createRammedEarthTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 基础生土黄褐色
    ctx.fillStyle = '#b38d61';
    ctx.fillRect(0, 0, 1024, 1024);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    // 28 层横向版筑夯打交替层 (熟红土、黄生土、灰黏土、炭黑杂质层)
    const layerCount = 28;
    const strataColors = [
        'rgba(145, 82, 38, 0.52)',   // 熟红烧土层
        'rgba(224, 188, 138, 0.45)', // 生黄土细沙层
        'rgba(88, 62, 36, 0.55)',    // 草木灰泥层
        'rgba(186, 146, 102, 0.42)', // 细沙砾土层
        'rgba(118, 54, 25, 0.46)'    // 氧化红黏土
    ];

    for (let i = 0; i < layerCount; i++) {
        const y = (i / layerCount) * 1024;
        const h = (1024 / layerCount) * (0.82 + Math.sin(i * 1.6) * 0.22);

        ctx.fillStyle = strataColors[i % strataColors.length];
        ctx.fillRect(0, y, 1024, h);

        // 夯打微起伏波浪凹窝 (圆木夯头反复捶打痕)
        ctx.fillStyle = 'rgba(58, 32, 12, 0.22)';
        for (let x = 12; x < 1024; x += 38) {
            ctx.beginPath();
            ctx.ellipse(x + Math.sin(i * 2.8 + x) * 6, y + h * 0.5, 18, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // 版筑木板模板接缝 (深凹槽阴影 + 泥浆溢出微凸起)
        ctx.strokeStyle = 'rgba(38, 18, 6, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 240, 210, 0.38)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, y + 4.0);
        ctx.lineTo(1024, y + 4.0);
        ctx.stroke();

        // 凹凸贴图对应的模板深接缝
        bCtx.fillStyle = 'rgb(20, 20, 20)';
        bCtx.fillRect(0, y - 2, 1024, 4);
        bCtx.fillStyle = 'rgb(220, 220, 220)';
        bCtx.fillRect(0, y + 2, 1024, 2);
    }

    // 草拌泥内部断断续续的细碎干草丝痕迹 (Straw Binder Impressions)
    for (let s = 0; s < 1200; s++) {
        const sx = Math.random() * 1024;
        const sy = Math.random() * 1024;
        const sLen = 8 + Math.random() * 18;
        const sAngle = Math.random() * Math.PI;

        ctx.strokeStyle = 'rgba(235, 205, 150, 0.55)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(sAngle) * sLen, sy + Math.sin(sAngle) * sLen);
        ctx.stroke();

        bCtx.strokeStyle = 'rgb(210, 210, 210)';
        bCtx.lineWidth = 1.0;
        bCtx.beginPath();
        bCtx.moveTo(sx, sy);
        bCtx.lineTo(sx + Math.cos(sAngle) * sLen, sy + Math.sin(sAngle) * sLen);
        bCtx.stroke();
    }

    // 随机矿物石子与石英沙砾粗粝噪点
    for (let i = 0; i < 9500; i++) {
        const px = Math.random() * 1024;
        const py = Math.random() * 1024;
        const isStone = Math.random() > 0.52;
        const size = Math.random() * 3 + 1;

        ctx.fillStyle = isStone ? 'rgba(35, 18, 6, 0.35)' : 'rgba(255, 245, 220, 0.38)';
        ctx.fillRect(px, py, size, size);

        bCtx.fillStyle = isStone ? 'rgb(250, 250, 250)' : 'rgb(50, 50, 50)';
        bCtx.fillRect(px, py, size, size);
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 2, 2),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 2, 2)
    };
}

// ------------------------------------------------------------------------------
// 2. 【远古厚茅草席 / 芦苇草屋面】(Thatch): 纵向草排纤维、竹篾横压条与扎扣
// ------------------------------------------------------------------------------
export function createThatchTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 1. 深沉古朴干草泥垫层底色 (Dark organic peat & dried stalk bed)
    ctx.fillStyle = '#261608';
    ctx.fillRect(0, 0, 1024, 1024);
    bCtx.fillStyle = '#505050';
    bCtx.fillRect(0, 0, 1024, 1024);

    // 2. 多阶厚草排层叠架构 (4 Tiers of cascading thatch courses)
    // 每阶拥有向下的深暗投影与参差毛茸草尖垂散，彻底消除平板塑料感
    const tierCount = 4;
    const tierH = 1024 / tierCount; // 256px per tier

    const midStrawTones = ['#7c542b', '#8c6233', '#9c6f3a', '#ab7c42', '#b88949', '#936a38', '#825b2e'];
    const lightStrawTones = ['#a87d46', '#ba8d52', '#c89d5f', '#bf9355', '#ae8249', '#9f753e'];
    const highlightFiberTones = ['#cda366', '#d6ac70', '#be9357', '#caa062'];
    const weatheredGreyTones = ['#6a5948', '#7b6c5a', '#544637'];

    // 逐层自上而下绘制层叠厚草排
    for (let t = 0; t < tierCount; t++) {
        const tierTop = t * tierH;
        const tierBottom = (t + 1) * tierH;

        // 该层草排的阴影垫层
        const tierGrad = ctx.createLinearGradient(0, tierTop, 0, tierBottom + 35);
        tierGrad.addColorStop(0, 'rgba(25, 14, 6, 0.95)');
        tierGrad.addColorStop(0.2, 'rgba(65, 38, 16, 0.85)');
        tierGrad.addColorStop(0.85, 'rgba(120, 80, 35, 0.4)');
        tierGrad.addColorStop(1, 'rgba(15, 8, 3, 0.95)'); // 层底强阴影
        ctx.fillStyle = tierGrad;
        ctx.fillRect(0, tierTop, 1024, tierH + 30);

        // 凹凸贴图层梯级落差 (每层草排向外挑出，底端有明显高度落差)
        const bGrad = bCtx.createLinearGradient(0, tierTop, 0, tierBottom + 30);
        bGrad.addColorStop(0, 'rgb(70, 70, 70)');
        bGrad.addColorStop(0.8, 'rgb(180, 180, 180)');
        bGrad.addColorStop(0.95, 'rgb(220, 220, 220)'); // 挑檐草尖高光
        bGrad.addColorStop(1, 'rgb(20, 20, 20)'); // 下层阴影凹坑
        bCtx.fillStyle = bGrad;
        bCtx.fillRect(0, tierTop, 1024, tierH + 20);

        // 3. 密集弯曲草茎与主草束 (Thick Wavy Straw Stalks)
        for (let x = -20; x < 1044; x += 3.2) {
            const tone = midStrawTones[Math.floor(Math.random() * midStrawTones.length)];
            ctx.strokeStyle = tone;
            ctx.lineWidth = 1.8 + Math.random() * 2.4;

            // 具有自然有机轻微摆动的贝塞尔曲线草茎
            const x0 = x + (Math.random() - 0.5) * 8;
            const x1 = x + (Math.random() - 0.5) * 16;
            const x2 = x + (Math.random() - 0.5) * 24;
            const y0 = tierTop - 12;
            const y2 = tierBottom + Math.random() * 32; // 参差不齐的下垂草尖

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.quadraticCurveTo(x1, (y0 + y2) * 0.5, x2, y2);
            ctx.stroke();

            // 凹凸贴图对应的条纹凸起
            const bumpTone = Math.floor(130 + Math.random() * 80);
            bCtx.strokeStyle = `rgb(${bumpTone}, ${bumpTone}, ${bumpTone})`;
            bCtx.lineWidth = ctx.lineWidth * 0.9;
            bCtx.beginPath();
            bCtx.moveTo(x0, y0);
            bCtx.quadraticCurveTo(x1, (y0 + y2) * 0.5, x2, y2);
            bCtx.stroke();
        }

        // 4. 超高密度细如发丝的“真实草丝”微纤维束 (Over 3500 Fine Straw Strands per tier)
        for (let f = 0; f < 3500; f++) {
            const fx = Math.random() * 1044 - 10;
            const fy0 = tierTop + Math.random() * (tierH * 0.45);
            const fy1 = tierBottom + (Math.random() - 0.15) * 40; // 细草丝大量伸出草排下缘
            const isLight = Math.random() > 0.35;
            const fiberTone = isLight
                ? lightStrawTones[Math.floor(Math.random() * lightStrawTones.length)]
                : (Math.random() > 0.5 ? highlightFiberTones[Math.floor(Math.random() * highlightFiberTones.length)] : weatheredGreyTones[Math.floor(Math.random() * weatheredGreyTones.length)]);

            ctx.strokeStyle = fiberTone;
            ctx.lineWidth = 0.65 + Math.random() * 1.1;

            const bend = (Math.random() - 0.5) * 20;
            ctx.beginPath();
            ctx.moveTo(fx, fy0);
            ctx.quadraticCurveTo(fx + bend * 0.5, (fy0 + fy1) * 0.5, fx + bend, fy1);
            ctx.stroke();

            // 细草丝凹凸
            bCtx.strokeStyle = isLight ? 'rgb(220, 220, 220)' : 'rgb(90, 90, 90)';
            bCtx.lineWidth = 0.9;
            bCtx.beginPath();
            bCtx.moveTo(fx, fy0);
            bCtx.quadraticCurveTo(fx + bend * 0.5, (fy0 + fy1) * 0.5, fx + bend, fy1);
            bCtx.stroke();
        }

        // 5. 每层末端参差垂落的羽状散碎草须 (Frayed Eave Fringe Tufts)
        for (let tuft = 0; tuft < 120; tuft++) {
            const tx = Math.random() * 1024;
            const ty = tierBottom + Math.random() * 20;
            const tLen = 15 + Math.random() * 30;

            ctx.strokeStyle = highlightFiberTones[Math.floor(Math.random() * highlightFiberTones.length)];
            ctx.lineWidth = 1.0 + Math.random() * 1.5;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + (Math.random() - 0.5) * 10, ty + tLen);
            ctx.stroke();
        }

        // 6. 真实的横向固定竹篾与草绳捆扎压条 (Bamboo Splint & Hemp Binding)
        const bindY = tierTop + tierH * 0.38;
        // 压槽深阴影
        ctx.strokeStyle = 'rgba(15, 8, 3, 0.9)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(0, bindY);
        ctx.lineTo(1024, bindY);
        ctx.stroke();

        // 竹篾本身条带
        ctx.strokeStyle = '#9e7845';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, bindY + 2);
        ctx.lineTo(1024, bindY + 2);
        ctx.stroke();

        // 凹凸贴图竹篾
        bCtx.fillStyle = 'rgb(20, 20, 20)';
        bCtx.fillRect(0, bindY - 2, 1024, 6);
        bCtx.fillStyle = 'rgb(200, 200, 200)';
        bCtx.fillRect(0, bindY + 2, 1024, 3);

        // 麻绳十字紧扣
        for (let kx = 18; kx < 1024; kx += 42) {
            ctx.fillStyle = '#261608';
            ctx.fillRect(kx - 4, bindY - 2, 8, 12);
            ctx.strokeStyle = '#e2be84';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(kx - 4, bindY - 2); ctx.lineTo(kx + 4, bindY + 10);
            ctx.moveTo(kx + 4, bindY - 2); ctx.lineTo(kx - 4, bindY + 10);
            ctx.stroke();

            bCtx.fillStyle = 'rgb(230, 230, 230)';
            bCtx.fillRect(kx - 3, bindY, 6, 8);
        }
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 3, 3),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 3, 3)
    };
}

// ------------------------------------------------------------------------------
// 3. 【金丝楠木 / 古栎木天然木纹】(Wood): 纵向波浪年轮与金丝微光
// ------------------------------------------------------------------------------
export function createWoodTextures(isNanmu = true) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 底色
    ctx.fillStyle = isNanmu ? '#78350f' : '#3d1d06';
    ctx.fillRect(0, 0, 512, 1024);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 1024);

    // 优美起伏的纵向波浪年轮流线
    const waveCount = 60;
    for (let i = 0; i < waveCount; i++) {
        const x = (i / waveCount) * 512;
        const isHighlight = i % 3 === 0;
        ctx.strokeStyle = isNanmu
            ? (isHighlight ? '#d97706' : '#92400e')
            : (isHighlight ? '#5a2e0e' : '#220f03');
        ctx.lineWidth = 2 + Math.random() * 3.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(
            x + Math.sin(i * 0.9) * 28, 280,
            x - Math.cos(i * 0.7) * 28, 720,
            x + Math.sin(i * 1.3) * 20, 1024
        );
        ctx.stroke();

        // 凹凸贴图
        bCtx.strokeStyle = isHighlight ? 'rgb(180, 180, 180)' : 'rgb(40, 40, 40)';
        bCtx.lineWidth = 2;
        bCtx.beginPath();
        bCtx.moveTo(x, 0);
        bCtx.bezierCurveTo(
            x + Math.sin(i * 0.9) * 28, 280,
            x - Math.cos(i * 0.7) * 28, 720,
            x + Math.sin(i * 1.3) * 20, 1024
        );
        bCtx.stroke();
    }

    // 金丝楠木天然金丝流光细屑 (Golden Silk Flakes)
    if (isNanmu) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.16)';
        for (let w = 0; w < 600; w++) {
            ctx.fillRect(Math.random() * 512, Math.random() * 1024, 2, Math.random() * 50 + 15);
        }
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 1, 3),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 1, 3)
    };
}

// ------------------------------------------------------------------------------
// 4. 【良渚至高国宝 · 大玉琮王神人兽面阴刻神徽】(Jade Cong King)
// ------------------------------------------------------------------------------
export function createJadeCongTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 温润碧翠透闪石底色渐变
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(0.3, '#059669');
    grad.addColorStop(0.65, '#047857');
    grad.addColorStop(1, '#022c22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    // 内部温润玉花、白云母云斑与二次氧化红褐水银沁 (Mineral plumes & Patina)
    for (let i = 0; i < 60; i++) {
        ctx.fillStyle = 'rgba(209, 250, 229, 0.18)';
        ctx.beginPath();
        ctx.ellipse(
            Math.random() * 1024, Math.random() * 1024,
            Math.random() * 120 + 30, Math.random() * 60 + 20,
            Math.random() * Math.PI, 0, Math.PI * 2
        );
        ctx.fill();
    }
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = 'rgba(153, 27, 27, 0.15)'; // 朱砂沁色
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 40 + 10, 0, Math.PI * 2);
        ctx.fill();
    }

    // 细如发丝的良渚神人兽面阴刻绝密图腾 (凹线深绿青金刻痕)
    ctx.strokeStyle = '#012018';
    ctx.lineWidth = 4;
    bCtx.strokeStyle = 'rgb(10, 10, 10)'; // 凹槽为深色
    bCtx.lineWidth = 4;

    // 上节：神人面 (羽冠 + 倒梯形神面)
    // 1. 放射状羽状冠帽 (介字形羽冠条纹)
    for (let l = 70; l <= 270; l += 20) {
        ctx.beginPath();
        ctx.moveTo(160, l); ctx.lineTo(864, l); ctx.stroke();
        bCtx.beginPath();
        bCtx.moveTo(160, l); bCtx.lineTo(864, l); bCtx.stroke();
    }
    ctx.strokeRect(280, 290, 464, 140);
    bCtx.strokeRect(280, 290, 464, 140);

    // 2. 神人重圈双眼与眼角勾芒
    [400, 624].forEach((eyeX) => {
        ctx.beginPath(); ctx.arc(eyeX, 360, 36, 0, Math.PI * 2); ctx.stroke();
        bCtx.beginPath(); bCtx.arc(eyeX, 360, 36, 0, Math.PI * 2); bCtx.stroke();
        ctx.fillStyle = '#012018';
        ctx.beginPath(); ctx.arc(eyeX, 360, 14, 0, Math.PI * 2); ctx.fill();
    });

    // 下节：兽面大饕餮 (圆瞪重圈大眼、阔吻、獠牙)
    ctx.lineWidth = 6;
    bCtx.lineWidth = 6;
    // 兽目外重圈与连接桥
    [360, 664].forEach((eyeX) => {
        ctx.beginPath(); ctx.arc(eyeX, 620, 76, 0, Math.PI * 2); ctx.stroke();
        bCtx.beginPath(); bCtx.arc(eyeX, 620, 76, 0, Math.PI * 2); bCtx.stroke();
        ctx.beginPath(); ctx.arc(eyeX, 620, 44, 0, Math.PI * 2); ctx.stroke();
        bCtx.beginPath(); bCtx.arc(eyeX, 620, 44, 0, Math.PI * 2); bCtx.stroke();
        ctx.fillStyle = '#012018';
        ctx.beginPath(); ctx.arc(eyeX, 620, 20, 0, Math.PI * 2); ctx.fill();
    });
    ctx.beginPath(); ctx.moveTo(436, 620); ctx.lineTo(588, 620); ctx.stroke();
    bCtx.beginPath(); bCtx.moveTo(436, 620); bCtx.lineTo(588, 620); bCtx.stroke();

    // 阔口鼻梁与上下弯月弯曲大獠牙
    ctx.beginPath();
    ctx.moveTo(260, 760);
    ctx.quadraticCurveTo(512, 720, 764, 760);
    ctx.lineTo(764, 860);
    ctx.quadraticCurveTo(512, 920, 260, 860);
    ctx.closePath();
    ctx.stroke();
    bCtx.beginPath();
    bCtx.moveTo(260, 760);
    bCtx.quadraticCurveTo(512, 720, 764, 760);
    bCtx.lineTo(764, 860);
    bCtx.quadraticCurveTo(512, 920, 260, 860);
    bCtx.closePath();
    bCtx.stroke();

    // 上下交错獠牙
    [360, 624].forEach((fx) => {
        ctx.beginPath(); ctx.moveTo(fx, 760); ctx.lineTo(fx + 20, 830); ctx.lineTo(fx + 40, 760); ctx.stroke();
        bCtx.beginPath(); bCtx.moveTo(fx, 760); bCtx.lineTo(fx + 20, 830); bCtx.lineTo(fx + 40, 760); bCtx.stroke();
    });

    // 回字雷纹微刻填底
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(1, 32, 24, 0.45)';
    for (let r = 920; r < 1024; r += 24) {
        ctx.beginPath(); ctx.moveTo(100, r); ctx.lineTo(924, r); ctx.stroke();
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 1, 1),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 1, 1)
    };
}

// ------------------------------------------------------------------------------
// 5. 【仰韶半坡彩陶 · 人面鱼纹陶器彩绘】(Painted Pottery)
// ------------------------------------------------------------------------------
export function createPaintedPotteryTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 仰韶温润橙红黏土火烧陶体胎底
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.45, '#c2410c');
    grad.addColorStop(1, '#9a3412');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 旋轮手工拉坯环向细腻陶痕
    ctx.strokeStyle = 'rgba(124, 45, 18, 0.22)';
    for (let y = 0; y < 1024; y += 12) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
    }

    // 仰韶半坡经典纯黑彩人面双鱼彩绘 (Black Slip Painted Icon)
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 8;

    // 1. 人面圆形轮廓 (中置大圆)
    ctx.beginPath();
    ctx.arc(512, 512, 150, 0, Math.PI * 2);
    ctx.stroke();

    // 2. 额头半涂黑顶发、左黑右白
    ctx.beginPath();
    ctx.arc(512, 512, 150, Math.PI, Math.PI * 1.5);
    ctx.lineTo(512, 512);
    ctx.closePath();
    ctx.fill();

    // 3. 头顶高耸三角锥发髻与发簪
    ctx.beginPath();
    ctx.moveTo(512, 362);
    ctx.lineTo(470, 220);
    ctx.lineTo(554, 220);
    ctx.closePath();
    ctx.fill();

    // 鱼形顶饰
    ctx.beginPath();
    ctx.moveTo(512, 220);
    ctx.lineTo(512, 160);
    ctx.stroke();

    // 4. 双眼细长一字弧线、直鼻小口
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(430, 480); ctx.lineTo(480, 480); // 左眼
    ctx.moveTo(544, 480); ctx.lineTo(594, 480); // 右眼
    ctx.moveTo(512, 470); ctx.lineTo(512, 530); // 直鼻
    ctx.stroke();

    // 5. 耳旁两侧对称大游鱼 (Fish beside ears)
    // 左耳游鱼
    ctx.save();
    ctx.translate(260, 512);
    ctx.rotate(0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 84, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    // 鱼尾
    ctx.beginPath();
    ctx.moveTo(-84, 0); ctx.lineTo(-130, -32); ctx.lineTo(-130, 32); ctx.closePath();
    ctx.fill();
    // 鱼眼
    ctx.fillStyle = '#f97316';
    ctx.beginPath(); ctx.arc(50, -8, 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 右耳游鱼
    ctx.save();
    ctx.translate(764, 512);
    ctx.rotate(-0.3);
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(0, 0, 84, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    // 鱼尾
    ctx.beginPath();
    ctx.moveTo(84, 0); ctx.lineTo(130, -32); ctx.lineTo(130, 32); ctx.closePath();
    ctx.fill();
    // 鱼眼
    ctx.fillStyle = '#f97316';
    ctx.beginPath(); ctx.arc(-50, -8, 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 边缘三角几何连珠波浪边框带
    ctx.fillStyle = '#1c1917';
    for (let bx = 40; bx < 1024; bx += 80) {
        ctx.beginPath();
        ctx.moveTo(bx, 920);
        ctx.lineTo(bx + 40, 840);
        ctx.lineTo(bx + 80, 920);
        ctx.closePath();
        ctx.fill();
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 1, 1)
    };
}

// ------------------------------------------------------------------------------
// 6. 【天目山石板 / 汉白玉祭台铺地】(Stone Paver)
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 6. 【古朴青石阶梯与台基铺石】(Stone Pavers): 深沉暗青石板、天然磨损与凿石痕
// ------------------------------------------------------------------------------
export function createStonePaverTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 底色：深沉青灰/玄青暗石
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 1024, 1024);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    const cols = 8;
    const rows = 8;
    const cw = 1024 / cols;
    const ch = 1024 / rows;

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const tone = (Math.sin(c * 3 + r * 5) * 0.15) + 0.85;
            ctx.fillStyle = `rgb(${Math.floor(75 * tone)}, ${Math.floor(88 * tone)}, ${Math.floor(105 * tone)})`;
            ctx.fillRect(c * cw + 4, r * ch + 4, cw - 8, ch - 8);

            // 石板边缘自然微凿刻线
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(c * cw + 10, r * ch + Math.random() * ch);
            ctx.lineTo((c + 1) * cw - 10, r * ch + Math.random() * ch);
            ctx.stroke();

            // 石面微颗粒
            for (let k = 0; k < 12; k++) {
                ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
                ctx.fillRect(c * cw + 6 + Math.random() * (cw - 16), r * ch + 6 + Math.random() * (ch - 16), 2, 2);
            }
        }
    }

    // 深接缝
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    bCtx.fillStyle = 'rgb(15, 15, 15)';
    for (let c = 0; c <= cols; c++) {
        ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, 1024); ctx.stroke();
        bCtx.fillRect(c * cw - 2, 0, 4, 1024);
    }
    for (let r = 0; r <= rows; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(1024, r * ch); ctx.stroke();
        bCtx.fillRect(0, r * ch - 2, 1024, 4);
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 2, 2),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 2, 2)
    };
}

// ------------------------------------------------------------------------------
// 7. 【太湖碧水动态波光】(Water): 幽静深邃的江南泽国碧玉水色
// ------------------------------------------------------------------------------
export function createWaterTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 深幽太湖碧波底色 (黛青碧水)
    ctx.fillStyle = '#115e59';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 35; i++) {
        ctx.strokeStyle = 'rgba(94, 234, 212, 0.28)';
        ctx.lineWidth = 2.5 + Math.random() * 3.5;
        ctx.beginPath();
        const y = Math.random() * 512;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(128, y + 20, 384, y - 20, 512, y);
        ctx.stroke();
    }

    return setupTexture(new THREE.CanvasTexture(canvas), 4, 4);
}

// ------------------------------------------------------------------------------
// 8. 【夏商青铜器物与铜绿锈斑】(Ancient Bronze): 斑驳孔雀石绿锈、红斑绿锈与青铜暗泽
// ------------------------------------------------------------------------------
export function createAncientBronzeTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 底色：青铜暗绿与古铜褐深沉基底
    ctx.fillStyle = '#28362a';
    ctx.fillRect(0, 0, 1024, 1024);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    // 1. 三色共生矿物锈蚀斑层 (孔雀石绿 + 蓝铜矿蓝 + 赤铜红斑)
    const patinaColors = [
        'rgba(42, 105, 75, 0.72)',  // 苍润孔雀石深绿
        'rgba(74, 158, 122, 0.55)', // 浅翠结晶绿锈
        'rgba(30, 64, 115, 0.45)',  // 蓝铜矿蓝晶斑 (Azurite)
        'rgba(145, 52, 22, 0.45)',  // 赤铜矿氧化红斑 (Cuprite)
        'rgba(215, 155, 68, 0.28)', // 磨损棱角露铜金泽
        'rgba(18, 30, 22, 0.65)'    // 黑色硫化物包浆
    ];

    for (let i = 0; i < 140; i++) {
        ctx.fillStyle = patinaColors[i % patinaColors.length];
        ctx.beginPath();
        const cx = Math.random() * 1024;
        const cy = Math.random() * 1024;
        const rx = 15 + Math.random() * 85;
        const ry = 10 + Math.random() * 65;
        ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    // 2. 陶范合范铸造分型线 (Casting Mold Seams)
    for (let seam = 0; seam < 3; seam++) {
        const sx = 200 + seam * 320;
        ctx.strokeStyle = 'rgba(210, 160, 80, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + (Math.random() - 0.5) * 20, 1024);
        ctx.stroke();

        bCtx.strokeStyle = 'rgb(240, 240, 240)';
        bCtx.lineWidth = 3.0;
        bCtx.beginPath();
        bCtx.moveTo(sx, 0);
        bCtx.lineTo(sx, 1024);
        bCtx.stroke();
    }

    // 3. 铸造砂眼凹坑与致密凹凸 (Pitting & Sand Holes)
    for (let i = 0; i < 350; i++) {
        const bx = Math.random() * 1024;
        const by = Math.random() * 1024;
        const br = 1.5 + Math.random() * 4.5;
        bCtx.fillStyle = Math.random() > 0.4 ? 'rgb(30, 30, 30)' : 'rgb(220, 220, 220)';
        bCtx.beginPath();
        bCtx.arc(bx, by, br, 0, Math.PI * 2);
        bCtx.fill();
    }

    // 4. 矿物结晶微粒粉末 (Verdigris Powder Crystals)
    for (let i = 0; i < 1500; i++) {
        const px = Math.random() * 1024;
        const py = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.6 ? 'rgba(167, 243, 208, 0.42)' : 'rgba(96, 165, 250, 0.35)';
        ctx.fillRect(px, py, 2, 2);
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 2, 2),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 2, 2)
    };
}

// ------------------------------------------------------------------------------
// 9. 【二里头绿松石镶嵌微晶纹】(Turquoise Mosaic): 华夏第一龙 2000 片微绿松石镶嵌格网
// ------------------------------------------------------------------------------
export function createTurquoiseTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 底色：温润湖蓝碧绿
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(0, 0, 1024, 1024);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    // 绿松石镶嵌片微网格 (Mosaic Cells)
    const gridSize = 32;
    const cols = 1024 / gridSize;
    const rows = 1024 / gridSize;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const hueShift = (Math.sin(r * 2.1 + c * 3.7) * 0.15);
            // 绿松石多阶宝石色（天蓝、湖绿、孔雀绿、深碧）
            const rVal = Math.floor(13 + hueShift * 20);
            const gVal = Math.floor(160 + hueShift * 45);
            const bVal = Math.floor(145 + hueShift * 35);
            ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
            ctx.fillRect(c * gridSize + 2, r * gridSize + 2, gridSize - 4, gridSize - 4);

            // 嵌缝微黑漆胶黏剂线
            ctx.strokeStyle = '#042f2e';
            ctx.lineWidth = 1.8;
            ctx.strokeRect(c * gridSize + 1, r * gridSize + 1, gridSize - 2, gridSize - 2);

            // Bump 深度：嵌缝深陷，石片微凸
            bCtx.fillStyle = '#9e9e9e';
            bCtx.fillRect(c * gridSize + 3, r * gridSize + 3, gridSize - 6, gridSize - 6);
            bCtx.fillStyle = '#333333';
            bCtx.strokeRect(c * gridSize + 1, r * gridSize + 1, gridSize - 2, gridSize - 2);
        }
    }

    // 天然绿松石铁线 (Spiderweb matrix)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 2.0;
    for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        let sx = Math.random() * 1024;
        let sy = Math.random() * 1024;
        ctx.moveTo(sx, sy);
        for (let step = 0; step < 4; step++) {
            sx += (Math.random() - 0.5) * 120;
            sy += (Math.random() - 0.5) * 120;
            ctx.lineTo(sx, sy);
        }
        ctx.stroke();
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 3, 3),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 3, 3)
    };
}

// ------------------------------------------------------------------------------
// 10. 【三星堆黄金面罩与锤牒金箔】(Gold Foil): 纯金锤揲微褶皱与璀璨金属质感
// ------------------------------------------------------------------------------
export function createGoldFoilTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 底色：尊贵灿金
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 1024, 1024);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    // 金箔锤打微起伏面
    const goldTones = [
        'rgba(251, 191, 36, 0.45)', // 亮金
        'rgba(217, 119, 6, 0.35)',  // 深赤金
        'rgba(254, 240, 138, 0.4)', // 耀目浅金
        'rgba(180, 83, 9, 0.25)'    // 暗金折光
    ];

    for (let i = 0; i < 90; i++) {
        ctx.fillStyle = goldTones[i % goldTones.length];
        ctx.beginPath();
        const cx = Math.random() * 1024;
        const cy = Math.random() * 1024;
        const r = 25 + Math.random() * 60;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // 锤打微凹 (Bump)
        bCtx.fillStyle = i % 2 === 0 ? '#999999' : '#666666';
        bCtx.beginPath();
        bCtx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
        bCtx.fill();
    }

    // 锤牒金箔折痕微细线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        let sx = Math.random() * 1024;
        let sy = Math.random() * 1024;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (Math.random() - 0.5) * 80, sy + (Math.random() - 0.5) * 80);
        ctx.stroke();
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 2, 2),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 2, 2)
    };
}

// ------------------------------------------------------------------------------
// 11. 【三星堆古蜀神圣青铜】(Sanxingdui Bronze): 蓝绿孔雀石与蓝铜矿斑驳古铜
// ------------------------------------------------------------------------------
export function createSanxingduiBronzeTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 底色：鲜明孔雀石绿锈古青铜 (避免黑化，清晰显露国宝微雕轮廓)
    ctx.fillStyle = '#2d5e4a';
    ctx.fillRect(0, 0, 1024, 1024);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    // 蓝铜矿与绿铜锈斑块
    const patinaTones = [
        'rgba(16, 185, 129, 0.65)',  // 鲜亮孔雀翠绿
        'rgba(6, 182, 212, 0.45)',   // 蓝铜矿幽蓝
        'rgba(110, 231, 183, 0.45)', // 浅绿锈霜
        'rgba(217, 119, 6, 0.35)',   // 底层古铜金光
        'rgba(4, 120, 87, 0.55)'     // 沉稳松石绿
    ];

    for (let i = 0; i < 110; i++) {
        ctx.fillStyle = patinaTones[i % patinaTones.length];
        ctx.beginPath();
        const cx = Math.random() * 1024;
        const cy = Math.random() * 1024;
        const r = 15 + Math.random() * 70;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 范铸凹凸与千年沙眼 (Bump)
    bCtx.fillStyle = '#4a4a4a';
    for (let i = 0; i < 250; i++) {
        const bx = Math.random() * 1024;
        const by = Math.random() * 1024;
        const br = 1.5 + Math.random() * 4;
        bCtx.beginPath();
        bCtx.arc(bx, by, br, 0, Math.PI * 2);
        bCtx.fill();
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 2, 2),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 2, 2)
    };
}

// ------------------------------------------------------------------------------
// 12. 【古蜀祭祀圣洁象牙】(Sacred Ivory): 天然象牙生长纹与温润牙黄色泽
// ------------------------------------------------------------------------------
export function createIvoryTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bCtx = bumpCanvas.getContext('2d');

    // 底色：温润古雅出土象牙色
    ctx.fillStyle = '#cbb89d';
    ctx.fillRect(0, 0, 512, 512);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 512);

    // 象牙微纵向生长条纹
    for (let x = 0; x < 512; x += 12) {
        ctx.strokeStyle = 'rgba(160, 120, 75, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + (Math.random() - 0.5) * 4, 0);
        ctx.lineTo(x + (Math.random() - 0.5) * 4, 512);
        ctx.stroke();

        bCtx.strokeStyle = 'rgb(180, 180, 180)';
        bCtx.lineWidth = 1.2;
        bCtx.beginPath();
        bCtx.moveTo(x + (Math.random() - 0.5) * 4, 0);
        bCtx.lineTo(x + (Math.random() - 0.5) * 4, 512);
        bCtx.stroke();
    }

    const map = setupTexture(new THREE.CanvasTexture(canvas), 2, 2);
    const bumpMap = setupTexture(new THREE.CanvasTexture(bumpCanvas), 2, 2);
    return { map, bumpMap };
}

// ------------------------------------------------------------------------------
// 13. 【西周陶板瓦与筒瓦】(Western Zhou Roof Tiles): 凤雏出土泥质灰陶板瓦与筒瓦纵向瓦垄、拍印绳纹
// ------------------------------------------------------------------------------
export function createZhouTileTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 1024;
    const bCtx = bumpCanvas.getContext('2d');

    // 基础古朴青灰陶瓦色 (Slate grey)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 1024, 1024);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    // 瓦垄纵向排布 (板瓦底槽 + 筒瓦拱凸)
    const ridgeWidth = 32;
    const ridgeCount = 1024 / ridgeWidth;

    for (let i = 0; i < ridgeCount; i++) {
        const x = i * ridgeWidth;
        const isCoverTile = i % 2 === 1; // 奇数为筒瓦凸垄，偶数为板瓦凹垄

        if (isCoverTile) {
            // 筒瓦拱面高光渐变
            const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
            grad.addColorStop(0, '#475569');
            grad.addColorStop(0.5, '#94a3b8');
            grad.addColorStop(1, '#334155');
            ctx.fillStyle = grad;
            ctx.fillRect(x, 0, ridgeWidth, 1024);

            const bGrad = bCtx.createLinearGradient(x, 0, x + ridgeWidth, 0);
            bGrad.addColorStop(0, '#505050');
            bGrad.addColorStop(0.5, '#f0f0f0');
            bGrad.addColorStop(1, '#404040');
            bCtx.fillStyle = bGrad;
            bCtx.fillRect(x, 0, ridgeWidth, 1024);
        } else {
            // 板瓦平槽
            ctx.fillStyle = '#526071';
            ctx.fillRect(x, 0, ridgeWidth, 1024);

            bCtx.fillStyle = '#707070';
            bCtx.fillRect(x, 0, ridgeWidth, 1024);
        }

        // 瓦身拍印细绳纹
        for (let y = 0; y < 1024; y += 8) {
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.22)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y + Math.sin(x * 0.1) * 2);
            ctx.lineTo(x + ridgeWidth, y + Math.sin((x + ridgeWidth) * 0.1) * 2);
            ctx.stroke();
        }
    }

    // 瓦片横向接缝阶梯节节套接
    for (let y = 0; y < 1024; y += 64) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fillRect(0, y, 1024, 3);
        bCtx.fillStyle = '#202020';
        bCtx.fillRect(0, y, 1024, 4);
    }

    return {
        map: setupTexture(new THREE.CanvasTexture(canvas), 4, 4),
        bumpMap: setupTexture(new THREE.CanvasTexture(bumpCanvas), 4, 4)
    };
}



