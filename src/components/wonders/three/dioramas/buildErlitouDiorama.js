import * as THREE from 'three';

/**
 * 🏛️ 二里头 · 华夏第一王都（夏都一号宫殿）微缩立体建筑箱庭 (Architectural Diorama)
 * 对标 Littlest Tokyo (webgl_animation_keyframes) 级文博标杆：
 * 1. 考古地层厚切箱庭 (Diorama Strata Base): 4层中原黄土/红黏土剖面、双轨车辙官道、地下陶排水管网；
 * 2. 华夏最早封闭四合院廊庑体系: 巍峨正殿、东/西/南回廊柱网、双重开间南门塾；
 * 3. 早期青铜冶铸工坊: 官营炼铜窑炉、坩埚赤红熔流、石范铸件与升腾飞扬的火星动效；
 * 4. 至尊国宝重器联动: 绿松石镶嵌龙形器（华夏第一龙，浮沉呼吸神光）、夏代乳钉纹青铜第一爵、双轮辐条战车；
 * 5. 严格遵循 20 件标准零部件数据契约，支持悬停高亮、施工沉降与全向动画驱动。
 */
// 辅助工具：生成高密度 3D 参差草披垂尖与毛茸草丝垂须 (3D Thatch Eave Fringes)
function createThatchFringeGeometry(length, depth, count = 48) {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const normals = [];
    const step = length / count;
    const halfL = length / 2;

    for (let i = 0; i < count; i++) {
        const xLeft = -halfL + i * step;
        const xRight = xLeft + step;
        const xTip = xLeft + step * (0.3 + Math.random() * 0.4);
        const drop = depth * (0.7 + Math.random() * 0.65);
        const zTilt = (Math.random() - 0.5) * 0.12;

        // 正面三角形草尖
        vertices.push(
            xLeft, 0, 0,
            xRight, 0, 0,
            xTip, -drop, zTilt
        );
        // 背面三角形草尖
        vertices.push(
            xRight, 0, 0,
            xLeft, 0, 0,
            xTip, -drop, zTilt
        );

        for (let k = 0; k < 6; k++) {
            normals.push(0, 0.7, 0.7);
            uvs.push(i / count, k % 3 === 2 ? 1 : 0);
        }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geo;
}

// 辅助工具：构建标准中国古建四阿顶（庑殿顶 / Hip Roof）
function createHippedRoofGeometry(w, d, h, ridgeRatio = 0.5) {
    const hw = w / 2;
    const hd = d / 2;
    const ridgeL = Math.max(0.2, (w - d) * ridgeRatio + w * (1 - ridgeRatio) * 0.38);
    const hr = ridgeL / 2;

    const vertices = [];
    const uvs = [];
    const normals = [];

    function addTri(p1, p2, p3) {
        vertices.push(...p1, ...p2, ...p3);
        const v1 = new THREE.Vector3(...p1);
        const v2 = new THREE.Vector3(...p2);
        const v3 = new THREE.Vector3(...p3);
        const norm = new THREE.Vector3().crossVectors(v2.sub(v1), v3.sub(v1)).normalize();
        normals.push(norm.x, norm.y, norm.z, norm.x, norm.y, norm.z, norm.x, norm.y, norm.z);
        uvs.push(0, 0, 1, 0, 0.5, 1);
    }

    function addQuad(p1, p2, p3, p4) {
        addTri(p1, p2, p3);
        addTri(p1, p3, p4);
    }

    const cFL = [-hw, 0, hd];
    const cFR = [hw, 0, hd];
    const cBR = [hw, 0, -hd];
    const cBL = [-hw, 0, -hd];

    const rL = [-hr, h, 0];
    const rR = [hr, h, 0];

    // 南坡 (前坡)
    addQuad(cFL, cFR, rR, rL);
    // 北坡 (后坡)
    addQuad(cBR, cBL, rL, rR);
    // 西坡
    addTri(cBL, cFL, rL);
    // 东坡
    addTri(cFR, cBR, rR);
    // 底面封底
    addQuad(cFL, cBL, cBR, cFR);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geo;
}

export function buildErlitouDiorama({
    scene,
    stage,
    isConstructing,
    textures,
    fireLight,
    jadeLight,
    registerPhysicsMesh
}) {
    // 动效对象容器
    const animatedElements = {
        furnaceSparks: [],
        windBanners: [],
        turquoiseDragon: null,
        dragonLight: jadeLight,
        furnaceLight: fireLight,
        chariotWheels: []
    };

    // 基础 PBR 材质
    const materials = {
        rammedEarth: new THREE.MeshStandardMaterial({
            map: textures.rammedEarth.map,
            bumpMap: textures.rammedEarth.bumpMap,
            bumpScale: 0.14,
            roughness: 0.88,
            metalness: 0.04
        }),
        strataDeepSilt: new THREE.MeshStandardMaterial({
            color: 0x272019,
            roughness: 0.95,
            metalness: 0.02
        }),
        strataRedClay: new THREE.MeshStandardMaterial({
            color: 0x6e3d23,
            roughness: 0.92,
            metalness: 0.03
        }),
        strataPaleoSoil: new THREE.MeshStandardMaterial({
            color: 0x936534,
            roughness: 0.9,
            metalness: 0.03
        }),
        oakWood: new THREE.MeshStandardMaterial({
            map: textures.oakWood.map,
            roughness: 0.72,
            metalness: 0.05
        }),
        nanmuWood: new THREE.MeshStandardMaterial({
            map: textures.nanmuWood.map,
            roughness: 0.65,
            metalness: 0.08
        }),
        thatch: new THREE.MeshStandardMaterial({
            map: textures.thatch.map,
            bumpMap: textures.thatch.bumpMap,
            bumpScale: 0.24,
            roughness: 0.82,
            metalness: 0.02,
            side: THREE.DoubleSide
        }),
        stonePaver: new THREE.MeshStandardMaterial({
            map: textures.stonePaver.map,
            bumpMap: textures.stonePaver.bumpMap,
            bumpScale: 0.08,
            roughness: 0.78,
            metalness: 0.05
        }),
        pottery: new THREE.MeshStandardMaterial({
            map: textures.pottery.map,
            roughness: 0.68,
            metalness: 0.08
        }),
        bronze: new THREE.MeshStandardMaterial({
            map: textures.bronze ? textures.bronze.map : null,
            bumpMap: textures.bronze ? textures.bronze.bumpMap : null,
            bumpScale: 0.08,
            color: 0x3d5a45,
            roughness: 0.38,
            metalness: 0.78
        }),
        brightBronze: new THREE.MeshStandardMaterial({
            color: 0xd97706,
            roughness: 0.32,
            metalness: 0.85
        }),
        moltenCopper: new THREE.MeshStandardMaterial({
            color: 0xff3b00,
            emissive: new THREE.Color(0xff4500),
            emissiveIntensity: 2.2,
            roughness: 0.25,
            metalness: 0.5
        }),
        turquoise: new THREE.MeshStandardMaterial({
            map: textures.turquoise ? textures.turquoise.map : null,
            bumpMap: textures.turquoise ? textures.turquoise.bumpMap : null,
            bumpScale: 0.04,
            color: 0x14b8a6,
            emissive: new THREE.Color(0x0d9488),
            emissiveIntensity: 0.85,
            roughness: 0.28,
            metalness: 0.12
        }),
        vermilionWall: new THREE.MeshStandardMaterial({
            color: 0xa8422b,
            roughness: 0.85,
            metalness: 0.04
        }),
        whitePlaster: new THREE.MeshStandardMaterial({
            color: 0xf1efe7,
            roughness: 0.65,
            metalness: 0.02
        }),
        bannerSilk: new THREE.MeshStandardMaterial({
            color: 0xb91c1c,
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide
        })
    };

    // 辅助工具：阴影投射与接收
    const applyShadows = (mesh) => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    };

    // =========================================================================
    // 0. 箱庭剖面底座 (Diorama Strata Cutaway Base)
    // =========================================================================
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    // 四层横向厚切考古地质剖面 (宽 32, 长 30, 厚 3.4)
    const baseW = 32;
    const baseL = 30;
    const strataLayers = [
        { h: 0.8, mat: materials.strataDeepSilt, y: -2.6 },
        { h: 0.9, mat: materials.strataRedClay, y: -1.75 },
        { h: 0.9, mat: materials.strataPaleoSoil, y: -0.85 },
        { h: 0.8, mat: materials.rammedEarth, y: 0.0 }
    ];

    strataLayers.forEach((layer) => {
        const geo = new THREE.BoxGeometry(baseW, layer.h, baseL);
        const mesh = new THREE.Mesh(geo, layer.mat);
        mesh.position.set(0, layer.y, 0);
        applyShadows(mesh);
        baseGroup.add(mesh);
    });

    // 箱庭边缘考古标尺倒角黑石护框
    const borderGeo = new THREE.BoxGeometry(baseW + 0.5, 0.2, baseL + 0.5);
    const borderMesh = new THREE.Mesh(borderGeo, materials.strataDeepSilt);
    borderMesh.position.y = -3.05;
    baseGroup.add(borderMesh);

    // =========================================================================
    // 🏛️ 考古级高精度二里头核心文物雕塑发生器 (Museum-Grade Erlitou Artifact Sculptors)
    // =========================================================================

    // 1. 超级国宝 · 绿松石镶嵌龙形器（华夏第一龙，2000余片绿松石鳞甲+蒜头鼻+碧玉圆目+带翼青铜铃）
    const buildSculptedTurquoiseDragon = () => {
        const root = new THREE.Group();

        // 龙身主干：三维波浪蜿蜒起伏空间曲线
        const spineCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.45, 2.2),     // 颈部连接处
            new THREE.Vector3(0.42, 0.25, 1.6),   // 第一波曲
            new THREE.Vector3(-0.38, -0.05, 0.9), // 第二波曲
            new THREE.Vector3(0.45, 0.18, 0.2),   // 第三波曲
            new THREE.Vector3(-0.42, -0.12, -0.6),// 第四波曲
            new THREE.Vector3(0.35, 0.08, -1.3),  // 第五波曲
            new THREE.Vector3(-0.25, -0.05, -1.9),// 尾部渐细
            new THREE.Vector3(0.0, 0.0, -2.5)     // 尾梢
        ]);

        const dragonBodyGeo = new THREE.TubeGeometry(spineCurve, 36, 0.22, 8, false);
        const dragonBodyMesh = new THREE.Mesh(dragonBodyGeo, materials.turquoise);
        applyShadows(dragonBodyMesh);
        root.add(dragonBodyMesh);

        // 菱形绿松石鳞甲片
        const points = spineCurve.getPoints(24);
        for (let i = 0; i < points.length - 1; i++) {
            const pt = points[i];
            const nextPt = points[i + 1];
            const dir = new THREE.Vector3().subVectors(nextPt, pt).normalize();

            const scaleGeo = new THREE.OctahedronGeometry(0.12 * (1.0 - i * 0.025), 0);
            const scaleMesh = new THREE.Mesh(scaleGeo, materials.turquoise);
            scaleMesh.position.copy(pt);
            scaleMesh.position.y += 0.12 * (1.0 - i * 0.03);
            scaleMesh.scale.set(1.4, 0.5, 1.0);
            scaleMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
            applyShadows(scaleMesh);
            root.add(scaleMesh);
        }

        // 龙头部分
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.48, 2.5);

        const headShape = new THREE.Shape();
        headShape.moveTo(-0.45, -0.2);
        headShape.lineTo(-0.35, 0.5);
        headShape.lineTo(0.35, 0.5);
        headShape.lineTo(0.45, -0.2);
        headShape.closePath();
        const headGeo = new THREE.ExtrudeGeometry(headShape, {
            depth: 0.28,
            bevelEnabled: true,
            bevelSegments: 2,
            bevelSize: 0.05,
            bevelThickness: 0.05
        });
        const headMesh = new THREE.Mesh(headGeo, materials.turquoise);
        headMesh.rotation.x = -Math.PI / 2;
        headMesh.position.set(0, 0.1, 0.2);
        applyShadows(headMesh);
        headGroup.add(headMesh);

        // 蒜头鼻
        const noseGeo = new THREE.SphereGeometry(0.22, 16, 12);
        const noseMesh = new THREE.Mesh(noseGeo, materials.turquoise);
        noseMesh.scale.set(1.3, 0.8, 1.1);
        noseMesh.position.set(0, 0.12, 0.65);
        applyShadows(noseMesh);
        headGroup.add(noseMesh);

        // 碧玉圆珠眼与梭形眼眶
        [-0.24, 0.24].forEach((ex) => {
            const socketGeo = new THREE.BoxGeometry(0.24, 0.06, 0.12);
            const socketMesh = new THREE.Mesh(socketGeo, materials.turquoise);
            socketMesh.position.set(ex, 0.22, 0.35);
            socketMesh.rotation.z = (ex > 0 ? -1 : 1) * 0.2;
            headGroup.add(socketMesh);

            const eyeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), materials.whitePlaster);
            eyeOrb.position.set(ex, 0.24, 0.36);
            headGroup.add(eyeOrb);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), materials.strataDeepSilt);
            pupil.position.set(ex, 0.28, 0.42);
            headGroup.add(pupil);
        });

        // 弧形展角神耳
        [-0.38, 0.38].forEach((hx) => {
            const hornGeo = new THREE.ConeGeometry(0.12, 0.45, 6);
            const hornMesh = new THREE.Mesh(hornGeo, materials.turquoise);
            hornMesh.position.set(hx, 0.28, -0.15);
            hornMesh.rotation.x = -0.55;
            hornMesh.rotation.z = (hx > 0 ? 1 : -1) * 0.4;
            headGroup.add(hornMesh);
        });
        root.add(headGroup);

        // 龙尾系青铜翼铃与玉舌
        const bellGroup = new THREE.Group();
        bellGroup.position.set(0, 0.02, -2.65);

        const bellPts = [
            new THREE.Vector2(0.02, 0.35),
            new THREE.Vector2(0.06, 0.32),
            new THREE.Vector2(0.12, 0.22),
            new THREE.Vector2(0.18, 0.08),
            new THREE.Vector2(0.22, 0.0),
            new THREE.Vector2(0.24, -0.05),
            new THREE.Vector2(0.20, -0.05),
            new THREE.Vector2(0.02, -0.02)
        ];
        const bellGeo = new THREE.LatheGeometry(bellPts, 18);
        const bellMesh = new THREE.Mesh(bellGeo, materials.brightBronze);
        applyShadows(bellMesh);
        bellGroup.add(bellMesh);

        const bellLoop = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 6, 16), materials.brightBronze);
        bellLoop.position.set(0, 0.4, 0);
        bellGroup.add(bellLoop);

        const clapper = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.22, 8), materials.whitePlaster);
        clapper.position.set(0, 0.08, 0);
        bellGroup.add(clapper);
        root.add(bellGroup);

        // 神圣碧玉聚能光环
        const auraRing = new THREE.Mesh(
            new THREE.TorusGeometry(1.85, 0.035, 16, 48),
            new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.65 })
        );
        auraRing.rotation.x = Math.PI / 2;
        auraRing.position.set(0, 0.2, 0);
        root.add(auraRing);

        root.scale.set(1.4, 1.4, 1.4);
        return root;
    };

    // 2. 华夏第一爵 · 夏代乳钉纹青铜爵（狭长前流+尖长后尾+束腰平底+三棱尖足+单排乳钉）
    const buildSculptedBronzeJue = () => {
        const root = new THREE.Group();

        // 爵身：束腰平底筒腹
        const juePts = [
            new THREE.Vector2(0.01, 0.0),
            new THREE.Vector2(0.22, 0.0),
            new THREE.Vector2(0.23, 0.15),
            new THREE.Vector2(0.17, 0.38),
            new THREE.Vector2(0.24, 0.62),
            new THREE.Vector2(0.26, 0.66),
            new THREE.Vector2(0.22, 0.64),
            new THREE.Vector2(0.14, 0.38),
            new THREE.Vector2(0.18, 0.15),
            new THREE.Vector2(0.01, 0.04)
        ];
        const jueGeo = new THREE.LatheGeometry(juePts, 24);
        const jueBody = new THREE.Mesh(jueGeo, materials.bronze);
        applyShadows(jueBody);
        root.add(jueBody);

        // 狭长槽状前流
        const spoutShape = new THREE.Shape();
        spoutShape.moveTo(-0.12, 0);
        spoutShape.quadraticCurveTo(0, -0.08, 0.12, 0);
        spoutShape.lineTo(0.09, 0.72);
        spoutShape.quadraticCurveTo(0, 0.68, -0.09, 0.72);
        spoutShape.closePath();
        const spoutGeo = new THREE.ExtrudeGeometry(spoutShape, { depth: 0.035, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
        const spoutMesh = new THREE.Mesh(spoutGeo, materials.bronze);
        spoutMesh.position.set(0, 0.58, 0.16);
        spoutMesh.rotation.x = Math.PI / 3;
        applyShadows(spoutMesh);
        root.add(spoutMesh);

        // 尖翘尾翼
        const tailShape = new THREE.Shape();
        tailShape.moveTo(-0.11, 0);
        tailShape.lineTo(0, 0.52);
        tailShape.lineTo(0.11, 0);
        tailShape.closePath();
        const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
        const tailMesh = new THREE.Mesh(tailGeo, materials.bronze);
        tailMesh.position.set(0, 0.62, -0.16);
        tailMesh.rotation.x = -Math.PI / 3.2;
        applyShadows(tailMesh);
        root.add(tailMesh);

        // 镂空扁平鋬手
        const handleCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.24, 0.55, 0),
            new THREE.Vector3(0.44, 0.38, 0),
            new THREE.Vector3(0.42, 0.18, 0),
            new THREE.Vector3(0.22, 0.12, 0)
        ]);
        const handleGeo = new THREE.TubeGeometry(handleCurve, 16, 0.035, 6, false);
        const handleMesh = new THREE.Mesh(handleGeo, materials.bronze);
        applyShadows(handleMesh);
        root.add(handleMesh);

        // 三棱形修长细尖足
        const legShape = new THREE.Shape();
        legShape.moveTo(0, 0.05);
        legShape.lineTo(-0.045, -0.03);
        legShape.lineTo(0.045, -0.03);
        legShape.closePath();
        const legGeo = new THREE.ExtrudeGeometry(legShape, { depth: 0.85, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.01, bevelThickness: 0.01 });

        [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].forEach((ang) => {
            const legMesh = new THREE.Mesh(legGeo, materials.bronze);
            legMesh.rotation.x = Math.PI / 2 + 0.12;
            legMesh.rotation.y = ang;
            legMesh.position.set(Math.cos(ang) * 0.16, 0.02, Math.sin(ang) * 0.16);
            applyShadows(legMesh);
            root.add(legMesh);
        });

        // 单排5颗乳钉纹
        for (let i = -2; i <= 2; i++) {
            const boss = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), materials.brightBronze);
            boss.position.set(-0.18, 0.38, i * 0.065);
            root.add(boss);
        }

        // 汉白玉/青石祭祀高案几
        const tableGroup = new THREE.Group();
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 1.3), materials.stonePaver);
        tableTop.position.y = -0.95;
        applyShadows(tableTop);
        tableGroup.add(tableTop);
        const tableRim = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.06, 1.34), materials.vermilionWall);
        tableRim.position.y = -0.83;
        tableGroup.add(tableRim);
        root.add(tableGroup);

        root.scale.set(1.4, 1.4, 1.4);
        return root;
    };

    // 3. 嵌绿松石兽面纹铜牌饰 (Sculpted Turquoise-Inlaid Bronze Plaque)
    const buildSculptedBronzePlaque = () => {
        const root = new THREE.Group();

        // 青铜凸弧形牌基座
        const frameShape = new THREE.Shape();
        frameShape.moveTo(-0.7, -1.0);
        frameShape.lineTo(-0.78, 0.95);
        frameShape.quadraticCurveTo(0, 1.15, 0.78, 0.95);
        frameShape.lineTo(0.7, -1.0);
        frameShape.quadraticCurveTo(0, -1.15, -0.7, -1.0);
        frameShape.closePath();

        const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
            depth: 0.12,
            bevelEnabled: true,
            bevelSegments: 3,
            bevelSize: 0.035,
            bevelThickness: 0.035
        });
        const frameMesh = new THREE.Mesh(frameGeo, materials.bronze);
        applyShadows(frameMesh);
        root.add(frameMesh);

        // 牌身两侧穿孔系耳
        [-0.7, 0.2, -0.3, 0.7].forEach((ly) => {
            [-0.82, 0.82].forEach((lx) => {
                const loop = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 12), materials.bronze);
                loop.position.set(lx, ly, 0.06);
                root.add(loop);
            });
        });

        // 双重圈眼
        [-0.32, 0.32].forEach((ex) => {
            const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 18), materials.turquoise);
            eyeRing.position.set(ex, 0.22, 0.14);
            root.add(eyeRing);

            const eyePupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), materials.brightBronze);
            eyePupil.position.set(ex, 0.22, 0.14);
            root.add(eyePupil);
        });

        // 弯曲双角
        [-1, 1].forEach((dir) => {
            const hornCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(dir * 0.12, 0.45, 0.14),
                new THREE.Vector3(dir * 0.42, 0.75, 0.14),
                new THREE.Vector3(dir * 0.58, 0.65, 0.14)
            ]);
            const hornGeo = new THREE.TubeGeometry(hornCurve, 12, 0.045, 6, false);
            const hornMesh = new THREE.Mesh(hornGeo, materials.turquoise);
            root.add(hornMesh);
        });

        // 凸字形鼻梁与獠牙
        const noseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.06), materials.turquoise);
        noseMesh.position.set(0, 0.0, 0.14);
        root.add(noseMesh);

        // 下颌绿松石云纹鳞甲
        for (let r = 0; r < 4; r++) {
            for (let c = -2; c <= 2; c++) {
                const tile = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.03), materials.turquoise);
                tile.position.set(c * 0.14, -0.32 - r * 0.12, 0.14);
                root.add(tile);
            }
        }

        return root;
    };

    // 4. 节节套接陶制公母榫卯排水暗管 (Sculpted Bell-and-Spigot Ceramic Drainage Pipes)
    const buildSculptedPotteryPipes = () => {
        const pipeGroup = new THREE.Group();
        for (let i = 0; i < 9; i++) {
            const section = new THREE.Group();
            const pipePts = [
                new THREE.Vector2(0.22, 0.0),
                new THREE.Vector2(0.25, 0.0),
                new THREE.Vector2(0.25, 0.15),
                new THREE.Vector2(0.21, 0.22),
                new THREE.Vector2(0.19, 0.72),
                new THREE.Vector2(0.18, 0.85),
                new THREE.Vector2(0.15, 0.85),
                new THREE.Vector2(0.15, 0.0)
            ];
            const pipeGeo = new THREE.LatheGeometry(pipePts, 16);
            const pipeMesh = new THREE.Mesh(pipeGeo, materials.pottery);
            pipeMesh.rotation.x = Math.PI / 2;
            applyShadows(pipeMesh);
            section.add(pipeMesh);

            for (let r = 0; r < 3; r++) {
                const cordRib = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 6, 16), materials.pottery);
                cordRib.position.set(0, 0, 0.28 + r * 0.18);
                section.add(cordRib);
            }

            section.position.set(3.2, 0.35, 1.8 + i * 0.85);
            pipeGroup.add(section);
        }
        return pipeGroup;
    };

    // =========================================================================
    // 【第一阶段：华夏主轴】(Stage >= 1)
    // 1. 万方版筑夯土大台基 (part_elt_1_r1)
    // 2. 环院散水鹅卵石明沟 (part_elt_1_r2)
    // 3. 陶制节节相套排水暗管 (part_elt_1_r3)
    // 4. 官道平整双轨车辙石 (part_elt_1_r4)
    // 5. 洛水青石定穴规矩盘 (part_elt_1_k) [关键件]
    // =========================================================================
    if (stage >= 1) {
        // 1.1 万方版筑夯土大台基 (part_elt_1_r1)
        // 宫城核心大台基：抬高 0.7m，南北宽阔
        const terraceGroup = new THREE.Group();
        const mainTerraceGeo = new THREE.BoxGeometry(26.0, 0.7, 24.0);
        const mainTerrace = new THREE.Mesh(mainTerraceGeo, materials.rammedEarth);
        mainTerrace.position.set(0, 0.55, 0);
        applyShadows(mainTerrace);
        terraceGroup.add(mainTerrace);

        // 正殿后部再抬高二级基座
        const hallPlinthGeo = new THREE.BoxGeometry(19.0, 0.45, 8.5);
        const hallPlinth = new THREE.Mesh(hallPlinthGeo, materials.rammedEarth);
        hallPlinth.position.set(0, 1.05, -6.5);
        applyShadows(hallPlinth);
        terraceGroup.add(hallPlinth);

        terraceGroup.userData = { id: 'part_elt_1_r1' };
        scene.add(terraceGroup);
        registerPhysicsMesh(terraceGroup, 'part_elt_1_r1', 1, 1, false);

        // 1.2 环院散水鹅卵石明沟 (part_elt_1_r2)
        // 围绕正殿基座四周围绕的鹅卵石散水护坡排水槽
        const apronGroup = new THREE.Group();
        const pebbleGeo = new THREE.DodecahedronGeometry(0.18, 1);
        const pebbleMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.8,
            metalness: 0.1
        });

        // 沿正殿台基周边密布散水石
        for (let x = -9.8; x <= 9.8; x += 0.45) {
            // 前排散水石
            const pMesh1 = new THREE.Mesh(pebbleGeo, pebbleMat);
            pMesh1.position.set(x + (Math.random() - 0.5) * 0.1, 0.92, -2.1 + (Math.random() - 0.5) * 0.1);
            pMesh1.rotation.set(Math.random(), Math.random(), Math.random());
            apronGroup.add(pMesh1);

            // 后排散水石
            const pMesh2 = new THREE.Mesh(pebbleGeo, pebbleMat);
            pMesh2.position.set(x + (Math.random() - 0.5) * 0.1, 0.92, -10.9 + (Math.random() - 0.5) * 0.1);
            pMesh2.rotation.set(Math.random(), Math.random(), Math.random());
            apronGroup.add(pMesh2);
        }

        // 左右侧边散水
        for (let z = -10.8; z <= -2.2; z += 0.5) {
            const pMeshL = new THREE.Mesh(pebbleGeo, pebbleMat);
            pMeshL.position.set(-9.7 + (Math.random() - 0.5) * 0.1, 0.92, z);
            apronGroup.add(pMeshL);

            const pMeshR = new THREE.Mesh(pebbleGeo, pebbleMat);
            pMeshR.position.set(9.7 + (Math.random() - 0.5) * 0.1, 0.92, z);
            apronGroup.add(pMeshR);
        }

        // 明沟暗槽轮廓
        const trenchGeo = new THREE.BoxGeometry(20.4, 0.08, 0.5);
        const trenchFront = new THREE.Mesh(trenchGeo, materials.strataDeepSilt);
        trenchFront.position.set(0, 0.88, -2.1);
        apronGroup.add(trenchFront);

        apronGroup.userData = { id: 'part_elt_1_r2' };
        scene.add(apronGroup);
        registerPhysicsMesh(apronGroup, 'part_elt_1_r2', 1, 2, false);

        // 1.3 陶制节节相套排水暗管 (part_elt_1_r3)
        // 二里头著名的陶质下水管道，节节公母榫卯套接，带凸箍与绳纹
        const pipeGroup = buildSculptedPotteryPipes();
        pipeGroup.userData = { id: 'part_elt_1_r3' };
        scene.add(pipeGroup);
        registerPhysicsMesh(pipeGroup, 'part_elt_1_r3', 1, 3, false);

        // 1.4 官道平整双轨车辙石 (part_elt_1_r4)
        // 二里头遗址发现了中国最早的双轮战车车辙痕迹（车轨约 1.0~1.1 米）
        const rutsGroup = new THREE.Group();
        const rutGeo = new THREE.BoxGeometry(0.22, 0.06, 11.0);
        const rutMat = new THREE.MeshStandardMaterial({
            color: 0x5a4128,
            roughness: 0.9,
            metalness: 0.05
        });

        // 左右两道深车辙
        const rutLeft = new THREE.Mesh(rutGeo, rutMat);
        rutLeft.position.set(-0.55, 0.91, 6.5);
        applyShadows(rutLeft);
        rutsGroup.add(rutLeft);

        const rutRight = new THREE.Mesh(rutGeo, rutMat);
        rutRight.position.set(0.55, 0.91, 6.5);
        applyShadows(rutRight);
        rutsGroup.add(rutRight);

        // 官道夯筑压实平整路面
        const roadGeo = new THREE.BoxGeometry(2.4, 0.04, 11.0);
        const roadMesh = new THREE.Mesh(roadGeo, materials.rammedEarth);
        roadMesh.position.set(0, 0.9, 6.5);
        rutsGroup.add(roadMesh);

        rutsGroup.userData = { id: 'part_elt_1_r4' };
        scene.add(rutsGroup);
        registerPhysicsMesh(rutsGroup, 'part_elt_1_r4', 1, 4, false);

        // 1.5 【关键件】洛水青石定穴规矩盘 (part_elt_1_k)
        // 庭院中央的八角定穴量天石盘，雕刻早期十字定向经纬与夏代天象标
        const surveyGroup = new THREE.Group();
        const baseStoneGeo = new THREE.CylinderGeometry(0.95, 1.15, 0.35, 8);
        const baseStone = new THREE.Mesh(baseStoneGeo, materials.stonePaver);
        baseStone.position.set(0, 1.08, 0);
        applyShadows(baseStone);
        surveyGroup.add(baseStone);

        // 规矩青铜盘面
        const dialGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.08, 32);
        const dialMesh = new THREE.Mesh(dialGeo, materials.brightBronze);
        dialMesh.position.set(0, 1.28, 0);
        surveyGroup.add(dialMesh);

        // 圭表铜立柱 (日影定向金针)
        const gnomonGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.2, 16);
        const gnomonMesh = new THREE.Mesh(gnomonGeo, materials.brightBronze);
        gnomonMesh.position.set(0, 1.9, 0);
        applyShadows(gnomonMesh);
        surveyGroup.add(gnomonMesh);

        // 定位墨线准绳
        const lineGeo = new THREE.BoxGeometry(1.6, 0.02, 0.06);
        const lineCross = new THREE.Mesh(lineGeo, materials.strataDeepSilt);
        lineCross.position.set(0, 1.33, 0);
        surveyGroup.add(lineCross);

        const lineCross2 = lineCross.clone();
        lineCross2.rotation.y = Math.PI / 2;
        surveyGroup.add(lineCross2);

        surveyGroup.userData = { id: 'part_elt_1_k' };
        scene.add(surveyGroup);
        registerPhysicsMesh(surveyGroup, 'part_elt_1_k', 1, 0, true);
    }

    // =========================================================================
    // 【第二阶段：廊庑成网】(Stage >= 2)
    // 1. 南大门双重主门塾柱 (part_elt_2_k) [关键件]
    // 2. 东庑连列木构排柱 (part_elt_2_r1)
    // 3. 西庑连列木构排柱 (part_elt_2_r2)
    // 4. 南回廊抱头榫木横枋 (part_elt_2_r3)
    // 5. 廊庑双坡防雨出檐椽 (part_elt_2_r4)
    // =========================================================================
    if (stage >= 2) {
        // 2.1 东庑连列木构排柱 (part_elt_2_r1)
        // 东廊纵向延伸 16 米，双排柱列
        const eastCorridorGroup = new THREE.Group();
        const colGeo = new THREE.CylinderGeometry(0.16, 0.18, 3.4, 12);
        const plinthGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.16, 12);

        for (let z = -8.0; z <= 8.0; z += 1.8) {
            // 内外双排列柱
            [-11.2, -9.6].forEach((x) => {
                const col = new THREE.Mesh(colGeo, materials.oakWood);
                col.position.set(x, 2.6, z);
                applyShadows(col);
                eastCorridorGroup.add(col);

                const plinth = new THREE.Mesh(plinthGeo, materials.stonePaver);
                plinth.position.set(x, 0.98, z);
                eastCorridorGroup.add(plinth);
            });
        }
        eastCorridorGroup.userData = { id: 'part_elt_2_r1' };
        scene.add(eastCorridorGroup);
        registerPhysicsMesh(eastCorridorGroup, 'part_elt_2_r1', 2, 1, false);

        // 2.2 西庑连列木构排柱 (part_elt_2_r2)
        // 对称西侧廊庑排柱
        const westCorridorGroup = new THREE.Group();
        for (let z = -8.0; z <= 8.0; z += 1.8) {
            [11.2, 9.6].forEach((x) => {
                const col = new THREE.Mesh(colGeo, materials.oakWood);
                col.position.set(x, 2.6, z);
                applyShadows(col);
                westCorridorGroup.add(col);

                const plinth = new THREE.Mesh(plinthGeo, materials.stonePaver);
                plinth.position.set(x, 0.98, z);
                westCorridorGroup.add(plinth);
            });
        }
        westCorridorGroup.userData = { id: 'part_elt_2_r2' };
        scene.add(westCorridorGroup);
        registerPhysicsMesh(westCorridorGroup, 'part_elt_2_r2', 2, 2, false);

        // 2.3 南回廊抱头榫木横枋 (part_elt_2_r3)
        // 连接东、西、南各柱头的纵横木枋梁与榫卯拉架构架
        const southBeamsGroup = new THREE.Group();
        const beamXGeo = new THREE.BoxGeometry(8.2, 0.24, 0.24);
        const tieBeamGeo = new THREE.BoxGeometry(0.24, 0.22, 1.8);

        // 南廊东西两段长梁
        const beamSouthEast = new THREE.Mesh(beamXGeo, materials.oakWood);
        beamSouthEast.position.set(-6.5, 4.3, 8.8);
        applyShadows(beamSouthEast);
        southBeamsGroup.add(beamSouthEast);

        const beamSouthWest = new THREE.Mesh(beamXGeo, materials.oakWood);
        beamSouthWest.position.set(6.5, 4.3, 8.8);
        applyShadows(beamSouthWest);
        southBeamsGroup.add(beamSouthWest);

        // 贯通东庑与西庑的长大枋梁
        const longBeamZGeo = new THREE.BoxGeometry(0.24, 0.24, 17.6);
        const beamEastIn = new THREE.Mesh(longBeamZGeo, materials.oakWood);
        beamEastIn.position.set(-9.6, 4.3, 0);
        southBeamsGroup.add(beamEastIn);

        const beamEastOut = new THREE.Mesh(longBeamZGeo, materials.oakWood);
        beamEastOut.position.set(-11.2, 4.3, 0);
        southBeamsGroup.add(beamEastOut);

        const beamWestIn = new THREE.Mesh(longBeamZGeo, materials.oakWood);
        beamWestIn.position.set(9.6, 4.3, 0);
        southBeamsGroup.add(beamWestIn);

        const beamWestOut = new THREE.Mesh(longBeamZGeo, materials.oakWood);
        beamWestOut.position.set(11.2, 4.3, 0);
        southBeamsGroup.add(beamWestOut);

        // 抱头榫横拉短枋 (每隔间一道)
        for (let z = -7.5; z <= 7.5; z += 1.8) {
            const tieE = new THREE.Mesh(tieBeamGeo, materials.oakWood);
            tieE.position.set(-10.4, 4.35, z);
            southBeamsGroup.add(tieE);

            const tieW = new THREE.Mesh(tieBeamGeo, materials.oakWood);
            tieW.position.set(10.4, 4.35, z);
            southBeamsGroup.add(tieW);
        }

        southBeamsGroup.userData = { id: 'part_elt_2_r3' };
        scene.add(southBeamsGroup);
        registerPhysicsMesh(southBeamsGroup, 'part_elt_2_r3', 2, 3, false);

        // 2.4 廊庑双坡防雨出檐椽 (part_elt_2_r4)
        // 回廊人字双坡或单坡草顶及挑檐密排椽木与3D垂落草丝
        const corridorRoofsGroup = new THREE.Group();

        // 东廊屋顶 (向中院倾斜的厚草坡)
        const eastRoofGeo = new THREE.BoxGeometry(2.8, 0.25, 17.8);
        const eastRoof = new THREE.Mesh(eastRoofGeo, materials.thatch);
        eastRoof.position.set(-10.4, 4.65, 0);
        eastRoof.rotation.z = 0.18;
        applyShadows(eastRoof);
        corridorRoofsGroup.add(eastRoof);

        // 东廊内侧 3D 垂檐草披 (面对中央大庭院)
        const fringeEast = new THREE.Mesh(createThatchFringeGeometry(17.8, 0.42, 48), materials.thatch);
        fringeEast.position.set(-9.1, 4.45, 0);
        fringeEast.rotation.y = -Math.PI / 2;
        fringeEast.rotation.x = 0.18;
        fringeEast.castShadow = true;
        corridorRoofsGroup.add(fringeEast);

        // 西廊屋顶
        const westRoof = new THREE.Mesh(eastRoofGeo, materials.thatch);
        westRoof.position.set(10.4, 4.65, 0);
        westRoof.rotation.z = -0.18;
        applyShadows(westRoof);
        corridorRoofsGroup.add(westRoof);

        // 西廊内侧 3D 垂檐草披
        const fringeWest = new THREE.Mesh(createThatchFringeGeometry(17.8, 0.42, 48), materials.thatch);
        fringeWest.position.set(9.1, 4.45, 0);
        fringeWest.rotation.y = Math.PI / 2;
        fringeWest.rotation.x = 0.18;
        fringeWest.castShadow = true;
        corridorRoofsGroup.add(fringeWest);

        // 南回廊东西两侧小草顶
        const southRoofGeo = new THREE.BoxGeometry(8.4, 0.25, 2.8);
        const southRoofE = new THREE.Mesh(southRoofGeo, materials.thatch);
        southRoofE.position.set(-6.5, 4.65, 8.8);
        southRoofE.rotation.x = -0.18;
        applyShadows(southRoofE);
        corridorRoofsGroup.add(southRoofE);

        const fringeSouthE = new THREE.Mesh(createThatchFringeGeometry(8.4, 0.42, 32), materials.thatch);
        fringeSouthE.position.set(-6.5, 4.45, 7.5);
        fringeSouthE.rotation.y = Math.PI;
        fringeSouthE.rotation.x = -0.18;
        fringeSouthE.castShadow = true;
        corridorRoofsGroup.add(fringeSouthE);

        const southRoofW = new THREE.Mesh(southRoofGeo, materials.thatch);
        southRoofW.position.set(6.5, 4.65, 8.8);
        southRoofW.rotation.x = -0.18;
        applyShadows(southRoofW);
        corridorRoofsGroup.add(southRoofW);

        const fringeSouthW = new THREE.Mesh(createThatchFringeGeometry(8.4, 0.42, 32), materials.thatch);
        fringeSouthW.position.set(6.5, 4.45, 7.5);
        fringeSouthW.rotation.y = Math.PI;
        fringeSouthW.rotation.x = -0.18;
        fringeSouthW.castShadow = true;
        corridorRoofsGroup.add(fringeSouthW);

        corridorRoofsGroup.userData = { id: 'part_elt_2_r4' };
        scene.add(corridorRoofsGroup);
        registerPhysicsMesh(corridorRoofsGroup, 'part_elt_2_r4', 2, 4, false);

        // 2.5 【关键件】南大门双重主门塾柱 (part_elt_2_k)
        // 巍峨的夏王宫正门塾（四阿四面坡大门楼，左右门塾卫房）
        const southGateGroup = new THREE.Group();
        const gatePillarGeo = new THREE.CylinderGeometry(0.25, 0.28, 4.2, 16);

        // 门楼四根粗大门柱
        [
            [-1.8, 8.2], [1.8, 8.2],
            [-1.8, 9.6], [1.8, 9.6]
        ].forEach(([gx, gz]) => {
            const pillar = new THREE.Mesh(gatePillarGeo, materials.nanmuWood);
            pillar.position.set(gx, 3.0, gz);
            applyShadows(pillar);
            southGateGroup.add(pillar);

            const plinth = new THREE.Mesh(plinthGeo, materials.stonePaver);
            plinth.position.set(gx, 0.98, gz);
            southGateGroup.add(plinth);
        });

        // 大门额枋与雀替
        const gateLintelGeo = new THREE.BoxGeometry(4.8, 0.38, 0.45);
        const gateLintel = new THREE.Mesh(gateLintelGeo, materials.nanmuWood);
        gateLintel.position.set(0, 5.0, 8.9);
        applyShadows(gateLintel);
        southGateGroup.add(gateLintel);

        // 朱红大门双扉（微启迎宾之态）
        const doorLeafGeo = new THREE.BoxGeometry(1.5, 3.2, 0.12);
        const doorL = new THREE.Mesh(doorLeafGeo, materials.vermilionWall);
        doorL.position.set(-0.95, 2.6, 8.9);
        doorL.rotation.y = 0.35; // 开启夹角
        applyShadows(doorL);
        southGateGroup.add(doorL);

        const doorR = new THREE.Mesh(doorLeafGeo, materials.vermilionWall);
        doorR.position.set(0.95, 2.6, 8.9);
        doorR.rotation.y = -0.35;
        applyShadows(doorR);
        southGateGroup.add(doorR);

        // 门楼出挑四阿大草顶
        const gateRoofGeo = createHippedRoofGeometry(5.6, 3.8, 1.6, 0.45);
        const gateRoof = new THREE.Mesh(gateRoofGeo, materials.thatch);
        gateRoof.position.set(0, 5.2, 8.9);
        applyShadows(gateRoof);
        southGateGroup.add(gateRoof);

        // 门楼正脊圆木草卷
        const gateRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.6, 12), materials.thatch);
        gateRidge.rotation.z = Math.PI / 2;
        gateRidge.position.set(0, 6.85, 8.9);
        southGateGroup.add(gateRidge);

        // 门楼南面与北面 3D 垂檐草披
        const gFringeS = new THREE.Mesh(createThatchFringeGeometry(5.6, 0.45, 24), materials.thatch);
        gFringeS.position.set(0, 5.15, 10.8);
        gFringeS.rotation.x = 0.35;
        southGateGroup.add(gFringeS);

        const gFringeN = new THREE.Mesh(createThatchFringeGeometry(5.6, 0.45, 24), materials.thatch);
        gFringeN.position.set(0, 5.15, 7.0);
        gFringeN.rotation.x = -0.35;
        gFringeN.rotation.y = Math.PI;
        southGateGroup.add(gFringeN);

        southGateGroup.userData = { id: 'part_elt_2_k' };
        scene.add(southGateGroup);
        registerPhysicsMesh(southGateGroup, 'part_elt_2_k', 2, 0, true);
    }

    // =========================================================================
    // 【第三阶段：巍巍中堂】(Stage >= 3)
    // 1. 正殿八架大通梁金柱 (part_elt_3_k) [关键件]
    // 2. 八间坐北大殿木骨泥墙 (part_elt_3_r1)
    // 3. 前后出抱厦檐柱排架 (part_elt_3_r2)
    // 4. 殿堂白灰烧土平整地坪 (part_elt_3_r3)
    // 5. 四阿重挑飞檐厚草顶 (part_elt_3_r4)
    // =========================================================================
    if (stage >= 3) {
        // 3.1 殿堂白灰烧土平整地坪 (part_elt_3_r3)
        // 殿堂内以木屑草木灰与烧红土反复抹平光亮的地平与中央王座台
        const floorGroup = new THREE.Group();
        const floorGeo = new THREE.BoxGeometry(17.8, 0.12, 7.6);
        const floorMesh = new THREE.Mesh(floorGeo, materials.whitePlaster);
        floorMesh.position.set(0, 1.34, -6.5);
        applyShadows(floorMesh);
        floorGroup.add(floorMesh);

        // 正殿中央君王宝席朱红基台
        const throneBaseGeo = new THREE.BoxGeometry(3.2, 0.35, 2.2);
        const throneBase = new THREE.Mesh(throneBaseGeo, materials.vermilionWall);
        throneBase.position.set(0, 1.55, -7.2);
        applyShadows(throneBase);
        floorGroup.add(throneBase);

        floorGroup.userData = { id: 'part_elt_3_r3' };
        scene.add(floorGroup);
        registerPhysicsMesh(floorGroup, 'part_elt_3_r3', 3, 3, false);

        // 3.2 八间坐北大殿木骨泥墙 (part_elt_3_r1)
        // 面阔 8 间、进深 3 间的大殿主殿壁，厚重夯抹草拌泥与红烧土外饰
        const wallsGroup = new THREE.Group();
        const backWallGeo = new THREE.BoxGeometry(17.6, 3.6, 0.45);
        const backWall = new THREE.Mesh(backWallGeo, materials.vermilionWall);
        backWall.position.set(0, 3.1, -9.8);
        applyShadows(backWall);
        wallsGroup.add(backWall);

        // 左右山墙
        const gableWallGeo = new THREE.BoxGeometry(0.45, 3.6, 6.8);
        const gableEast = new THREE.Mesh(gableWallGeo, materials.vermilionWall);
        gableEast.position.set(-8.6, 3.1, -6.5);
        applyShadows(gableEast);
        wallsGroup.add(gableEast);

        const gableWest = new THREE.Mesh(gableWallGeo, materials.vermilionWall);
        gableWest.position.set(8.6, 3.1, -6.5);
        applyShadows(gableWest);
        wallsGroup.add(gableWest);

        // 前壁隔断门墙（八开间，带三处出入明门）
        const frontWallSectionGeo = new THREE.BoxGeometry(2.4, 3.6, 0.35);
        [-6.8, -2.6, 2.6, 6.8].forEach((wx) => {
            const wallSec = new THREE.Mesh(frontWallSectionGeo, materials.vermilionWall);
            wallSec.position.set(wx, 3.1, -3.2);
            applyShadows(wallSec);
            wallsGroup.add(wallSec);
        });

        wallsGroup.userData = { id: 'part_elt_3_r1' };
        scene.add(wallsGroup);
        registerPhysicsMesh(wallsGroup, 'part_elt_3_r1', 3, 1, false);

        // 3.3 前后出抱厦檐柱排架 (part_elt_3_r2)
        // 正殿外围一整圈副阶回廊与檐柱（外檐柱环绕，深出檐支撑）
        const arcadeGroup = new THREE.Group();
        const arcadeColGeo = new THREE.CylinderGeometry(0.2, 0.22, 3.8, 16);
        const stoneBaseGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.2, 16);

        // 前抱厦 8 根排柱
        for (let x = -8.2; x <= 8.2; x += 2.34) {
            const col = new THREE.Mesh(arcadeColGeo, materials.oakWood);
            col.position.set(x, 3.0, -2.2);
            applyShadows(col);
            arcadeGroup.add(col);

            const base = new THREE.Mesh(stoneBaseGeo, materials.stonePaver);
            base.position.set(x, 1.18, -2.2);
            arcadeGroup.add(base);
        }

        // 后抱厦与侧面排柱
        [-9.4, 9.4].forEach((sx) => {
            for (let z = -8.5; z <= -3.5; z += 2.5) {
                const colSide = new THREE.Mesh(arcadeColGeo, materials.oakWood);
                colSide.position.set(sx, 3.0, z);
                applyShadows(colSide);
                arcadeGroup.add(colSide);

                const baseSide = new THREE.Mesh(stoneBaseGeo, materials.stonePaver);
                baseSide.position.set(sx, 1.18, z);
                arcadeGroup.add(baseSide);
            }
        });

        arcadeGroup.userData = { id: 'part_elt_3_r2' };
        scene.add(arcadeGroup);
        registerPhysicsMesh(arcadeGroup, 'part_elt_3_r2', 3, 2, false);

        // 3.4 【关键件】正殿八架大通梁金柱 (part_elt_3_k)
        // 支撑大殿中央屋脊的巨型大通梁排架与通天金柱
        const masterFrameGroup = new THREE.Group();
        const kingPostGeo = new THREE.CylinderGeometry(0.32, 0.35, 6.2, 16);

        // 殿内两列核心承重大金柱
        for (let x = -6.5; x <= 6.5; x += 4.33) {
            [-8.0, -5.0].forEach((z) => {
                const kp = new THREE.Mesh(kingPostGeo, materials.nanmuWood);
                kp.position.set(x, 4.4, z);
                applyShadows(kp);
                masterFrameGroup.add(kp);
            });
        }

        // 贯通大殿东西向的主脊通梁（八架大梁，全长 19.5 米）
        const masterRidgeBeamGeo = new THREE.BoxGeometry(19.6, 0.55, 0.55);
        const masterRidgeBeam = new THREE.Mesh(masterRidgeBeamGeo, materials.nanmuWood);
        masterRidgeBeam.position.set(0, 7.3, -6.5);
        applyShadows(masterRidgeBeam);
        masterFrameGroup.add(masterRidgeBeam);

        // 顺水枋与下层通大梁
        const lowerBeamGeo = new THREE.BoxGeometry(18.8, 0.45, 0.45);
        const lowerBeamFront = new THREE.Mesh(lowerBeamGeo, materials.oakWood);
        lowerBeamFront.position.set(0, 4.9, -3.2);
        masterFrameGroup.add(lowerBeamFront);

        const lowerBeamBack = new THREE.Mesh(lowerBeamGeo, materials.oakWood);
        lowerBeamBack.position.set(0, 4.9, -9.8);
        masterFrameGroup.add(lowerBeamBack);

        masterFrameGroup.userData = { id: 'part_elt_3_k' };
        scene.add(masterFrameGroup);
        registerPhysicsMesh(masterFrameGroup, 'part_elt_3_k', 3, 0, true);

        // 3.5 四阿重挑飞檐厚草顶 (part_elt_3_r4)
        // 华夏宫室至高规格：四面斜坡大庑殿草顶（四阿重檐），展翅飞挑的大出檐
        const grandRoofGroup = new THREE.Group();

        // 1. 真实四阿庑殿主草顶 (Top Hipped Roof Core)
        // 面阔 21.4 米，进深 10.6 米，脊长 11.5 米，高 3.6 米
        const roofUpperGeo = createHippedRoofGeometry(21.4, 10.6, 3.6, 0.52);
        const roofUpper = new THREE.Mesh(roofUpperGeo, materials.thatch);
        roofUpper.position.set(0, 7.1, -6.5);
        applyShadows(roofUpper);
        grandRoofGroup.add(roofUpper);

        // 2. 主殿四周 3D 参差毛茸草丝垂须 (3D Thatch Fringes for Main Palace)
        const mainFringeS = new THREE.Mesh(createThatchFringeGeometry(21.6, 0.65, 56), materials.thatch);
        mainFringeS.position.set(0, 7.0, -1.1);
        mainFringeS.rotation.x = 0.36;
        mainFringeS.castShadow = true;
        grandRoofGroup.add(mainFringeS);

        const mainFringeN = new THREE.Mesh(createThatchFringeGeometry(21.6, 0.65, 56), materials.thatch);
        mainFringeN.position.set(0, 7.0, -11.9);
        mainFringeN.rotation.x = -0.36;
        mainFringeN.rotation.y = Math.PI;
        mainFringeN.castShadow = true;
        grandRoofGroup.add(mainFringeN);

        const mainFringeW = new THREE.Mesh(createThatchFringeGeometry(10.8, 0.62, 36), materials.thatch);
        mainFringeW.position.set(-10.8, 7.0, -6.5);
        mainFringeW.rotation.y = Math.PI / 2;
        mainFringeW.rotation.x = 0.36;
        mainFringeW.castShadow = true;
        grandRoofGroup.add(mainFringeW);

        const mainFringeE = new THREE.Mesh(createThatchFringeGeometry(10.8, 0.62, 36), materials.thatch);
        mainFringeE.position.set(10.8, 7.0, -6.5);
        mainFringeE.rotation.y = -Math.PI / 2;
        mainFringeE.rotation.x = 0.36;
        mainFringeE.castShadow = true;
        grandRoofGroup.add(mainFringeE);

        // 3. 正脊粗大覆草卷 (Thick Thatch Ridge Roll, 长12.0米)
        const ridgePoleGeo = new THREE.CylinderGeometry(0.36, 0.36, 12.0, 16);
        ridgePoleGeo.rotateZ(Math.PI / 2);
        const ridgePole = new THREE.Mesh(ridgePoleGeo, materials.thatch);
        ridgePole.position.set(0, 10.75, -6.5);
        applyShadows(ridgePole);
        grandRoofGroup.add(ridgePole);

        // 4. 四条垂脊覆草加固卷 (Four Hip Ridge Rolls)
        const hipRollLength = 7.4;
        [
            [-5.5, 8.95, -9.2, Math.PI / 6, -Math.PI / 4],
            [5.5, 8.95, -9.2, Math.PI / 6, Math.PI / 4],
            [-5.5, 8.95, -3.8, -Math.PI / 6, -Math.PI / 4],
            [5.5, 8.95, -3.8, -Math.PI / 6, Math.PI / 4]
        ].forEach(([hx, hy, hz, rx, ry]) => {
            const hipRoll = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.26, hipRollLength, 8),
                materials.thatch
            );
            hipRoll.position.set(hx, hy, hz);
            hipRoll.rotation.x = rx;
            hipRoll.rotation.y = ry;
            hipRoll.rotation.z = Math.PI / 4;
            grandRoofGroup.add(hipRoll);
        });

        // 5. 下层重檐飞挑抱厦四面斜坡腰檐 (Lower Eaves Sloping Apron)
        const lowerApronGroup = new THREE.Group();
        lowerApronGroup.position.set(0, 5.2, -6.5);

        // 南坡抱厦檐
        const apronS = new THREE.Mesh(new THREE.BoxGeometry(22.6, 0.22, 2.4), materials.thatch);
        apronS.position.set(0, 0, 5.0);
        apronS.rotation.x = 0.28;
        applyShadows(apronS);
        lowerApronGroup.add(apronS);

        const lowerFringeS = new THREE.Mesh(createThatchFringeGeometry(22.8, 0.5, 56), materials.thatch);
        lowerFringeS.position.set(0, -0.25, 6.1);
        lowerFringeS.rotation.x = 0.28;
        lowerApronGroup.add(lowerFringeS);

        // 北坡抱厦檐
        const apronN = new THREE.Mesh(new THREE.BoxGeometry(22.6, 0.22, 2.4), materials.thatch);
        apronN.position.set(0, 0, -5.0);
        apronN.rotation.x = -0.28;
        applyShadows(apronN);
        lowerApronGroup.add(apronN);

        const lowerFringeN = new THREE.Mesh(createThatchFringeGeometry(22.8, 0.5, 56), materials.thatch);
        lowerFringeN.position.set(0, -0.25, -6.1);
        lowerFringeN.rotation.x = -0.28;
        lowerFringeN.rotation.y = Math.PI;
        lowerApronGroup.add(lowerFringeN);

        // 西侧抱厦檐
        const apronW = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 11.6), materials.thatch);
        apronW.position.set(-11.2, 0, 0);
        apronW.rotation.z = -0.28;
        applyShadows(apronW);
        lowerApronGroup.add(apronW);

        const lowerFringeW = new THREE.Mesh(createThatchFringeGeometry(11.8, 0.5, 36), materials.thatch);
        lowerFringeW.position.set(-12.3, -0.25, 0);
        lowerFringeW.rotation.y = Math.PI / 2;
        lowerFringeW.rotation.x = 0.28;
        lowerApronGroup.add(lowerFringeW);

        // 东侧抱厦檐
        const apronE = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 11.6), materials.thatch);
        apronE.position.set(11.2, 0, 0);
        apronE.rotation.z = 0.28;
        applyShadows(apronE);
        lowerApronGroup.add(apronE);

        const lowerFringeE = new THREE.Mesh(createThatchFringeGeometry(11.8, 0.5, 36), materials.thatch);
        lowerFringeE.position.set(12.3, -0.25, 0);
        lowerFringeE.rotation.y = -Math.PI / 2;
        lowerFringeE.rotation.x = 0.28;
        lowerApronGroup.add(lowerFringeE);

        grandRoofGroup.add(lowerApronGroup);

        // 6. 白桦压顶防风条 (Weather battens across south and north slopes)
        for (let b = -8.8; b <= 8.8; b += 2.2) {
            const battenS = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.2, 6), materials.oakWood);
            battenS.position.set(b, 8.8, -4.2);
            battenS.rotation.x = 0.65;
            grandRoofGroup.add(battenS);

            const battenN = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.2, 6), materials.oakWood);
            battenN.position.set(b, 8.8, -8.8);
            battenN.rotation.x = -0.65;
            grandRoofGroup.add(battenN);
        }

        grandRoofGroup.userData = { id: 'part_elt_3_r4' };
        scene.add(grandRoofGroup);
        registerPhysicsMesh(grandRoofGroup, 'part_elt_3_r4', 3, 4, false);
    }

    // =========================================================================
    // 【第四阶段：龙耀夏都】(Stage >= 4)
    // 1. 绿松石镶嵌龙形器 · 华夏第一龙 (part_elt_4_k1) [关键件 1]
    // 2. 华夏第一爵 · 夏代乳钉纹青铜爵 (part_elt_4_k2) [关键件 2]
    // 3. 嵌绿松石兽面纹铜牌饰 (part_elt_4_r1)
    // 4. 官造冶铜坩埚高炉与熔流 (part_elt_4_r2)
    // 5. 庭前仪仗双轮木战车 (part_elt_4_r3)
    // =========================================================================
    if (stage >= 4) {
        // 4.1 官造冶铜坩埚高炉与熔流 (part_elt_4_r2)
        // 设立在庭院东侧角落的夏代官营铸铜工坊：圆筒形红黏土炼铜炉、坩埚残渣、通红铜水与烟道
        const foundryGroup = new THREE.Group();
        foundryGroup.position.set(-6.5, 0.9, 3.2);

        // 圆筒形黏土炼铜炉台
        const furnaceBodyGeo = new THREE.CylinderGeometry(0.85, 1.25, 2.2, 16);
        const furnaceBody = new THREE.Mesh(furnaceBodyGeo, materials.pottery);
        furnaceBody.position.y = 1.1;
        applyShadows(furnaceBody);
        foundryGroup.add(furnaceBody);

        // 烟囱排烟筒
        const chimneyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.6, 12);
        const chimney = new THREE.Mesh(chimneyGeo, materials.pottery);
        chimney.position.set(0, 2.8, 0);
        applyShadows(chimney);
        foundryGroup.add(chimney);

        // 炉门与通红碳火内腔
        const hearthHoleGeo = new THREE.BoxGeometry(0.65, 0.75, 0.85);
        const hearthHole = new THREE.Mesh(hearthHoleGeo, materials.moltenCopper);
        hearthHole.position.set(0, 0.5, 0.85);
        foundryGroup.add(hearthHole);

        // 倒铜陶质大坩埚 (Crucible)
        const crucibleGeo = new THREE.CylinderGeometry(0.42, 0.32, 0.65, 16);
        const crucible = new THREE.Mesh(crucibleGeo, materials.pottery);
        crucible.position.set(1.4, 0.45, 0.9);
        crucible.rotation.z = -0.35; // 倾倒出铜液
        applyShadows(crucible);
        foundryGroup.add(crucible);

        // 流淌向石范的赤红熔融铜液 (Molten Copper Stream)
        const copperStreamGeo = new THREE.BoxGeometry(0.18, 0.08, 1.6);
        const copperStream = new THREE.Mesh(copperStreamGeo, materials.moltenCopper);
        copperStream.position.set(1.8, 0.15, 1.5);
        foundryGroup.add(copperStream);

        // 青铜锭合范模具 (Stone ingot molds)
        const moldGeo = new THREE.BoxGeometry(0.8, 0.22, 1.4);
        const moldMesh = new THREE.Mesh(moldGeo, materials.stonePaver);
        moldMesh.position.set(2.0, 0.12, 1.6);
        applyShadows(moldMesh);
        foundryGroup.add(moldMesh);

        // 堆叠的冷却青铜锭块 (Bronze Ingots)
        const ingotGeo = new THREE.BoxGeometry(0.24, 0.12, 0.55);
        for (let b = 0; b < 5; b++) {
            const ingot = new THREE.Mesh(ingotGeo, materials.bronze);
            ingot.position.set(1.0 + (b % 2) * 0.3, 0.1 + Math.floor(b / 2) * 0.12, -0.6 + (b % 3) * 0.25);
            applyShadows(ingot);
            foundryGroup.add(ingot);
        }

        // 炉顶升腾的火星与烟气粒子生成器 (5 个粒子用于循环动画)
        const sparkGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const sparkMat = new THREE.MeshBasicMaterial({
            color: 0xff7700,
            transparent: true,
            opacity: 0.85
        });
        for (let sp = 0; sp < 6; sp++) {
            const spark = new THREE.Mesh(sparkGeo, sparkMat.clone());
            spark.position.set(0, 3.6 + sp * 0.4, 0);
            spark.userData = {
                baseY: 3.5,
                birthTime: sp * 0.5,
                driftX: (Math.random() - 0.5) * 0.6,
                driftZ: (Math.random() - 0.5) * 0.6
            };
            foundryGroup.add(spark);
            animatedElements.furnaceSparks.push(spark);
        }

        foundryGroup.userData = { id: 'part_elt_4_r2' };
        scene.add(foundryGroup);
        registerPhysicsMesh(foundryGroup, 'part_elt_4_r2', 4, 3, false);

        // 4.2 庭前仪仗双轮木战车 (part_elt_4_r3)
        // 二里头早期王侯双轮车：左右大辐条木轮、横轴、弧形车舆、单辕、青铜銮铃与仪仗朱幡
        const chariotGroup = new THREE.Group();
        chariotGroup.position.set(4.5, 0.9, 5.0);
        chariotGroup.rotation.y = -0.4;

        // 车舆车厢
        const carriageGeo = new THREE.BoxGeometry(1.6, 0.75, 1.2);
        const carriage = new THREE.Mesh(carriageGeo, materials.nanmuWood);
        carriage.position.y = 0.85;
        applyShadows(carriage);
        chariotGroup.add(carriage);

        // 车轴
        const axleGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.4, 12);
        axleGeo.rotateZ(Math.PI / 2);
        const axle = new THREE.Mesh(axleGeo, materials.oakWood);
        axle.position.y = 0.65;
        chariotGroup.add(axle);

        // 左右双大辐条车轮 (Spoke Wheels)
        const wheelRimGeo = new THREE.TorusGeometry(0.65, 0.08, 12, 24);
        const wheelHubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.22, 12);
        wheelHubGeo.rotateZ(Math.PI / 2);

        [-1.15, 1.15].forEach((wx) => {
            const wheelSubGroup = new THREE.Group();
            wheelSubGroup.position.set(wx, 0.65, 0);

            const rim = new THREE.Mesh(wheelRimGeo, materials.oakWood);
            rim.rotation.y = Math.PI / 2;
            applyShadows(rim);
            wheelSubGroup.add(rim);

            const hub = new THREE.Mesh(wheelHubGeo, materials.brightBronze);
            applyShadows(hub);
            wheelSubGroup.add(hub);

            // 12 根木辐条
            const spokeGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.25, 8);
            for (let sp = 0; sp < 6; sp++) {
                const spoke = new THREE.Mesh(spokeGeo, materials.oakWood);
                spoke.rotation.x = (sp * Math.PI) / 6;
                wheelSubGroup.add(spoke);
            }

            chariotGroup.add(wheelSubGroup);
            animatedElements.chariotWheels.push(wheelSubGroup);
        });

        // 前伸辕木 (Draft Pole)
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.2, 12);
        poleGeo.rotateX(Math.PI / 2);
        const pole = new THREE.Mesh(poleGeo, materials.oakWood);
        pole.position.set(0, 0.55, 1.6);
        chariotGroup.add(pole);

        // 仪仗青铜銮铃与朱羽神幡
        const bannerPoleGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 12);
        const bannerPole = new THREE.Mesh(bannerPoleGeo, materials.oakWood);
        bannerPole.position.set(0.7, 1.8, -0.5);
        chariotGroup.add(bannerPole);

        const bannerFabricGeo = new THREE.PlaneGeometry(0.65, 1.8);
        const bannerFabric = new THREE.Mesh(bannerFabricGeo, materials.bannerSilk);
        bannerFabric.position.set(1.05, 2.2, -0.5);
        bannerFabric.rotation.y = Math.PI / 2;
        chariotGroup.add(bannerFabric);
        animatedElements.windBanners.push(bannerFabric);

        chariotGroup.userData = { id: 'part_elt_4_r3' };
        scene.add(chariotGroup);
        registerPhysicsMesh(chariotGroup, 'part_elt_4_r3', 4, 4, false);

        // 4.3 嵌绿松石兽面纹铜牌饰 (part_elt_4_r1)
        // 镶嵌在殿堂大门上方或王座仪仗前方的兽面纹青铜牌饰，凹弧牌面嵌微型绿松石
        const plaqueGroup = buildSculptedBronzePlaque();
        plaqueGroup.position.set(0, 4.3, -3.15);
        plaqueGroup.userData = { id: 'part_elt_4_r1' };
        scene.add(plaqueGroup);
        registerPhysicsMesh(plaqueGroup, 'part_elt_4_r1', 4, 2, false);

        // 4.4 【关键件 2】华夏第一爵 · 夏代乳钉纹青铜爵 (part_elt_4_k2)
        // 案几上供奉的华夏第一青铜爵：修长流槽、尖长后尾、束腰平底、三棱修长尖足、镂空鋬手、单排乳钉
        const bronzeJueGroup = buildSculptedBronzeJue();
        bronzeJueGroup.position.set(0, 2.05, -1.8);
        bronzeJueGroup.userData = { id: 'part_elt_4_k2' };
        scene.add(bronzeJueGroup);
        registerPhysicsMesh(bronzeJueGroup, 'part_elt_4_k2', 4, 1, true);

        // 4.5 【关键件 1】绿松石镶嵌龙形器 · 华夏第一龙 (part_elt_4_k1)
        // 二里头至高国宝：65cm长巨型绿松石巨龙，2000余片绿松石鳞甲、蒜头鼻、碧玉圆眼、蜿蜒起伏、尾系带翼铜铃
        const dragonGroup = buildSculptedTurquoiseDragon();
        dragonGroup.position.set(0, 4.2, 1.2);
        dragonGroup.userData = { id: 'part_elt_4_k1' };
        scene.add(dragonGroup);
        animatedElements.turquoiseDragon = dragonGroup;
        registerPhysicsMesh(dragonGroup, 'part_elt_4_k1', 4, 0, true);
    }

    // =========================================================================
    // 关键帧/循环动力学更新函数 (由主渲染循环驱动，对标 Littlest Tokyo)
    // =========================================================================
    return {
        updateAnimations: (delta, elapsedTime) => {
            // 1. 绿松石龙形器 · 华夏第一龙 灵动浮沉自转与神圣碧翠呼吸辉光
            if (animatedElements.turquoiseDragon) {
                const dragon = animatedElements.turquoiseDragon;
                // 缓和浮沉与轻微头部摆动 (Harmonic levitation)
                dragon.position.y = 4.2 + Math.sin(elapsedTime * 1.5) * 0.16;
                dragon.position.z = 1.2;
                dragon.rotation.y = Math.sin(elapsedTime * 0.7) * 0.15;
                dragon.rotation.z = Math.cos(elapsedTime * 1.1) * 0.04;

                // 材质微晶荧光律动
                if (materials.turquoise) {
                    materials.turquoise.emissiveIntensity = 0.75 + Math.sin(elapsedTime * 3.2) * 0.35;
                }

                // 神圣碧玉点光源追随与律动
                if (animatedElements.dragonLight) {
                    animatedElements.dragonLight.position.set(
                        dragon.position.x,
                        dragon.position.y + 0.5,
                        dragon.position.z
                    );
                    animatedElements.dragonLight.color.setHex(0x14b8a6);
                    animatedElements.dragonLight.intensity = 2.2 + Math.sin(elapsedTime * 3.2) * 0.6;
                }
            }

            // 2. 冶铜工坊炼炉火光与飞溅火星循环动画
            if (animatedElements.furnaceSparks.length > 0) {
                const sparks = animatedElements.furnaceSparks;
                const cycle = 2.4;
                for (let i = 0; i < sparks.length; i++) {
                    const sp = sparks[i];
                    const age = (elapsedTime + sp.userData.birthTime) % cycle;
                    const progress = age / cycle; // 0.0 ~ 1.0

                    // 向上升腾并在微风中轻微扩散
                    sp.position.y = sp.userData.baseY + progress * 2.8;
                    sp.position.x = sp.userData.driftX * progress * 1.8;
                    sp.position.z = sp.userData.driftZ * progress * 1.8;

                    // 透明度逐渐渐隐
                    sp.material.opacity = Math.max(0, (1.0 - progress) * 0.9);
                    const s = 0.12 * (1.0 - progress * 0.6);
                    sp.scale.set(s, s, s);
                }

                // 炉火跳跃光影
                if (animatedElements.furnaceLight) {
                    animatedElements.furnaceLight.position.set(-6.5, 2.2, 4.0);
                    animatedElements.furnaceLight.color.setHex(0xff4500);
                    animatedElements.furnaceLight.intensity = 2.4 + Math.sin(elapsedTime * 14) * 0.6 + Math.cos(elapsedTime * 28) * 0.3;
                }
            }

            // 3. 庭前仪仗朱红神幡风动摇曳 (Harmonic Banner Sway)
            const wind = Math.sin(elapsedTime * 3.0) * 0.22 + Math.cos(elapsedTime * 5.6) * 0.08;
            animatedElements.windBanners.forEach((b) => {
                b.rotation.z = wind;
            });
        }
    };
}
