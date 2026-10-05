import * as THREE from 'three';

/**
 * 👑 良渚神国 · 莫角山大祭台与水坝 微缩立体建筑箱庭 (Architectural Diorama)
 * 对标 Littlest Tokyo 风格：水乡立体防洪沙盘 + 环渠巡航独木舟 + 木构溢流坝瀑布 + 四阿重檐神殿 + 汉白玉神坛玉琮王辉光
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

export function buildLiangzhuDiorama({
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
        canoeGroup: null,
        oarMesh: null,
        waterMesh: null,
        waterfallMesh: null,
        waterfallFoam: [],
        jadeCong: null,
        jadeMotes: [],
        holySmokePuffs: [],
        banners: [],
        hearthLight: fireLight,
        jadeLight: jadeLight
    };

    // 基础 PBR 材质
    const materials = {
        earth: new THREE.MeshStandardMaterial({
            map: textures.rammedEarth.map,
            bumpMap: textures.rammedEarth.bumpMap,
            bumpScale: 0.14,
            roughness: 0.88,
            metalness: 0.04
        }),
        stonePaver: new THREE.MeshStandardMaterial({
            map: textures.stonePaver.map,
            bumpMap: textures.stonePaver.bumpMap,
            bumpScale: 0.08,
            roughness: 0.65,
            metalness: 0.1
        }),
        whiteJadeStone: new THREE.MeshStandardMaterial({
            color: 0xa8a29e,
            roughness: 0.65,
            metalness: 0.05
        }),
        nanmuVermilion: new THREE.MeshStandardMaterial({
            map: textures.nanmuWood.map,
            roughness: 0.45,
            metalness: 0.12
        }),
        thatch: new THREE.MeshStandardMaterial({
            map: textures.thatch.map,
            bumpMap: textures.thatch.bumpMap,
            bumpScale: 0.24,
            roughness: 0.82,
            metalness: 0.02,
            side: THREE.DoubleSide
        }),
        jadeCongMat: new THREE.MeshStandardMaterial({
            map: textures.jadeCong.map,
            roughness: 0.22,
            metalness: 0.15,
            emissive: 0x059669,
            emissiveIntensity: 0.6
        }),
        pureJadeWhite: new THREE.MeshStandardMaterial({
            color: 0x5eead4,
            roughness: 0.42,
            metalness: 0.05
        }),
        goldMetal: new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            roughness: 0.25,
            metalness: 0.85
        }),
        water: new THREE.MeshStandardMaterial({
            map: textures.water,
            color: 0x0d9488,
            roughness: 0.08,
            metalness: 0.3,
            transparent: true,
            opacity: 0.92
        }),
        bambooReed: new THREE.MeshStandardMaterial({
            color: 0x84cc16,
            roughness: 0.75,
            metalness: 0.05
        }),
        charcoalBasalt: new THREE.MeshStandardMaterial({
            color: 0x18181b,
            roughness: 0.85,
            metalness: 0.1
        }),
        bannerSilk: new THREE.MeshStandardMaterial({
            color: 0x991b1b,
            roughness: 0.65,
            metalness: 0.1,
            side: THREE.DoubleSide
        }),
        darkEarthBase: new THREE.MeshStandardMaterial({
            color: 0x271e17,
            roughness: 0.95,
            metalness: 0.02
        })
    };

    // =========================================================================
    // 0. DIORAMA BOX BASE: 太湖水网立体复合台基 (Diorama Water Terrace Base)
    // =========================================================================
    const dioramaBase = new THREE.Group();
    dioramaBase.name = 'diorama_liangzhu_base';

    // (1) 底部切角厚质石台座
    const baseBlock = new THREE.Mesh(
        new THREE.CylinderGeometry(14.0, 14.8, 2.4, 32),
        materials.darkEarthBase
    );
    baseBlock.position.y = -1.2;
    baseBlock.receiveShadow = true;
    dioramaBase.add(baseBlock);

    // (2) 环绕大运河与太湖水网 (环形水槽)
    const moatShape = new THREE.Shape();
    moatShape.absarc(0, 0, 13.8, 0, Math.PI * 2, false);
    const moatHole = new THREE.Path();
    moatHole.absarc(0, 0, 9.8, 0, Math.PI * 2, true);
    moatShape.holes.push(moatHole);
    const moatGeo = new THREE.ExtrudeGeometry(moatShape, { depth: 0.3, bevelEnabled: false });
    const moatMesh = new THREE.Mesh(moatGeo, materials.water);
    moatMesh.rotation.x = Math.PI / 2;
    moatMesh.position.y = 0.08;
    moatMesh.receiveShadow = true;
    dioramaBase.add(moatMesh);
    animatedElements.waterMesh = moatMesh;

    // (3) 中央莫角山主台地核心黄土岛
    const centralIsland = new THREE.Mesh(
        new THREE.CylinderGeometry(9.6, 10.2, 1.2, 32),
        materials.earth
    );
    centralIsland.position.y = 0.6;
    centralIsland.receiveShadow = true;
    dioramaBase.add(centralIsland);

    scene.add(dioramaBase);

    const applyShadows = (mesh) => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    };

    // =========================================================================
    // 🏛️ 考古级高精度良渚核心文物雕塑发生器 (Museum-Grade Liangzhu Artifact Sculptors)
    // =========================================================================

    // 1. 反山 M12:98 神人兽面纹大玉琮之王 (Sculpted King of Jade Cong)
    const buildSculptedJadeCongKing = () => {
        const root = new THREE.Group();

        // 1. 上下圆射口 (Top and bottom cylindrical collars)
        const topCollar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.72, 0.72, 0.22, 32, 1, false),
            materials.jadeCongMat
        );
        topCollar.position.y = 0.85;
        applyShadows(topCollar);
        root.add(topCollar);

        const bottomCollar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.72, 0.72, 0.22, 32, 1, false),
            materials.jadeCongMat
        );
        bottomCollar.position.y = -0.85;
        applyShadows(bottomCollar);
        root.add(bottomCollar);

        // 2. 中央通天内圆穿孔 (Central vertical cylindrical bore)
        const innerVoid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.38, 1.95, 24),
            new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.15 })
        );
        root.add(innerVoid);

        // 3. 外方柱体主体与四角直槽 (Outer square body with 4 corner blocks)
        const mainBox = new THREE.Mesh(
            new THREE.BoxGeometry(1.48, 1.48, 1.48),
            materials.jadeCongMat
        );
        applyShadows(mainBox);
        root.add(mainBox);

        // 四面中央内凹直槽 (Cross-shaped Troughs on 4 faces)
        const troughMat = new THREE.MeshStandardMaterial({
            color: 0x065f46,
            roughness: 0.35,
            metalness: 0.1
        });
        [-1, 1].forEach((dir) => {
            const tZ = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.5, 0.05), troughMat);
            tZ.position.set(0, 0, dir * 0.75);
            root.add(tZ);
            const tX = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 0.32), troughMat);
            tX.position.set(dir * 0.75, 0, 0);
            root.add(tX);
        });

        // 4. 四角两层八组神人兽面微雕刻饰 (8 sets of God-Man & Beast Mask micro-reliefs across 4 corners)
        const cornerOffsets = [
            [-0.74, -0.74], [0.74, -0.74],
            [-0.74, 0.74],  [0.74, 0.74]
        ];
        cornerOffsets.forEach(([cx, cz]) => {
            const ang = Math.atan2(cz, cx);

            // 上层：神人倒梯形羽冠与重圈眼 (God-man upper tier, y = 0.38)
            const godGroup = new THREE.Group();
            godGroup.position.set(cx, 0.38, cz);
            godGroup.rotation.y = -ang + Math.PI / 4;

            const crown = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.06), materials.pureJadeWhite);
            crown.position.set(0, 0.18, 0);
            godGroup.add(crown);
            for (let l = -0.14; l <= 0.14; l += 0.07) {
                const line = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.07), troughMat);
                line.position.set(l, 0.18, 0);
                godGroup.add(line);
            }
            [-0.09, 0.09].forEach((ex) => {
                const eyeOuter = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.012, 6, 16), materials.pureJadeWhite);
                eyeOuter.position.set(ex, 0.04, 0.03);
                godGroup.add(eyeOuter);
                const eyeInner = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), materials.goldMetal);
                eyeInner.position.set(ex, 0.04, 0.03);
                godGroup.add(eyeInner);
            });
            const bridgeBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.03), materials.pureJadeWhite);
            bridgeBar.position.set(0, 0.04, 0.03);
            godGroup.add(bridgeBar);
            const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.035), materials.pureJadeWhite);
            nose.position.set(0, -0.04, 0.03);
            godGroup.add(nose);
            root.add(godGroup);

            // 下层：巨眼獠牙兽面 (Beast Mask lower tier, y = -0.38)
            const beastGroup = new THREE.Group();
            beastGroup.position.set(cx, -0.38, cz);
            beastGroup.rotation.y = -ang + Math.PI / 4;

            const beastNose = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.04), materials.pureJadeWhite);
            beastNose.position.set(0, 0.08, 0.03);
            beastGroup.add(beastNose);
            [-0.11, 0.11].forEach((bx) => {
                const eyeR = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 6, 16), materials.pureJadeWhite);
                eyeR.position.set(bx, 0.02, 0.03);
                beastGroup.add(eyeR);
                const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), materials.goldMetal);
                pupil.position.set(bx, 0.02, 0.03);
                beastGroup.add(pupil);
            });
            const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.03), materials.pureJadeWhite);
            mouth.position.set(0, -0.1, 0.03);
            beastGroup.add(mouth);
            [-0.08, 0.08].forEach((fx) => {
                const fang = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 4), materials.pureJadeWhite);
                fang.position.set(fx, -0.13, 0.03);
                beastGroup.add(fang);
            });
            root.add(beastGroup);
        });

        root.scale.set(1.15, 1.15, 1.15);
        return root;
    };

    // 2. 反山 M12:97 神王玉钺王权全组合 (Sculpted Jade Axe Scepter: Jade Mao + Jade Yue Blade + Jade Dun)
    const buildSculptedKingAxeScepter = () => {
        const root = new THREE.Group();

        // 1. 朱红大漆长木柄 (L=1.85m)
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.038, 0.042, 1.85, 16),
            materials.nanmuVermilion
        );
        applyShadows(shaft);
        root.add(shaft);

        // 2. 玉瑁 (White Jade Mao at top of staff)
        const maoShape = new THREE.Shape();
        maoShape.moveTo(-0.16, 0);
        maoShape.quadraticCurveTo(0, 0.15, 0.16, 0);
        maoShape.lineTo(0.13, -0.08);
        maoShape.quadraticCurveTo(0, 0.03, -0.13, -0.08);
        maoShape.closePath();
        const maoGeo = new THREE.ExtrudeGeometry(maoShape, { depth: 0.12, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
        const maoMesh = new THREE.Mesh(maoGeo, materials.pureJadeWhite);
        maoMesh.position.set(0, 0.95, -0.06);
        applyShadows(maoMesh);
        root.add(maoMesh);

        // 3. 玉钺身 (Jade Yue Axe Blade with God Emblem)
        const yueShape = new THREE.Shape();
        yueShape.moveTo(-0.18, 0.42);
        yueShape.lineTo(0.18, 0.42);
        yueShape.lineTo(0.24, -0.32);
        yueShape.quadraticCurveTo(0, -0.42, -0.24, -0.32);
        yueShape.closePath();
        const holePath = new THREE.Path();
        holePath.absarc(0, 0.18, 0.045, 0, Math.PI * 2, true);
        yueShape.holes.push(holePath);

        const yueGeo = new THREE.ExtrudeGeometry(yueShape, {
            depth: 0.032,
            bevelEnabled: true,
            bevelSegments: 3,
            bevelSize: 0.012,
            bevelThickness: 0.01
        });
        const yueMesh = new THREE.Mesh(yueGeo, materials.jadeCongMat);
        yueMesh.position.set(0.28, 0.72, -0.016);
        applyShadows(yueMesh);
        root.add(yueMesh);

        // 钺身微雕神徽金箔纹饰
        const emblemGold = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.16), materials.goldMetal);
        emblemGold.position.set(0.28, 0.72, 0.02);
        root.add(emblemGold);

        // 4. 玉镦 (Jade Dun bottom butt ferrule)
        const dunPts = [
            new THREE.Vector2(0.01, 0.0),
            new THREE.Vector2(0.08, 0.02),
            new THREE.Vector2(0.075, 0.16),
            new THREE.Vector2(0.045, 0.22),
            new THREE.Vector2(0.01, 0.22)
        ];
        const dunGeo = new THREE.LatheGeometry(dunPts, 18);
        const dunMesh = new THREE.Mesh(dunGeo, materials.pureJadeWhite);
        dunMesh.position.set(0, -0.98, 0);
        applyShadows(dunMesh);
        root.add(dunMesh);

        // 5. 木柄金玉箍环
        [-0.45, 0.1, 0.55].forEach(gy => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.01, 6, 16), materials.goldMetal);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(0, gy, 0);
            root.add(ring);
        });

        // 6. 楠木展架
        const standGroup = new THREE.Group();
        const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.16, 0.6), materials.nanmuVermilion);
        standBase.position.set(0, -0.95, 0);
        applyShadows(standBase);
        standGroup.add(standBase);
        [-0.25, 0.25].forEach(sx => {
            const fork = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), materials.nanmuVermilion);
            fork.position.set(sx, -0.65, 0);
            standGroup.add(fork);
        });
        root.add(standGroup);

        root.scale.set(1.2, 1.2, 1.2);
        return root;
    };

    // 3. 反山 M12 三叉形神冠白玉插饰 (Sculpted Trident Jade Ornament)
    const buildSculptedTriProngJade = () => {
        const root = new THREE.Group();

        const prongShape = new THREE.Shape();
        prongShape.moveTo(-0.35, -0.22);
        prongShape.lineTo(-0.35, 0.15);
        prongShape.quadraticCurveTo(-0.25, 0.32, -0.22, 0.28);
        prongShape.lineTo(-0.16, 0.0);
        prongShape.quadraticCurveTo(-0.08, 0.38, 0, 0.42);
        prongShape.quadraticCurveTo(0.08, 0.38, 0.16, 0.0);
        prongShape.lineTo(0.22, 0.28);
        prongShape.quadraticCurveTo(0.25, 0.32, 0.35, 0.15);
        prongShape.lineTo(0.35, -0.22);
        prongShape.closePath();

        const prongGeo = new THREE.ExtrudeGeometry(prongShape, {
            depth: 0.05,
            bevelEnabled: true,
            bevelSegments: 3,
            bevelSize: 0.015,
            bevelThickness: 0.015
        });
        const prongMesh = new THREE.Mesh(prongGeo, materials.pureJadeWhite);
        applyShadows(prongMesh);
        root.add(prongMesh);

        // 正面雕刻神人兽面双圈眼浮雕
        const eyeL = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 12), materials.jadeCongMat);
        eyeL.position.set(-0.09, -0.06, 0.04);
        root.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 12), materials.jadeCongMat);
        eyeR.position.set(0.09, -0.06, 0.04);
        root.add(eyeR);

        // 背后羽冠插管
        const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.28, 12), materials.nanmuVermilion);
        socket.position.set(0, -0.05, -0.05);
        root.add(socket);

        root.scale.set(1.2, 1.2, 1.2);
        return root;
    };

    // 4. 芦苇草裹泥工程土包 (Sculpted Grass-wrapped Mud Bundles with Cross-ties)
    const buildSculptedStrawMudBundles = (count = 5, startX = -4.5, zPos = -8.6) => {
        const group = new THREE.Group();
        for (let i = 0; i < count; i++) {
            const bundle = new THREE.Group();
            const mudCore = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.36, 1.5, 12),
                materials.thatch
            );
            mudCore.rotation.z = Math.PI / 2;
            applyShadows(mudCore);
            bundle.add(mudCore);

            [-0.45, -0.15, 0.15, 0.45].forEach(rx => {
                const ropeRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.024, 6, 16), materials.darkEarthBase);
                ropeRing.position.set(rx, 0, 0);
                ropeRing.rotation.y = Math.PI / 2;
                bundle.add(ropeRing);
            });
            const longRope = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.02, 6, 24), materials.darkEarthBase);
            bundle.add(longRope);

            bundle.position.set(startX + i * 0.95, 0.45 + (i % 2) * 0.22, zPos + (i % 2) * 0.25);
            bundle.rotation.y = (i % 3 - 1) * 0.12;
            group.add(bundle);
        }
        return group;
    };

    // 5. 茅山/卞家山刳木独木舟与划桨人 (Sculpted Hollow Dugout Canoe & Paddler)
    const buildSculptedDugoutCanoe = () => {
        const root = new THREE.Group();

        const canoeShape = new THREE.Shape();
        canoeShape.moveTo(0, -1.85);
        canoeShape.quadraticCurveTo(0.52, -0.3, 0.46, 0.5);
        canoeShape.quadraticCurveTo(0.35, 1.4, 0, 1.85);
        canoeShape.quadraticCurveTo(-0.35, 1.4, -0.46, 0.5);
        canoeShape.quadraticCurveTo(-0.52, -0.3, 0, -1.85);
        canoeShape.closePath();

        const cabinHole = new THREE.Path();
        cabinHole.moveTo(0, -1.5);
        cabinHole.quadraticCurveTo(0.38, -0.2, 0.34, 0.4);
        cabinHole.quadraticCurveTo(0.24, 1.1, 0, 1.5);
        cabinHole.quadraticCurveTo(-0.24, 1.1, -0.34, 0.4);
        cabinHole.quadraticCurveTo(-0.38, -0.2, 0, -1.5);
        cabinHole.closePath();
        canoeShape.holes.push(cabinHole);

        const hullGeo = new THREE.ExtrudeGeometry(canoeShape, {
            depth: 0.42,
            bevelEnabled: true,
            bevelSegments: 2,
            bevelSize: 0.04,
            bevelThickness: 0.04
        });
        const hullMesh = new THREE.Mesh(hullGeo, materials.nanmuVermilion);
        hullMesh.rotation.x = Math.PI / 2;
        hullMesh.rotation.z = Math.PI / 2;
        hullMesh.position.y = 0.28;
        applyShadows(hullMesh);
        root.add(hullMesh);

        const bottomMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 3.2), materials.nanmuVermilion);
        bottomMesh.position.y = 0.04;
        root.add(bottomMesh);

        [-0.5, 0.3].forEach(ty => {
            const thwart = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.05, 0.16), materials.nanmuVermilion);
            thwart.position.set(0, 0.25, ty);
            root.add(thwart);
        });

        // 跪立划桨良渚先民
        const oarsmanGroup = new THREE.Group();
        oarsmanGroup.position.set(0, 0.35, -0.35);

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.85, 8), materials.thatch);
        torso.position.y = 0.45;
        applyShadows(torso);
        oarsmanGroup.add(torso);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), materials.nanmuVermilion);
        head.position.y = 1.0;
        oarsmanGroup.add(head);
        const topknot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), materials.charcoalBasalt);
        topknot.position.set(0, 1.15, -0.05);
        oarsmanGroup.add(topknot);

        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), materials.nanmuVermilion);
        armL.position.set(-0.25, 0.55, 0.15);
        armL.rotation.x = Math.PI / 4;
        oarsmanGroup.add(armL);
        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), materials.nanmuVermilion);
        armR.position.set(0.25, 0.55, 0.15);
        armR.rotation.x = Math.PI / 3;
        oarsmanGroup.add(armR);
        root.add(oarsmanGroup);

        // 柳叶形木桨
        const oarGroup = new THREE.Group();
        const oarShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8), materials.nanmuVermilion);
        oarShaft.position.set(0, 0.6, 0);
        oarGroup.add(oarShaft);

        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0);
        bladeShape.quadraticCurveTo(0.14, 0.35, 0, 0.85);
        bladeShape.quadraticCurveTo(-0.14, 0.35, 0, 0);
        bladeShape.closePath();
        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
        const bladeMesh = new THREE.Mesh(bladeGeo, materials.nanmuVermilion);
        bladeMesh.position.set(0, -0.4, -0.01);
        oarGroup.add(bladeMesh);

        oarGroup.rotation.x = Math.PI / 3;
        oarGroup.rotation.z = Math.PI / 5;
        oarGroup.position.set(0.55, 0.45, -0.1);
        root.add(oarGroup);

        return { root, oarMesh: oarGroup };
    };

    // =========================================================================
    // 阶段 1: 治水筑堤 (8 件构件契约)
    // =========================================================================
    if (stage >= 1) {
        // [Key] part_lz_1_k1: 水利营造竹编龙骨 (坝体竹木筋格骨架)
        const bambooCageGroup = new THREE.Group();
        bambooCageGroup.name = 'part_lz_1_k1';
        for (let i = 0; i < 6; i++) {
            const cage = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 3.2), materials.bambooReed);
            cage.position.set(-6.5 + i * 1.0, 0.5, -9.2);
            cage.rotation.y = 0.15;
            cage.castShadow = true;
            bambooCageGroup.add(cage);
        }
        scene.add(bambooCageGroup);
        registerPhysicsMesh(bambooCageGroup, 'part_lz_1_k1', 1, 0, true);

        // [Key] part_lz_1_k2: 大坝主迎水分流巨岩 (横截水流的千斤分水巨石)
        const dividerRock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.4, 1),
            new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75 })
        );
        dividerRock.name = 'part_lz_1_k2';
        dividerRock.position.set(0, 0.8, -10.8);
        dividerRock.rotation.set(0.3, 0.5, 0.2);
        dividerRock.castShadow = true;
        dividerRock.receiveShadow = true;
        scene.add(dividerRock);
        registerPhysicsMesh(dividerRock, 'part_lz_1_k2', 1, 1, true);

        // part_lz_1_r1: 芦苇草裹泥土包左 (草筋草席包裹泥土的软体防汛工程块)
        const mudBagsLeft = buildSculptedStrawMudBundles(5, -4.5, -8.6);
        mudBagsLeft.name = 'part_lz_1_r1';
        scene.add(mudBagsLeft);
        registerPhysicsMesh(mudBagsLeft, 'part_lz_1_r1', 1, 2);

        // part_lz_1_r2: 芦苇草裹泥土包右
        const mudBagsRight = buildSculptedStrawMudBundles(5, 1.2, -8.6);
        mudBagsRight.name = 'part_lz_1_r2';
        scene.add(mudBagsRight);
        registerPhysicsMesh(mudBagsRight, 'part_lz_1_r2', 1, 3);

        // part_lz_1_r3: 巨木排桩深水护脚 (深扎水底的防冲刷排桩木墙)
        const timberPilings = new THREE.Group();
        timberPilings.name = 'part_lz_1_r3';
        for (let p = 0; p < 12; p++) {
            const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.4, 8), materials.nanmuVermilion);
            pile.position.set(-5.5 + p * 1.0, 0.6, -11.6);
            pile.castShadow = true;
            timberPilings.add(pile);
        }
        scene.add(timberPilings);
        registerPhysicsMesh(timberPilings, 'part_lz_1_r3', 1, 4);

        // part_lz_1_r4: 块石粘土分层碾压 (水坝基体夯实填筑层)
        const damFill = new THREE.Mesh(
            new THREE.BoxGeometry(11.2, 0.9, 2.6),
            materials.earth
        );
        damFill.name = 'part_lz_1_r4';
        damFill.position.set(0, 0.45, -9.8);
        damFill.receiveShadow = true;
        scene.add(damFill);
        registerPhysicsMesh(damFill, 'part_lz_1_r4', 1, 5);

        // part_lz_1_r5: 泄水溢流石砌暗渠 (水坝溢流堰与跌水瀑布)
        const weirGroup = new THREE.Group();
        weirGroup.name = 'part_lz_1_r5';
        const weirFloor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 3.2), materials.stonePaver);
        weirFloor.position.set(0, 0.6, -9.8);
        weirGroup.add(weirFloor);
        // 跌水水幕 (Waterfall Sheet)
        const waterfallGeo = new THREE.PlaneGeometry(2.2, 1.2);
        const waterfallMesh = new THREE.Mesh(waterfallGeo, new THREE.MeshStandardMaterial({
            color: 0x99f6e4,
            roughness: 0.1,
            metalness: 0.2,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        }));
        waterfallMesh.position.set(0, 0.5, -11.5);
        waterfallMesh.rotation.x = 0.25;
        weirGroup.add(waterfallMesh);
        animatedElements.waterfallMesh = waterfallMesh;
        scene.add(weirGroup);
        registerPhysicsMesh(weirGroup, 'part_lz_1_r5', 1, 6);

        // part_lz_1_r6: 外侧斜坡防风草皮 (大坝迎水缓坡草皮护坡)
        const grassSlope = new THREE.Mesh(
            new THREE.BoxGeometry(11.0, 0.3, 1.8),
            new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.85 })
        );
        grassSlope.name = 'part_lz_1_r6';
        grassSlope.position.set(0, 0.4, -8.2);
        grassSlope.rotation.x = -0.15;
        grassSlope.receiveShadow = true;
        scene.add(grassSlope);
        registerPhysicsMesh(grassSlope, 'part_lz_1_r6', 1, 7);
    }

    // =========================================================================
    // 阶段 2: 版筑高台 (8 件构件契约)
    // =========================================================================
    if (stage >= 2) {
        // [Key] part_lz_2_k1: 纯净青黄粉砂夯层 (莫角山二层高台)
        const sandTerrace = new THREE.Mesh(
            new THREE.BoxGeometry(12.5, 0.9, 11.5),
            materials.earth
        );
        sandTerrace.name = 'part_lz_2_k1';
        sandTerrace.position.set(0, 1.45, 0);
        sandTerrace.receiveShadow = true;
        scene.add(sandTerrace);
        registerPhysicsMesh(sandTerrace, 'part_lz_2_k1', 2, 0, true);

        // [Key] part_lz_2_k2: 莫角山四角奠基玄石 (祭坛四隅奠基玄武岩柱)
        const cornerPillars = new THREE.Group();
        cornerPillars.name = 'part_lz_2_k2';
        const corners = [
            [-5.8, -5.3], [5.8, -5.3],
            [-5.8, 5.3],  [5.8, 5.3]
        ];
        corners.forEach(([cx, cz]) => {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.7), materials.charcoalBasalt);
            col.position.set(cx, 1.9, cz);
            col.castShadow = true;
            cornerPillars.add(col);
        });
        scene.add(cornerPillars);
        registerPhysicsMesh(cornerPillars, 'part_lz_2_k2', 2, 1, true);

        // part_lz_2_r1: 外护斜坡块石驳岸 (高台四周砌石护坡)
        const stoneRiprap = new THREE.Group();
        stoneRiprap.name = 'part_lz_2_r1';
        for (let i = 0; i < 28; i++) {
            const angle = (i / 28) * Math.PI * 2;
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.15, 0), materials.charcoalBasalt);
            rock.position.set(Math.cos(angle) * 8.6, 0.45, Math.sin(angle) * 8.6);
            stoneRiprap.add(rock);
        }
        scene.add(stoneRiprap);
        registerPhysicsMesh(stoneRiprap, 'part_lz_2_r1', 2, 2);

        // part_lz_2_r2: 水运码头方木系缆桩 (古运河登岸木构水门头)
        const dockGroup = new THREE.Group();
        dockGroup.name = 'part_lz_2_r2';
        const dockPlank = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 2.2), materials.nanmuVermilion);
        dockPlank.position.set(0, 0.35, 10.5);
        dockGroup.add(dockPlank);
        [-1.3, 1.3].forEach(px => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), materials.nanmuVermilion);
            post.position.set(px, 0.7, 11.3);
            dockGroup.add(post);
        });
        scene.add(dockGroup);
        registerPhysicsMesh(dockGroup, 'part_lz_2_r2', 2, 3);

        // part_lz_2_r3: 登坛中央仪仗踏步 (从水运码头直通神台的百步石阶)
        const grandStairs = new THREE.Group();
        grandStairs.name = 'part_lz_2_r3';
        for (let s = 0; s < 6; s++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 0.6), materials.whiteJadeStone);
            step.position.set(0, 0.4 + s * 0.22, 8.8 - s * 0.55);
            step.castShadow = true;
            step.receiveShadow = true;
            grandStairs.add(step);
        }
        scene.add(grandStairs);
        registerPhysicsMesh(grandStairs, 'part_lz_2_r3', 2, 4);

        // part_lz_2_r4: 环坛引水清流明沟 (绕神台四周的环形明沟)
        const waterTrench = new THREE.Group();
        waterTrench.name = 'part_lz_2_r4';
        const trenchN = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.12, 0.6), materials.water);
        trenchN.position.set(0, 1.96, -4.9);
        waterTrench.add(trenchN);
        const trenchS = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.12, 0.6), materials.water);
        trenchS.position.set(0, 1.96, 4.9);
        waterTrench.add(trenchS);
        const trenchW = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 10.4), materials.water);
        trenchW.position.set(-5.5, 1.96, 0);
        waterTrench.add(trenchW);
        const trenchE = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 10.4), materials.water);
        trenchE.position.set(5.5, 1.96, 0);
        waterTrench.add(trenchE);
        scene.add(waterTrench);
        registerPhysicsMesh(waterTrench, 'part_lz_2_r4', 2, 5);

        // part_lz_2_r5: 夯土护角木构排柱 (四周垂直木桩挡土排桩)
        const revetmentPoles = new THREE.Group();
        revetmentPoles.name = 'part_lz_2_r5';
        for (let x = -5.8; x <= 5.8; x += 1.2) {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 6), materials.nanmuVermilion);
            pole.position.set(x, 1.2, 5.6);
            revetmentPoles.add(pole);
        }
        scene.add(revetmentPoles);
        registerPhysicsMesh(revetmentPoles, 'part_lz_2_r5', 2, 6);

        // part_lz_2_r6: 坛面灰白细沙铺面 (二层高台广场白砂石铺装)
        const sandFloor = new THREE.Mesh(
            new THREE.BoxGeometry(11.2, 0.1, 10.2),
            materials.stonePaver
        );
        sandFloor.name = 'part_lz_2_r6';
        sandFloor.position.set(0, 1.95, 0);
        sandFloor.receiveShadow = true;
        scene.add(sandFloor);
        registerPhysicsMesh(sandFloor, 'part_lz_2_r6', 2, 7);
    }

    // =========================================================================
    // 阶段 3: 立柱架梁 (8 件构件契约)
    // =========================================================================
    if (stage >= 3) {
        // [Key] part_lz_3_k1: 金丝楠木神殿通天柱 (神王大殿 16 根粗壮立柱网)
        const palacePillars = new THREE.Group();
        palacePillars.name = 'part_lz_3_k1';
        const pillarGrid = [
            [-4.2, -4.5], [-1.4, -4.5], [1.4, -4.5], [4.2, -4.5],
            [-4.2, -2.5], [-1.4, -2.5], [1.4, -2.5], [4.2, -2.5],
            [-4.2, -0.5], [-1.4, -0.5], [1.4, -0.5], [4.2, -0.5]
        ];
        pillarGrid.forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.24, 0.28, 4.2, 12),
                materials.nanmuVermilion
            );
            pillar.position.set(px, 4.05, pz);
            pillar.castShadow = true;
            palacePillars.add(pillar);
            // 鎏金铜柱础
            const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.25, 8), materials.goldMetal);
            basePlinth.position.set(px, 2.05, pz);
            palacePillars.add(basePlinth);
        });
        scene.add(palacePillars);
        registerPhysicsMesh(palacePillars, 'part_lz_3_k1', 3, 0, true);

        // [Key] part_lz_3_k2: 神王九踩五翘大斗栱 (柱头九踩雕刻斗栱组)
        const dougongGroup = new THREE.Group();
        dougongGroup.name = 'part_lz_3_k2';
        pillarGrid.forEach(([px, pz]) => {
            const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.7), materials.nanmuVermilion);
            bracket.position.set(px, 6.2, pz);
            bracket.castShadow = true;
            dougongGroup.add(bracket);
        });
        scene.add(dougongGroup);
        registerPhysicsMesh(dougongGroup, 'part_lz_3_k2', 3, 1, true);

        // part_lz_3_r1: 重檐飞翘下层挑檐 (大殿下层围廊四阿飞檐挑角与3D垂落草披)
        const lowerEaves = new THREE.Group();
        lowerEaves.name = 'part_lz_3_r1';

        const eaveThick = 0.22;
        const eaveDepthS = 2.4;
        // 南坡挑檐
        const roofLS = new THREE.Mesh(new THREE.BoxGeometry(11.4, eaveThick, eaveDepthS), materials.thatch);
        roofLS.position.set(0, 5.75, 0.5);
        roofLS.rotation.x = 0.28;
        roofLS.castShadow = true;
        roofLS.receiveShadow = true;
        lowerEaves.add(roofLS);

        // 北坡挑檐
        const roofLN = new THREE.Mesh(new THREE.BoxGeometry(11.4, eaveThick, eaveDepthS), materials.thatch);
        roofLN.position.set(0, 5.75, -5.5);
        roofLN.rotation.x = -0.28;
        roofLN.castShadow = true;
        roofLN.receiveShadow = true;
        lowerEaves.add(roofLN);

        // 西坡挑檐
        const roofLW = new THREE.Mesh(new THREE.BoxGeometry(eaveDepthS, eaveThick, 7.4), materials.thatch);
        roofLW.position.set(-5.6, 5.75, -2.5);
        roofLW.rotation.z = -0.28;
        roofLW.castShadow = true;
        roofLW.receiveShadow = true;
        lowerEaves.add(roofLW);

        // 东坡挑檐
        const roofLE = new THREE.Mesh(new THREE.BoxGeometry(eaveDepthS, eaveThick, 7.4), materials.thatch);
        roofLE.position.set(5.6, 5.75, -2.5);
        roofLE.rotation.z = 0.28;
        roofLE.castShadow = true;
        roofLE.receiveShadow = true;
        lowerEaves.add(roofLE);

        // 四周 3D 参差毛茸草丝垂须 (3D Thatch Fringes for Lower Eaves)
        const fringeS = new THREE.Mesh(createThatchFringeGeometry(11.6, 0.45, 46), materials.thatch);
        fringeS.position.set(0, 5.48, 1.55);
        fringeS.rotation.x = 0.28;
        fringeS.castShadow = true;
        lowerEaves.add(fringeS);

        const fringeN = new THREE.Mesh(createThatchFringeGeometry(11.6, 0.45, 46), materials.thatch);
        fringeN.position.set(0, 5.48, -6.55);
        fringeN.rotation.x = -0.28;
        fringeN.rotation.y = Math.PI;
        fringeN.castShadow = true;
        lowerEaves.add(fringeN);

        const fringeW = new THREE.Mesh(createThatchFringeGeometry(7.6, 0.45, 30), materials.thatch);
        fringeW.position.set(-6.7, 5.48, -2.5);
        fringeW.rotation.y = Math.PI / 2;
        fringeW.rotation.x = 0.28;
        fringeW.castShadow = true;
        lowerEaves.add(fringeW);

        const fringeE = new THREE.Mesh(createThatchFringeGeometry(7.6, 0.45, 30), materials.thatch);
        fringeE.position.set(6.7, 5.48, -2.5);
        fringeE.rotation.y = -Math.PI / 2;
        fringeE.rotation.x = 0.28;
        fringeE.castShadow = true;
        lowerEaves.add(fringeE);

        scene.add(lowerEaves);
        registerPhysicsMesh(lowerEaves, 'part_lz_3_r1', 3, 2);

        // part_lz_3_r2: 纵横交错承重次梁 (殿顶五架梁与草架梁)
        const roofBeams = new THREE.Group();
        roofBeams.name = 'part_lz_3_r2';
        [-4.5, -2.5, -0.5].forEach(bz => {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.3, 0.4), materials.nanmuVermilion);
            beam.position.set(0, 6.35, bz);
            roofBeams.add(beam);
        });
        scene.add(roofBeams);
        registerPhysicsMesh(roofBeams, 'part_lz_3_r2', 3, 3);

        // part_lz_3_r3: 密排顺水起伏圆椽 (屋架密布金丝楠木椽条)
        const rafters = new THREE.Group();
        rafters.name = 'part_lz_3_r3';
        for (let x = -4.8; x <= 4.8; x += 0.45) {
            const r = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 6), materials.nanmuVermilion);
            r.position.set(x, 6.8, -2.5);
            r.rotation.x = 0.45;
            rafters.add(r);
        }
        scene.add(rafters);
        registerPhysicsMesh(rafters, 'part_lz_3_r3', 3, 4);

        // part_lz_3_r4: 殿前仪仗朱红护栏 (雕花透空朱漆汉白玉栏杆)
        const balustrade = new THREE.Group();
        balustrade.name = 'part_lz_3_r4';
        const railFrontL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.65, 0.15), materials.whiteJadeStone);
        railFrontL.position.set(-3.2, 2.3, 0.5);
        balustrade.add(railFrontL);
        const railFrontR = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.65, 0.15), materials.whiteJadeStone);
        railFrontR.position.set(3.2, 2.3, 0.5);
        balustrade.add(railFrontR);
        scene.add(balustrade);
        registerPhysicsMesh(balustrade, 'part_lz_3_r4', 3, 5);

        // part_lz_3_r5: 侧翼神职祭祀配房 (大殿东西两侧耳房配室)
        const sideWings = new THREE.Group();
        sideWings.name = 'part_lz_3_r5';
        const wingW = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 3.8), materials.nanmuVermilion);
        wingW.position.set(-5.6, 3.1, -2.5);
        sideWings.add(wingW);
        const wingE = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 3.8), materials.nanmuVermilion);
        wingE.position.set(5.6, 3.1, -2.5);
        sideWings.add(wingE);
        scene.add(sideWings);
        registerPhysicsMesh(sideWings, 'part_lz_3_r5', 3, 6);

        // part_lz_3_r6: 通风采光透雕长窗 (大殿朱漆透雕神鸟花格门窗)
        const latticedScreens = new THREE.Group();
        latticedScreens.name = 'part_lz_3_r6';
        [-2.8, 0, 2.8].forEach(sx => {
            const screen = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.08), materials.nanmuVermilion);
            screen.position.set(sx, 3.1, -0.6);
            latticedScreens.add(screen);
        });
        scene.add(latticedScreens);
        registerPhysicsMesh(latticedScreens, 'part_lz_3_r6', 3, 7);
    }

    // =========================================================================
    // 阶段 4: 覆水成宇 (8 件构件契约)
    // =========================================================================
    if (stage >= 4) {
        // [Key] part_lz_4_k1: 镏金铜鸟正脊宝顶 (四阿重檐正脊铜鸟神徽宝顶)
        const ridgeFinial = new THREE.Group();
        ridgeFinial.name = 'part_lz_4_k1';
        const finialBird = new THREE.Mesh(
            new THREE.ConeGeometry(0.35, 0.85, 8),
            materials.goldMetal
        );
        finialBird.position.y = 0.45;
        finialBird.castShadow = true;
        ridgeFinial.add(finialBird);
        const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), materials.goldMetal);
        finialBall.position.y = 0;
        ridgeFinial.add(finialBall);
        ridgeFinial.position.set(0, 10.15, -2.5);
        scene.add(ridgeFinial);
        registerPhysicsMesh(ridgeFinial, 'part_lz_4_k1', 4, 0, true);

        // [Key] part_lz_4_k2: 紧密排列竹帘防风窗 (密排竹篾卷帘与下垂垂木配重)
        const bambooCurtains = new THREE.Group();
        bambooCurtains.name = 'part_lz_4_k2';
        [-2.8, 2.8].forEach(bx => {
            const screenUnit = new THREE.Group();
            screenUnit.position.set(bx, 3.1, -0.55);

            // 12 道立体横排竹篾排条
            for (let sl = 0; sl < 12; sl++) {
                const slat = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.12, 0.03),
                    materials.bambooReed
                );
                slat.position.y = -0.9 + sl * 0.16;
                slat.castShadow = true;
                screenUnit.add(slat);
            }
            // 左右麻绳穿束扎线
            [-0.6, 0.6].forEach(cx => {
                const cord = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.95, 0.04), materials.thatch);
                cord.position.set(cx, 0, 0.015);
                screenUnit.add(cord);
            });
            // 底部卷帘圆木配重滚轴
            const bottomRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.62, 8), materials.nanmuVermilion);
            bottomRoll.rotation.z = Math.PI / 2;
            bottomRoll.position.set(0, -0.98, 0.02);
            screenUnit.add(bottomRoll);

            bambooCurtains.add(screenUnit);
        });
        scene.add(bambooCurtains);
        registerPhysicsMesh(bambooCurtains, 'part_lz_4_k2', 4, 1, true);

        // part_lz_4_r1: 高温煅烧红烧土地坪砖 (大殿室内平整光洁红陶地砖)
        const brickFloor = new THREE.Mesh(
            new THREE.BoxGeometry(8.8, 0.08, 4.4),
            new THREE.MeshStandardMaterial({ color: 0x993322, roughness: 0.5, metalness: 0.1 })
        );
        brickFloor.name = 'part_lz_4_r1';
        brickFloor.position.set(0, 2.04, -2.5);
        scene.add(brickFloor);
        registerPhysicsMesh(brickFloor, 'part_lz_4_r1', 4, 2);

        // part_lz_4_r2: 大殿外壁漆彩防水涂层 (天然朱砂大漆封护光面)
        const lacqueredWalls = new THREE.Group();
        lacqueredWalls.name = 'part_lz_4_r2';
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.0, 2.6, 0.25), materials.nanmuVermilion);
        backWall.position.set(0, 3.3, -4.6);
        lacqueredWalls.add(backWall);
        scene.add(lacqueredWalls);
        registerPhysicsMesh(lacqueredWalls, 'part_lz_4_r2', 4, 3);

        // part_lz_4_r3: 编织芦苇双层绝热屋面 (四阿歇山宏伟草顶主屋面，带全向3D参差草披垂尖与粗大覆草正脊)
        const upperRoof = new THREE.Group();
        upperRoof.name = 'part_lz_4_r3';

        // 1. 真实四阿庑殿主草顶 (Hipped Roof Core)
        const hippedGeo = createHippedRoofGeometry(10.6, 6.8, 2.9, 0.48);
        const hippedMesh = new THREE.Mesh(hippedGeo, materials.thatch);
        hippedMesh.position.set(0, 6.9, -2.5);
        hippedMesh.castShadow = true;
        hippedMesh.receiveShadow = true;
        upperRoof.add(hippedMesh);

        // 2. 四周檐口 3D 参差毛茸草丝垂须 (3D Thatch Overhang Fringes)
        const uFringeS = new THREE.Mesh(createThatchFringeGeometry(10.8, 0.55, 44), materials.thatch);
        uFringeS.position.set(0, 6.82, 0.95);
        uFringeS.rotation.x = 0.35;
        uFringeS.castShadow = true;
        upperRoof.add(uFringeS);

        const uFringeN = new THREE.Mesh(createThatchFringeGeometry(10.8, 0.55, 44), materials.thatch);
        uFringeN.position.set(0, 6.82, -5.95);
        uFringeN.rotation.x = -0.35;
        uFringeN.rotation.y = Math.PI;
        uFringeN.castShadow = true;
        upperRoof.add(uFringeN);

        const uFringeW = new THREE.Mesh(createThatchFringeGeometry(7.0, 0.52, 28), materials.thatch);
        uFringeW.position.set(-5.35, 6.82, -2.5);
        uFringeW.rotation.y = Math.PI / 2;
        uFringeW.rotation.x = 0.35;
        uFringeW.castShadow = true;
        upperRoof.add(uFringeW);

        const uFringeE = new THREE.Mesh(createThatchFringeGeometry(7.0, 0.52, 28), materials.thatch);
        uFringeE.position.set(5.35, 6.82, -2.5);
        uFringeE.rotation.y = -Math.PI / 2;
        uFringeE.rotation.x = 0.35;
        uFringeE.castShadow = true;
        upperRoof.add(uFringeE);

        // 3. 正脊粗大覆草卷 (Thick Thatch Ridge Roll)
        const ridgeRoll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.32, 5.6, 16),
            materials.thatch
        );
        ridgeRoll.rotation.z = Math.PI / 2;
        ridgeRoll.position.set(0, 9.8, -2.5);
        ridgeRoll.castShadow = true;
        upperRoof.add(ridgeRoll);

        // 4. 四条垂脊覆草加固卷 (Four Hip Ridge Rolls)
        const hipRollLength = 4.8;
        [
            [-2.6, 8.35, -4.2, Math.PI / 6, -Math.PI / 4],
            [2.6, 8.35, -4.2, Math.PI / 6, Math.PI / 4],
            [-2.6, 8.35, -0.8, -Math.PI / 6, -Math.PI / 4],
            [2.6, 8.35, -0.8, -Math.PI / 6, Math.PI / 4]
        ].forEach(([hx, hy, hz, rx, ry]) => {
            const hipRoll = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.22, hipRollLength, 8),
                materials.thatch
            );
            hipRoll.position.set(hx, hy, hz);
            hipRoll.rotation.x = rx;
            hipRoll.rotation.y = ry;
            hipRoll.rotation.z = Math.PI / 4;
            upperRoof.add(hipRoll);
        });

        // 5. 屋面防风压竹条与麻绳扎扣 (Bamboo Weather Battens & Ties)
        for (let b = -4.2; b <= 4.2; b += 1.4) {
            const battenS = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.8, 6), materials.bambooReed);
            battenS.position.set(b, 8.2, -1.2);
            battenS.rotation.x = 0.65;
            upperRoof.add(battenS);

            const battenN = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.8, 6), materials.bambooReed);
            battenN.position.set(b, 8.2, -3.8);
            battenN.rotation.x = -0.65;
            upperRoof.add(battenN);
        }

        scene.add(upperRoof);
        registerPhysicsMesh(upperRoof, 'part_lz_4_r3', 4, 4);

        // part_lz_4_r4: 重檐外挑防水木飞椽 (四角深挑超两米的飞檐角梁)
        const cornerFlyingEaves = new THREE.Group();
        cornerFlyingEaves.name = 'part_lz_4_r4';
        const eaveCorners = [
            [-5.4, 5.8, -5.8], [5.4, 5.8, -5.8],
            [-5.4, 5.8, 0.8],  [5.4, 5.8, 0.8]
        ];
        eaveCorners.forEach(([ex, ey, ez]) => {
            const eave = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 2.2), materials.nanmuVermilion);
            eave.position.set(ex, ey, ez);
            eave.rotation.y = Math.atan2(ex, ez + 2.5);
            eave.rotation.x = -0.3;
            cornerFlyingEaves.add(eave);
        });
        scene.add(cornerFlyingEaves);
        registerPhysicsMesh(cornerFlyingEaves, 'part_lz_4_r4', 4, 5);

        // part_lz_4_r5: 良渚刻符黑陶瓦当饰件 (屋脊端头细密刻符黑陶鸱吻兽头)
        const potteryRidgeEnd = new THREE.Group();
        potteryRidgeEnd.name = 'part_lz_4_r5';
        [-2.8, 2.8].forEach(rx => {
            const beast = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.7, 6), materials.charcoalBasalt);
            beast.rotation.z = rx > 0 ? -0.4 : 0.4;
            beast.position.set(rx, 9.85, -2.5);
            potteryRidgeEnd.add(beast);
        });
        scene.add(potteryRidgeEnd);
        registerPhysicsMesh(potteryRidgeEnd, 'part_lz_4_r5', 4, 6);

        // part_lz_4_r6: 殿角青铜兽面垂脊兽
        const hipBeasts = new THREE.Group();
        hipBeasts.name = 'part_lz_4_r6';
        [-4.2, 4.2].forEach(hx => {
            const hb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), materials.goldMetal);
            hb.position.set(hx, 6.0, 0.2);
            hipBeasts.add(hb);
        });
        scene.add(hipBeasts);
        registerPhysicsMesh(hipBeasts, 'part_lz_4_r6', 4, 7);
    }

    // =========================================================================
    // 阶段 5: 玉映神光 (8 件构件契约 + 国宝玉琮王、巡航独木舟与神圣光晕)
    // =========================================================================
    if (stage >= 5) {
        // [Key] part_lz_5_k1: 神人兽面纹 · 大玉琮之王 (良渚至高神权王权图腾)
        const jadeCongGroup = new THREE.Group();
        jadeCongGroup.name = 'part_lz_5_k1';

        // 汉白玉三层神坛基座 (Step-pyramid Altar Base)
        for (let t = 0; t < 3; t++) {
            const stepY = 2.05 + t * 0.28;
            const stepW = 4.2 - t * 0.9;
            const altarTier = new THREE.Mesh(
                new THREE.BoxGeometry(stepW, 0.26, stepW),
                materials.stonePaver
            );
            altarTier.position.set(0, stepY, 3.5);
            altarTier.castShadow = true;
            altarTier.receiveShadow = true;
            jadeCongGroup.add(altarTier);
        }

        // 金莲托座
        const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.35, 16), materials.goldMetal);
        lotusBase.position.set(0, 3.05, 3.5);
        lotusBase.castShadow = true;
        jadeCongGroup.add(lotusBase);

        // 大玉琮王本体 (外方内圆，四角两层八组神人兽面双圈眼羽冠微雕)
        const congOuter = buildSculptedJadeCongKing();
        congOuter.position.set(0, 4.15, 3.5);
        jadeCongGroup.add(congOuter);
        animatedElements.jadeCong = congOuter;

        // 玉琮王自发光灵环粒子 (Orbiting Spirit Jade Motes)
        for (let m = 0; m < 14; m++) {
            const mote = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
            );
            mote.userData = { index: m, total: 14 };
            jadeCongGroup.add(mote);
            animatedElements.jadeMotes.push(mote);
        }

        scene.add(jadeCongGroup);
        registerPhysicsMesh(jadeCongGroup, 'part_lz_5_k1', 5, 0, true);

        // [Key] part_lz_5_k2: 神王象牙权杖黄金顶与王权玉钺全套组 (反山M12出土白玉瑁+玉钺身+玉镦组合)
        const scepterGroup = buildSculptedKingAxeScepter();
        scepterGroup.name = 'part_lz_5_k2';
        scepterGroup.position.set(1.8, 3.8, 3.5);
        scene.add(scepterGroup);
        registerPhysicsMesh(scepterGroup, 'part_lz_5_k2', 5, 1, true);

        // part_lz_5_r1: 三叉形神冠白玉插饰 (反山M12出土三叉形神冠玉器)
        const crownOrnament = buildSculptedTriProngJade();
        crownOrnament.name = 'part_lz_5_r1';
        crownOrnament.position.set(-1.8, 3.4, 3.5);
        scene.add(crownOrnament);
        registerPhysicsMesh(crownOrnament, 'part_lz_5_r1', 5, 2);

        // part_lz_5_r2: 稍磨透光双圆白玉璧 (苍璧礼天，挂于大殿正中)
        const jadeBiGroup = new THREE.Group();
        jadeBiGroup.name = 'part_lz_5_r2';
        const biDisk = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 16, 32), materials.pureJadeWhite);
        biDisk.position.set(0, 4.2, -0.75);
        biDisk.castShadow = true;
        jadeBiGroup.add(biDisk);
        scene.add(jadeBiGroup);
        registerPhysicsMesh(jadeBiGroup, 'part_lz_5_r2', 5, 3);

        // part_lz_5_r3: 神王九五之尊金丝楠木榻 (大殿中央神王宝座)
        const kingThrone = new THREE.Group();
        kingThrone.name = 'part_lz_5_r3';
        const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 1.4), materials.nanmuVermilion);
        throneSeat.position.set(0, 2.3, -3.2);
        kingThrone.add(throneSeat);
        const throneBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.2), materials.nanmuVermilion);
        throneBack.position.set(0, 3.1, -3.8);
        kingThrone.add(throneBack);
        scene.add(kingThrone);
        registerPhysicsMesh(kingThrone, 'part_lz_5_r3', 5, 4);

        // part_lz_5_r4: 祭天燎祭玄石大火鼎 (祭坛前青烟袅袅的巨石燎祭大盒)
        const sacrificialCauldron = new THREE.Group();
        sacrificialCauldron.name = 'part_lz_5_r4';
        const tripodBody = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.65, 0.7, 12), materials.charcoalBasalt);
        tripodBody.position.set(0, 2.45, 6.2);
        tripodBody.castShadow = true;
        sacrificialCauldron.add(tripodBody);
        // 红热燃烧木炭
        const glowingEmbers = new THREE.Mesh(
            new THREE.CircleGeometry(0.72, 12),
            new THREE.MeshStandardMaterial({
                color: 0xff4500,
                emissive: 0xff3300,
                emissiveIntensity: 2.5
            })
        );
        glowingEmbers.rotation.x = -Math.PI / 2;
        glowingEmbers.position.set(0, 2.82, 6.2);
        sacrificialCauldron.add(glowingEmbers);
        scene.add(sacrificialCauldron);
        registerPhysicsMesh(sacrificialCauldron, 'part_lz_5_r4', 5, 5);

        // part_lz_5_r5: 聚落四方守卫巨石神兽 (四角威严护法石兽立柱)
        const guardianStatues = new THREE.Group();
        guardianStatues.name = 'part_lz_5_r5';
        const gPositions = [
            [-4.8, 1.2], [4.8, 1.2],
            [-4.8, 6.2], [4.8, 6.2]
        ];
        gPositions.forEach(([gx, gz]) => {
            const statue = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, 0.55), materials.charcoalBasalt);
            statue.position.set(gx, 2.65, gz);
            statue.castShadow = true;
            guardianStatues.add(statue);
        });
        scene.add(guardianStatues);
        registerPhysicsMesh(guardianStatues, 'part_lz_5_r5', 5, 6);

        // part_lz_5_r6: 环坛周天八卦玉琮列阵 (8 座微型玉琮礼祭方阵)
        const jadeArray = new THREE.Group();
        jadeArray.name = 'part_lz_5_r6';
        for (let a = 0; a < 8; a++) {
            const angle = (a / 8) * Math.PI * 2;
            const smallCong = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 0.32), materials.jadeCongMat);
            smallCong.position.set(Math.cos(angle) * 3.4, 2.25, 3.5 + Math.sin(angle) * 3.4);
            jadeArray.add(smallCong);
        }
        scene.add(jadeArray);
        registerPhysicsMesh(jadeArray, 'part_lz_5_r6', 5, 7);

        // =====================================================================
        // LITTLEST TOKYO 级水乡微缩活态场景与关键帧动效 (Diorama Life Props)
        // =====================================================================

        // 1. 巡航良渚独木舟与划桨人 (Cruising Dugout Canoe & Paddler)
        const { root: canoeGroup, oarMesh } = buildSculptedDugoutCanoe();
        canoeGroup.position.set(11.8, 0.18, 0);
        scene.add(canoeGroup);
        animatedElements.canoeGroup = canoeGroup;
        animatedElements.oarMesh = oarMesh;

        // 2. 仪式大锦幡 (Swaying Silk Banners)
        [-2.4, 2.4].forEach((bx) => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.5, 6), materials.nanmuVermilion);
            pole.position.set(bx, 4.6, 7.8);
            scene.add(pole);

            const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 2.2), materials.bannerSilk);
            banner.position.set(bx + 0.35, 5.4, 7.8);
            scene.add(banner);
            animatedElements.banners.push(banner);
        });
    }

    // =========================================================================
    // 关键帧/循环动力学更新函数 (由主渲染循环每帧调用，对标 Littlest Tokyo)
    // =========================================================================
    return {
        updateAnimations: (delta, elapsedTime) => {
            // 1. 水面连续流动
            if (textures.water) {
                textures.water.offset.x += delta * 0.035;
                textures.water.offset.y += delta * 0.018;
            }

            // 2. 独木舟沿外运河平滑巡游 (Closed Loop Canal Cruise)
            if (animatedElements.canoeGroup) {
                const cruiseSpeed = 0.22;
                const angle = elapsedTime * cruiseSpeed;
                const radius = 11.8;
                const cx = Math.cos(angle) * radius;
                const cz = Math.sin(angle) * radius;
                animatedElements.canoeGroup.position.set(cx, 0.18 + Math.sin(elapsedTime * 3) * 0.02, cz);
                // 船头切线朝向
                animatedElements.canoeGroup.rotation.y = -angle;
                // 船身随波浪轻微俯仰与横摇
                animatedElements.canoeGroup.rotation.z = Math.sin(elapsedTime * 4) * 0.04;
                animatedElements.canoeGroup.rotation.x = Math.cos(elapsedTime * 2.5) * 0.03;

                // 划桨划水摆动
                if (animatedElements.oarMesh) {
                    animatedElements.oarMesh.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 4.5) * 0.25;
                }
            }

            // 3. 国宝大玉琮王神圣悬浮与自转
            if (animatedElements.jadeCong) {
                animatedElements.jadeCong.rotation.y += delta * 0.35;
                animatedElements.jadeCong.position.y = 4.15 + Math.sin(elapsedTime * 1.8) * 0.12;
            }

            // 4. 玉灵微粒双环公转
            if (animatedElements.jadeMotes.length > 0) {
                const motes = animatedElements.jadeMotes;
                for (let i = 0; i < motes.length; i++) {
                    const phi = elapsedTime * 1.4 + (i / motes.length) * Math.PI * 2;
                    const r = 1.35 + Math.sin(elapsedTime * 2 + i) * 0.2;
                    motes[i].position.x = Math.cos(phi) * r;
                    motes[i].position.z = 3.5 + Math.sin(phi) * r;
                    motes[i].position.y = 4.2 + Math.sin(elapsedTime * 2.5 + i) * 0.35;
                }
            }

            // 5. 祭天大鼎神火与玉琮神光跳动
            if (animatedElements.hearthLight) {
                animatedElements.hearthLight.intensity = 2.0 + Math.sin(elapsedTime * 14) * 0.45 + Math.cos(elapsedTime * 28) * 0.2;
            }
            if (animatedElements.jadeLight) {
                animatedElements.jadeLight.intensity = 2.4 + Math.sin(elapsedTime * 2.5) * 0.6;
            }

            // 6. 神幡自然微风拂动
            animatedElements.banners.forEach((banner, idx) => {
                banner.rotation.y = Math.sin(elapsedTime * 3.2 + idx) * 0.28;
                banner.rotation.z = Math.cos(elapsedTime * 2.2 + idx) * 0.08;
            });
        }
    };
}
