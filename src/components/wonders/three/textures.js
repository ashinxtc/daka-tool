import * as THREE from 'three';

/**
 * 🎨 时空营造司 · 高精度程序化 PBR 纹理发生器
 * 对标 Littlest Tokyo / WebGL 精品展馆级材质体系
 * 生成漫反射 (Map)、法线贴图 (NormalMap) 与粗糙度高光贴图 (RoughnessMap)
 */

export function createRammedEarthTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. 基底分层黄土色 (仰韶-良渚黄土台地)
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0.0, '#a57849');
    grad.addColorStop(0.2, '#926437');
    grad.addColorStop(0.4, '#b18758');
    grad.addColorStop(0.6, '#875b2f');
    grad.addColorStop(0.8, '#aa7e4e');
    grad.addColorStop(1.0, '#7c5126');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. 版筑水平夯窝与层理 (水平木板夹筑痕迹)
    for (let y = 0; y < 1024; y += 48) {
        ctx.fillStyle = (y % 96 === 0) ? 'rgba(50, 30, 10, 0.28)' : 'rgba(230, 200, 160, 0.16)';
        ctx.fillRect(0, y, 1024, 6);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(0, y + 6, 1024, 3);
    }

    // 3. 史前陶片颗粒与碎石砂砾 (Archaeological Inclusion)
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        const noise = (Math.random() - 0.5) * 42;
        d[i] = Math.min(255, Math.max(0, d[i] + noise));
        d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise * 0.85));
        d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise * 0.65));
        // 偶发红陶碎片颗粒
        if (Math.random() < 0.0015) {
            d[i] = 190;
            d[i + 1] = 75;
            d[i + 2] = 45;
        }
        // 偶发黑色炭屑颗粒
        if (Math.random() < 0.0012) {
            d[i] = 30;
            d[i + 1] = 25;
            d[i + 2] = 20;
        }
    }
    ctx.putImageData(imgData, 0, 0);

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;

    // 法线贴图
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 512;
    normalCanvas.height = 512;
    const nCtx = normalCanvas.getContext('2d');
    nCtx.fillStyle = '#8080ff';
    nCtx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 24) {
        nCtx.fillStyle = 'rgba(110, 120, 255, 0.4)';
        nCtx.fillRect(0, y, 512, 4);
    }
    const normalMap = new THREE.CanvasTexture(normalCanvas);
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;

    return { map, normalMap };
}

export function createThatchTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 干燥金褐芦苇芦草底色
    ctx.fillStyle = '#8b693e';
    ctx.fillRect(0, 0, 1024, 1024);

    // 细密重叠芦草纤维
    for (let i = 0; i < 4000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const len = 35 + Math.random() * 65;
        const w = 1.5 + Math.random() * 2.5;
        const tone = Math.random();
        if (tone < 0.35) {
            ctx.fillStyle = '#bfa16a'; // 干燥浅草黄
        } else if (tone < 0.7) {
            ctx.fillStyle = '#7a5a32'; // 深棕老草
        } else {
            ctx.fillStyle = '#523a1e'; // 压底阴影草
        }
        ctx.fillRect(x, y, w, len);
    }

    // 水平横向绑扎压竹草竿
    for (let y = 32; y < 1024; y += 128) {
        ctx.fillStyle = 'rgba(50, 35, 20, 0.7)';
        ctx.fillRect(0, y, 1024, 8);
        ctx.fillStyle = 'rgba(190, 160, 100, 0.4)';
        ctx.fillRect(0, y - 2, 1024, 3);
    }

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    return { map };
}

export function createWoodTextures(isNanmu = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (isNanmu) {
        // 金丝楠木 / 朱砂大漆
        ctx.fillStyle = '#993322'; // 典雅朱砂暗红
        ctx.fillRect(0, 0, 512, 512);

        // 金丝楠木温润流光与细微木纹
        for (let x = 0; x < 512; x += 6) {
            ctx.fillStyle = 'rgba(212, 168, 83, 0.15)'; // 金丝微光
            ctx.fillRect(x, 0, 2, 512);
        }
    } else {
        // 远古天然栎木 / 原始硬木
        ctx.fillStyle = '#5c432d';
        ctx.fillRect(0, 0, 512, 512);

        // 原木年轮纵纹
        for (let x = 0; x < 512; x += 4) {
            const alpha = 0.08 + Math.random() * 0.12;
            ctx.fillStyle = Math.random() > 0.5 ? `rgba(35, 22, 12, ${alpha})` : `rgba(130, 95, 60, ${alpha})`;
            ctx.fillRect(x, 0, 2 + Math.random() * 3, 512);
        }
    }

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    return { map };
}

export function createJadeCongTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. 良渚深邃碧玉 (透闪石-阳起石质)
    const grad = ctx.createRadialGradient(512, 512, 50, 512, 512, 600);
    grad.addColorStop(0.0, '#34d399'); // 内部通透翡翠微光
    grad.addColorStop(0.4, '#10b981');
    grad.addColorStop(0.7, '#047857');
    grad.addColorStop(1.0, '#064e3b'); // 边缘沉稳墨翠
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. 玉质云絮与白化浸润 (鸡骨白 / 沁色脉络)
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        const sx = Math.random() * 1024;
        const sy = Math.random() * 1024;
        ctx.arc(sx, sy, 30 + Math.random() * 70, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(236, 253, 245, 0.07)';
        ctx.fill();
    }

    // 3. 国宝神人兽面双层神徽雕刻线条 (发丝般精微阴线刻)
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)'; // 金黄色雕痕
    ctx.lineWidth = 3;

    // 神人羽冠与重圈眼
    for (let seg = 120; seg < 900; seg += 240) {
        // 上层神人脸面
        ctx.strokeRect(200, seg, 624, 80);
        // 双重圈大眼与鼻梯形
        ctx.beginPath();
        ctx.arc(380, seg + 40, 24, 0, Math.PI * 2);
        ctx.arc(644, seg + 40, 24, 0, Math.PI * 2);
        ctx.stroke();

        // 下层兽面大眼与獠牙阔嘴
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.85)';
        ctx.strokeRect(260, seg + 100, 504, 90);
        ctx.beginPath();
        ctx.arc(360, seg + 145, 32, 0, Math.PI * 2);
        ctx.arc(664, seg + 145, 32, 0, Math.PI * 2);
        ctx.stroke();
    }

    const map = new THREE.CanvasTexture(canvas);
    return { map };
}

export function createPaintedPotteryTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 仰韶澄泥红陶底胎
    ctx.fillStyle = '#c85a32';
    ctx.fillRect(0, 0, 1024, 1024);

    // 黑色矿物颜料彩绘：著名“人面鱼纹”与回旋水波纹
    ctx.fillStyle = '#1c1917'; // 纯正黑彩
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 14;

    for (let y = 100; y < 1000; y += 260) {
        // 游鱼躯体与鱼鳍
        ctx.beginPath();
        ctx.ellipse(320, y, 120, 48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(430, y);
        ctx.lineTo(480, y - 35);
        ctx.lineTo(480, y + 35);
        ctx.closePath();
        ctx.fill();

        // 几何宽带纹与三角网格
        ctx.fillRect(0, y + 70, 1024, 22);
        for (let x = 0; x < 1024; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, y + 92);
            ctx.lineTo(x + 30, y + 140);
            ctx.lineTo(x + 60, y + 92);
            ctx.stroke();
        }
    }

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    return { map };
}

export function createStonePaverTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 汉白玉/青石祭台石板
    ctx.fillStyle = '#ded9d2';
    ctx.fillRect(0, 0, 512, 512);

    // 凿刻石缝格网
    ctx.strokeStyle = 'rgba(70, 65, 60, 0.45)';
    ctx.lineWidth = 4;
    for (let x = 0; x <= 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
    }

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    return { map };
}

export function createWaterTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 水体法线/扰动纹理
    ctx.fillStyle = '#0f766e'; // 翡翠太湖水色
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(167, 243, 208, 0.45)'; // 水波反光
    ctx.lineWidth = 3;
    for (let y = 0; y < 512; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= 512; x += 32) {
            const cy = y + Math.sin(x * 0.05) * 6;
            ctx.lineTo(x, cy);
        }
        ctx.stroke();
    }

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    return map;
}

export function createAnimalPeltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // 熟化鹿皮/虎皮底色
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 256, 256);

    // 斑纹与毛绒质感
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(69, 26, 3, 0.5)' : 'rgba(254, 215, 170, 0.5)';
        ctx.fillRect(x, y, 4 + Math.random() * 8, 2);
    }

    const map = new THREE.CanvasTexture(canvas);
    return { map };
}
