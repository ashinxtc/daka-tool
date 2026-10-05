import * as THREE from 'three';

/**
 * 🏛️ 半坡聚落 · 中央大草庐 (F1大房子) 微缩立体建筑箱庭 (Architectural Diorama)
 * 对标 Littlest Tokyo 风格：厚切黄土考古地层切片 + 权威杨鸿勋长方大悬山复原 + 聚落生活场景与关键帧动效
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

export function buildBanpoDiorama({
    scene,
    stage,
    isConstructing,
    textures,
    fireLight,
    registerPhysicsMesh
}) {
    // 动效对象容器
    const animatedElements = {
        smokePuffs: [],
        windSwayables: [],
        waterMesh: null,
        dogTail: null,
        hearthLight: fireLight,
        totemFeathers: []
    };

    // 基础 PBR 材质
    const materials = {
        earth: new THREE.MeshStandardMaterial({
            map: textures.rammedEarth.map,
            bumpMap: textures.rammedEarth.bumpMap,
            bumpScale: 0.12,
            roughness: 0.88,
            metalness: 0.05
        }),
        darkEarthCutaway: new THREE.MeshStandardMaterial({
            color: 0x3d2714,
            roughness: 0.95,
            metalness: 0.02
        }),
        subsoilYellow: new THREE.MeshStandardMaterial({
            color: 0x8a6234,
            roughness: 0.9,
            metalness: 0.05
        }),
        burnedClay: new THREE.MeshStandardMaterial({
            color: 0x994422,
            roughness: 0.75,
            metalness: 0.08
        }),
        oakWood: new THREE.MeshStandardMaterial({
            map: textures.oakWood.map,
            bumpMap: textures.oakWood.bumpMap,
            bumpScale: 0.08,
            roughness: 0.72,
            metalness: 0.05
        }),
        thatch: new THREE.MeshStandardMaterial({
            map: textures.thatch.map,
            bumpMap: textures.thatch.bumpMap,
            bumpScale: 0.22,
            roughness: 0.82,
            metalness: 0.02,
            side: THREE.DoubleSide
        }),
        pottery: new THREE.MeshStandardMaterial({
            map: textures.pottery.map,
            roughness: 0.38,
            metalness: 0.12
        }),
        unfiredClay: new THREE.MeshStandardMaterial({
            color: 0x7c7365,
            roughness: 0.6,
            metalness: 0.05
        }),
        water: new THREE.MeshStandardMaterial({
            map: textures.water,
            color: 0x14b8a6,
            roughness: 0.1,
            metalness: 0.25,
            transparent: true,
            opacity: 0.88
        }),
        stone: new THREE.MeshStandardMaterial({
            color: 0x78716c,
            roughness: 0.8,
            metalness: 0.05
        }),
        pelt: new THREE.MeshStandardMaterial({
            color: 0xb45309,
            roughness: 0.9,
            metalness: 0.02,
            side: THREE.DoubleSide
        }),
        charcoal: new THREE.MeshStandardMaterial({
            color: 0x1f1917,
            roughness: 0.95,
            metalness: 0.0
        }),
        potteryBlack: new THREE.MeshStandardMaterial({
            color: 0x181615,
            roughness: 0.42,
            metalness: 0.05
        }),
        grassGreen: new THREE.MeshStandardMaterial({
            color: 0x556b2f,
            roughness: 0.85,
            metalness: 0.02
        })
    };

    const applyShadows = (mesh) => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    };

    // =========================================================================
    // 0. DIORAMA BOX BASE: 立体厚切黄土考古台地 (Diorama Strata Base)
    // =========================================================================
    const baseGroup = new THREE.Group();
    baseGroup.name = 'diorama_base_strata';

    // (1) 底部切角底座 (多边形厚切基台)
    const baseGeo = new THREE.CylinderGeometry(13.5, 14.5, 2.2, 32);
    const baseMesh = new THREE.Mesh(baseGeo, materials.darkEarthCutaway);
    baseMesh.position.y = -1.1;
    baseMesh.receiveShadow = true;
    baseGroup.add(baseMesh);

    // (2) 黄土生土表层 (带有微地形起伏与中央半地穴凹陷)
    const surfaceGeo = new THREE.CylinderGeometry(13.2, 13.5, 0.4, 32);
    const surfaceMesh = new THREE.Mesh(surfaceGeo, materials.earth);
    surfaceMesh.position.y = 0.0;
    surfaceMesh.receiveShadow = true;
    baseGroup.add(surfaceMesh);

    // (3) 前侧环壕清流 (弧形凹槽运河水流)
    const canalShape = new THREE.Shape();
    canalShape.absarc(0, 0, 12.8, Math.PI * 0.8, Math.PI * 1.5, false);
    canalShape.absarc(0, 0, 11.2, Math.PI * 1.5, Math.PI * 0.8, true);
    canalShape.closePath();
    const canalGeo = new THREE.ExtrudeGeometry(canalShape, { depth: 0.25, bevelEnabled: false });
    const canalMesh = new THREE.Mesh(canalGeo, materials.water);
    canalMesh.rotation.x = Math.PI / 2;
    canalMesh.position.y = 0.08;
    canalMesh.receiveShadow = true;
    baseGroup.add(canalMesh);
    animatedElements.waterMesh = canalMesh;

    // 环壕汀步石
    for (let i = 0; i < 5; i++) {
        const angle = Math.PI * 1.15 + (i - 2) * 0.1;
        const stepStone = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35 + Math.random() * 0.1, 0.45, 0.35, 7),
            materials.stone
        );
        stepStone.position.set(Math.cos(angle) * 12.0, 0.18, Math.sin(angle) * 12.0);
        stepStone.rotation.y = Math.random() * Math.PI;
        applyShadows(stepStone);
        baseGroup.add(stepStone);
    }

    scene.add(baseGroup);

    // =========================================================================
    // 高级程序化几何雕塑发生器 (Procedural Sculpting Generators for Banpo)
    // =========================================================================

    // 1. 仰韶人面鱼纹彩陶大盆 (Sculpted Yangshao Basin with Black-Slip Bas-Relief & Carved Stand)
    const buildSculptedBanpoBasin = () => {
        const root = new THREE.Group();

        // (1) 使用 LatheGeometry 构建真实细泥红陶平底敞口卷唇陶盆
        const basinPoints = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0.38, 0),
            new THREE.Vector2(0.44, 0.04),
            new THREE.Vector2(0.62, 0.18),
            new THREE.Vector2(0.78, 0.38),
            new THREE.Vector2(0.86, 0.46), // 卷唇外凸
            new THREE.Vector2(0.83, 0.47), // 唇沿
            new THREE.Vector2(0.74, 0.40), // 内壁
            new THREE.Vector2(0.56, 0.20),
            new THREE.Vector2(0.38, 0.05),
            new THREE.Vector2(0, 0.04)     // 盆底内凹
        ];
        const basinGeo = new THREE.LatheGeometry(basinPoints, 32);
        const basinMesh = new THREE.Mesh(basinGeo, materials.pottery);
        applyShadows(basinMesh);
        root.add(basinMesh);

        // (2) 盆底与内壁黑彩人面双鱼立体浮雕 (Black-slip Bas-Relief)
        const decoGroup = new THREE.Group();
        decoGroup.position.set(0, 0.06, 0);

        // 人面圆形轮廓 (中置大圆)
        const faceGeo = new THREE.CircleGeometry(0.18, 24);
        const faceMesh = new THREE.Mesh(faceGeo, materials.potteryBlack);
        faceMesh.rotation.x = -Math.PI / 2;
        decoGroup.add(faceMesh);

        // 额头顶耸三角形尖发髻
        const bunShape = new THREE.Shape();
        bunShape.moveTo(-0.06, 0.15);
        bunShape.lineTo(0.06, 0.15);
        bunShape.lineTo(0, 0.32);
        bunShape.closePath();
        const bunMesh = new THREE.Mesh(new THREE.ShapeGeometry(bunShape), materials.potteryBlack);
        bunMesh.rotation.x = -Math.PI / 2;
        decoGroup.add(bunMesh);

        // 发髻顶端横置鱼形发簪
        const hairpin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.012, 0.02), materials.potteryBlack);
        hairpin.position.set(0, 0.005, -0.32);
        decoGroup.add(hairpin);

        // 平直倒 T 字鼻梁与双眼
        const tNose = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.008, 0.09), materials.pottery);
        tNose.position.set(0, 0.005, 0);
        decoGroup.add(tNose);
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.012), materials.pottery);
        eyeL.position.set(-0.07, 0.005, -0.04);
        decoGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.012), materials.pottery);
        eyeR.position.set(0.07, 0.005, -0.04);
        decoGroup.add(eyeR);

        // 左右嘴角对称大游鱼 (口衔鱼造型)
        [-1, 1].forEach((dir) => {
            const fishGroup = new THREE.Group();
            fishGroup.position.set(dir * 0.32, 0.005, 0.05);

            // 鱼身
            const fishBody = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), materials.potteryBlack);
            fishBody.scale.set(1.6, 0.28, 0.75);
            fishBody.rotation.y = dir * 0.22;
            fishGroup.add(fishBody);

            // 鱼尾
            const tailShape = new THREE.Shape();
            tailShape.moveTo(0, 0);
            tailShape.lineTo(dir * 0.14, 0.07);
            tailShape.lineTo(dir * 0.14, -0.07);
            tailShape.closePath();
            const tailMesh = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), materials.potteryBlack);
            tailMesh.rotation.x = -Math.PI / 2;
            tailMesh.position.set(dir * 0.11, 0, 0);
            fishGroup.add(tailMesh);

            // 鱼小黑眼
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), materials.pottery);
            eye.position.set(dir * -0.06, 0.015, -0.02);
            fishGroup.add(eye);

            decoGroup.add(fishGroup);
        });

        // 耳旁对称小鱼
        [-1, 1].forEach((dir) => {
            const earFish = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.14, 8), materials.potteryBlack);
            earFish.rotation.z = dir * (Math.PI / 2 + 0.3);
            earFish.position.set(dir * 0.23, 0.005, -0.07);
            decoGroup.add(earFish);
        });

        root.add(decoGroup);

        // (3) 原木雕花四足托几 (Carved Offering Table)
        const standGroup = new THREE.Group();
        standGroup.position.y = -0.32;

        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 1.2), materials.oakWood);
        applyShadows(tableTop);
        standGroup.add(tableTop);

        [-0.65, 0.65].forEach((tx) => {
            [-0.45, 0.45].forEach((tz) => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.5, 8), materials.oakWood);
                leg.position.set(tx, -0.25, tz);
                applyShadows(leg);
                standGroup.add(leg);
            });
        });

        const rBeam = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.06), materials.oakWood);
        rBeam.position.set(0, -0.35, 0);
        standGroup.add(rBeam);

        root.add(standGroup);
        root.scale.set(1.2, 1.2, 1.2);
        return root;
    };

    // 2. 仰韶双耳尖底汲水瓶 (Sculpted Cord-marked Amphora with Pointed Base & Twin Loop Handles)
    const buildSculptedAmphora = () => {
        const root = new THREE.Group();

        const amphoraPoints = [
            new THREE.Vector2(0.015, 0.0),    // 尖锐底
            new THREE.Vector2(0.05, 0.08),
            new THREE.Vector2(0.12, 0.24),    // 渐宽斜腹
            new THREE.Vector2(0.20, 0.42),
            new THREE.Vector2(0.24, 0.55),    // 鼓腹最宽处
            new THREE.Vector2(0.21, 0.68),    // 溜肩
            new THREE.Vector2(0.12, 0.82),    // 细颈
            new THREE.Vector2(0.07, 0.88),    // 颈口收紧
            new THREE.Vector2(0.09, 0.95),    // 杯形小口
            new THREE.Vector2(0.11, 0.98),    // 翻唇外沿
            new THREE.Vector2(0.08, 0.96),
            new THREE.Vector2(0.05, 0.88),
            new THREE.Vector2(0.01, 0.80)
        ];
        const amphoraGeo = new THREE.LatheGeometry(amphoraPoints, 24);
        const amphoraMesh = new THREE.Mesh(amphoraGeo, materials.pottery);
        applyShadows(amphoraMesh);
        root.add(amphoraMesh);

        // 腹部正中两侧对称环形系绳双耳
        [-1, 1].forEach((dir) => {
            const handleGeo = new THREE.TorusGeometry(0.07, 0.024, 8, 16, Math.PI * 1.2);
            const handle = new THREE.Mesh(handleGeo, materials.pottery);
            handle.position.set(dir * 0.23, 0.54, 0);
            handle.rotation.z = dir * (Math.PI / 2);
            handle.rotation.y = Math.PI / 2;
            root.add(handle);
        });

        // 提拉麻绳圈
        const cordGeo = new THREE.TorusGeometry(0.28, 0.014, 6, 24);
        const cordMesh = new THREE.Mesh(cordGeo, materials.thatch);
        cordMesh.position.set(0, 0.62, 0);
        root.add(cordMesh);

        root.scale.set(0.9, 0.9, 0.9);
        return root;
    };

    // 2.5 仰韶鱼纹陶熏炉 (Sculpted Yangshao Pottery Incense Burner with Pierced Reticulated Lid)
    const buildSculptedCenser = () => {
        const root = new THREE.Group();
        // 炉底座与腹腔 (Lathe)
        const bodyPts = [
            new THREE.Vector2(0.01, 0.0),
            new THREE.Vector2(0.18, 0.04), // 底足
            new THREE.Vector2(0.12, 0.12), // 细收圈足
            new THREE.Vector2(0.24, 0.28), // 鼓腹
            new THREE.Vector2(0.22, 0.40), // 炉口内收
            new THREE.Vector2(0.25, 0.42), // 承盖子口外沿
            new THREE.Vector2(0.01, 0.40)
        ];
        const bodyGeo = new THREE.LatheGeometry(bodyPts, 18);
        const bodyMesh = new THREE.Mesh(bodyGeo, materials.pottery);
        applyShadows(bodyMesh);
        root.add(bodyMesh);

        // 镂空熏炉宝塔盖
        const lidPts = [
            new THREE.Vector2(0.01, 0.65), // 顶钮
            new THREE.Vector2(0.04, 0.63),
            new THREE.Vector2(0.06, 0.58),
            new THREE.Vector2(0.15, 0.50),
            new THREE.Vector2(0.23, 0.42) // 盖沿
        ];
        const lidGeo = new THREE.LatheGeometry(lidPts, 18);
        const lidMesh = new THREE.Mesh(lidGeo, materials.pottery);
        applyShadows(lidMesh);
        root.add(lidMesh);

        // 炉盖上的镂空透烟气孔 (六方小黑点/菱形孔)
        for (let h = 0; h < 6; h++) {
            const ang = (h / 6) * Math.PI * 2;
            const hole = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.02), materials.potteryBlack);
            hole.position.set(Math.cos(ang) * 0.14, 0.52, Math.sin(ang) * 0.14);
            hole.rotation.y = -ang;
            root.add(hole);
        }
        // 内部温和微红香火光晕
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff6622 }));
        glow.position.set(0, 0.32, 0);
        root.add(glow);

        root.scale.set(0.9, 0.9, 0.9);
        return root;
    };

    // 3. 青石平地铲与皮准绳 (Sculpted Polished Stone Spade & Cord Reel)
    const buildSculptedStoneSpade = () => {
        const root = new THREE.Group();

        // 铲头：梯形扁平抛光青石铲，带双面弧形薄刃与双穿孔
        const spadeShape = new THREE.Shape();
        spadeShape.moveTo(-0.18, 0);
        spadeShape.lineTo(-0.24, 0.55);
        spadeShape.lineTo(0.24, 0.55);
        spadeShape.lineTo(0.18, 0);
        spadeShape.closePath();
        const spadeGeo = new THREE.ExtrudeGeometry(spadeShape, { depth: 0.06, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 });
        const spadeMesh = new THREE.Mesh(spadeGeo, new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.2 }));
        spadeMesh.rotation.x = -Math.PI / 2;
        applyShadows(spadeMesh);
        root.add(spadeMesh);

        // 双穿孔
        [-0.08, 0.08].forEach((px) => {
            const holeH = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.09, 8), materials.darkEarthCutaway);
            holeH.position.set(px, 0.03, -0.42);
            root.add(holeH);
        });

        // 坚硬栎木长柄 (带兽皮条交叉缠扎)
        const handleCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.03, -0.2),
            new THREE.Vector3(0, 0.45, -0.9),
            new THREE.Vector3(0, 0.95, -1.5)
        ]);
        const handleMesh = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 12, 0.038, 8, false), materials.oakWood);
        applyShadows(handleMesh);
        root.add(handleMesh);

        // 生皮绳交叉捆扎
        for (let b = 0; b < 4; b++) {
            const bindMesh = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 12), materials.pelt);
            bindMesh.position.set(0, 0.12 + b * 0.08, -0.35 - b * 0.15);
            bindMesh.rotation.x = Math.PI / 4;
            root.add(bindMesh);
        }

        // 工字形木质绕线架与生牛皮准绳
        const reelGroup = new THREE.Group();
        reelGroup.position.set(0.65, 0.12, -0.2);

        const reelShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8), materials.oakWood);
        reelShaft.rotation.z = Math.PI / 2;
        reelGroup.add(reelShaft);
        [-0.22, 0.22].forEach((rx) => {
            const reelEnd = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.06), materials.oakWood);
            reelEnd.position.set(rx, 0, 0);
            reelGroup.add(reelEnd);
        });
        const cordRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 12), new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 }));
        cordRoll.rotation.z = Math.PI / 2;
        reelGroup.add(cordRoll);

        // 骨锥测平铅坠
        const plumbBob = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 6), materials.stone);
        plumbBob.rotation.x = Math.PI;
        plumbBob.position.set(0.25, 0, 0.22);
        reelGroup.add(plumbBob);

        root.add(reelGroup);
        return root;
    };

    // 4. 百年坚栎中央顶梁主柱 (带火烧硬化泥圈与十字卯头)
    const buildSculptedOakPillars = () => {
        const root = new THREE.Group();
        const pillarPositions = [
            [-2.6, -2.4], [2.6, -2.4],
            [-2.6, 2.4],  [2.6, 2.4]
        ];

        pillarPositions.forEach(([px, pz]) => {
            const pillarUnit = new THREE.Group();
            pillarUnit.position.set(px, 0, pz);

            // 柱底防潮防火硬化“泥圈”护基
            const mudRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.16, 8, 20), materials.burnedClay);
            mudRing.rotation.x = Math.PI / 2;
            mudRing.position.y = 0.15;
            applyShadows(mudRing);
            pillarUnit.add(mudRing);

            // 柱底炭化防腐层
            const charFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.44, 0.6, 12), materials.charcoal);
            charFoot.position.y = 0.3;
            pillarUnit.add(charFoot);

            // 坚挺主柱身 (高5.5m，微带原木结疤)
            const pillarMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.34, 0.39, 5.0, 16),
                materials.oakWood
            );
            pillarMesh.position.y = 3.0;
            applyShadows(pillarMesh);
            pillarUnit.add(pillarMesh);

            // 柱头原始十字木托与卡槽
            const bracketCap = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.38, 0.95), materials.oakWood);
            bracketCap.position.y = 5.65;
            applyShadows(bracketCap);
            pillarUnit.add(bracketCap);

            // 麻皮绞索紧固交叉结
            const ropeWrap = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 16), materials.thatch);
            ropeWrap.rotation.x = Math.PI / 2;
            ropeWrap.position.y = 5.45;
            pillarUnit.add(ropeWrap);

            root.add(pillarUnit);
        });

        return root;
    };

    // 5. 火烤硬化红烧土主板 (Wattle-and-Daub Fire-hardened Wall Core with Wicker Impressions & Master Beams)
    const buildSculptedWattleDaubWall = () => {
        const root = new THREE.Group();

        // 真实木骨篱笆夹心红烧土墙板
        const wallBox = new THREE.Mesh(new THREE.BoxGeometry(11.2, 2.4, 0.45), materials.burnedClay);
        wallBox.position.set(0, 1.35, -4.9);
        applyShadows(wallBox);
        root.add(wallBox);

        // 局部剥落露出的木骨芦苇编织骨架
        const wickerGroup = new THREE.Group();
        wickerGroup.position.set(0, 1.35, -4.66);
        for (let w = -4.8; w <= 4.8; w += 0.32) {
            const reedPost = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6), materials.oakWood);
            reedPost.position.set(w, 0, 0);
            wickerGroup.add(reedPost);
        }
        for (let h = -0.9; h <= 0.9; h += 0.28) {
            const weftTwig = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.025, 0.025), materials.thatch);
            weftTwig.position.set(0, h, 0.02);
            wickerGroup.add(weftTwig);
        }
        root.add(wickerGroup);

        // 顶层承托重梁
        const beamSouth = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.45, 0.5), materials.oakWood);
        beamSouth.position.set(0, 5.75, 2.4);
        applyShadows(beamSouth);
        root.add(beamSouth);
        const beamNorth = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.45, 0.5), materials.oakWood);
        beamNorth.position.set(0, 5.75, -2.4);
        applyShadows(beamNorth);
        root.add(beamNorth);

        // 杨鸿勋考古考证：华夏建筑最早“前堂后室”隔断隔墙 (Partition Wall for Earliest Front-Hall Rear-Chamber)
        const partitionWallL = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.2, 0.35), materials.burnedClay);
        partitionWallL.position.set(-3.4, 1.25, -0.6);
        applyShadows(partitionWallL);
        root.add(partitionWallL);

        const partitionWallR = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.2, 0.35), materials.burnedClay);
        partitionWallR.position.set(3.4, 1.25, -0.6);
        applyShadows(partitionWallR);
        root.add(partitionWallR);

        // 室内通间门楣
        const partitionLintel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.38), materials.oakWood);
        partitionLintel.position.set(0, 2.25, -0.6);
        applyShadows(partitionLintel);
        root.add(partitionLintel);

        return root;
    };

    // 6. 横穴式制陶窑炉作坊 (Sculpted Horizontal Kiln with Slow Potter's Wheel & Greenware)
    const buildSculptedKilnWorkshop = () => {
        const root = new THREE.Group();
        root.position.set(8.5, 0.2, -6.5);

        // 下部火膛通道
        const firePit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.2), materials.darkEarthCutaway);
        firePit.position.set(0, 0.2, 0.4);
        root.add(firePit);

        // 倾斜火膛斜坡与红热炭火
        const glowingFlue = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.4), new THREE.MeshBasicMaterial({ color: 0xff4500 }));
        glowingFlue.rotation.x = -Math.PI / 3;
        glowingFlue.position.set(0, 0.32, 0.6);
        root.add(glowingFlue);

        // 窑顶穹隆（红烧土馒头形窑室）
        const kilnDome = new THREE.Mesh(
            new THREE.SphereGeometry(1.3, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
            materials.burnedClay
        );
        kilnDome.position.set(0, 0.5, -0.3);
        applyShadows(kilnDome);
        root.add(kilnDome);

        // 窑顶出烟排气孔
        const ventHole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.4, 8), materials.charcoal);
        ventHole.position.set(0, 1.7, -0.3);
        root.add(ventHole);

        // 慢轮木质制陶转盘
        const wheelBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.25, 12), materials.stone);
        wheelBase.position.set(2.2, 0.12, 0.8);
        root.add(wheelBase);

        const wheelPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.06, 16), materials.oakWood);
        wheelPlate.position.set(2.2, 0.28, 0.8);
        root.add(wheelPlate);

        // 盘上拉坯成型的彩陶罐生坯
        const freshPot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.32, 12), materials.unfiredClay);
        freshPot.position.set(2.2, 0.45, 0.8);
        root.add(freshPot);

        // 晾坯木架与陶坯
        const dryingTable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.8), materials.oakWood);
        dryingTable.position.set(1.6, 0.35, -1.2);
        applyShadows(dryingTable);
        root.add(dryingTable);

        [-1.0, 1.0].forEach((dx) => {
            const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 6), materials.oakWood);
            tableLeg.position.set(1.6 + dx * 0.9, 0.18, -1.2);
            root.add(tableLeg);
        });

        for (let p = 0; p < 4; p++) {
            const miniBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.16, 8), materials.unfiredClay);
            miniBowl.position.set(0.7 + p * 0.55, 0.46, -1.2);
            root.add(miniBowl);
        }

        return root;
    };

    // 7. 中央烧结永恒火塘与烤肉架 (Sculpted Hearth Pit with Charcoal & Meat Roast)
    const buildSculptedHearthAndRack = () => {
        const root = new THREE.Group();

        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.18, 8, 24), materials.burnedClay);
        outerRing.rotation.x = Math.PI / 2;
        outerRing.position.y = 0.22;
        applyShadows(outerRing);
        root.add(outerRing);

        const innerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.15, 18), materials.darkEarthCutaway);
        innerRing.position.y = 0.12;
        root.add(innerRing);

        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const dist = 0.25 + (i % 3) * 0.22;
            const coal = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.14 + (i % 2) * 0.04),
                new THREE.MeshStandardMaterial({
                    color: 0xff3b00,
                    emissive: new THREE.Color(0xff4500),
                    emissiveIntensity: 2.2,
                    roughness: 0.35
                })
            );
            coal.position.set(Math.cos(angle) * dist, 0.26, Math.sin(angle) * dist);
            root.add(coal);
        }

        [-0.7, 0.7].forEach((sx) => {
            const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), materials.oakWood);
            legA.position.set(sx, 0.85, -0.3);
            legA.rotation.z = (sx > 0 ? -1 : 1) * 0.15;
            root.add(legA);
        });
        const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8, 6), materials.oakWood);
        crossBar.rotation.z = Math.PI / 2;
        crossBar.position.set(0, 1.55, -0.3);
        root.add(crossBar);

        const roastGame = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.45, 6, 8), materials.pelt);
        roastGame.rotation.x = Math.PI / 3;
        roastGame.position.set(0, 1.25, -0.3);
        root.add(roastGame);

        return root;
    };

    // =========================================================================
    // 阶段 1: 掘地夯基 (5 件构件契约)
    // =========================================================================
    if (stage >= 1) {
        // [Key] part_bp_1_k: 青石平地铲与皮准绳 (放置在门前测量基准点)
        const spadeGroup = buildSculptedStoneSpade();
        spadeGroup.name = 'part_bp_1_k';
        spadeGroup.position.set(4.5, 0.25, 5.0);
        scene.add(spadeGroup);
        registerPhysicsMesh(spadeGroup, 'part_bp_1_k', 1, 0, true);

        // part_bp_1_r1: 黄土夯筑重锤 (立于下挖基坑边)
        const hammerGroup = new THREE.Group();
        hammerGroup.name = 'part_bp_1_r1';
        const hammerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.7, 8), materials.stone);
        hammerHead.castShadow = true;
        hammerGroup.add(hammerHead);
        const hammerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), materials.oakWood);
        hammerPole.position.y = 1.0;
        hammerPole.castShadow = true;
        hammerGroup.add(hammerPole);
        hammerGroup.position.set(-5.2, 0.35, 4.2);
        hammerGroup.rotation.z = 0.12;
        scene.add(hammerGroup);
        registerPhysicsMesh(hammerGroup, 'part_bp_1_r1', 1, 1);

        // part_bp_1_r2: 生土硬结石灰面 (F1 室内长方形下沉地坪 10.8m x 10.5m)
        const pitFloor = new THREE.Mesh(
            new THREE.BoxGeometry(10.8, 0.25, 10.5),
            materials.burnedClay
        );
        pitFloor.name = 'part_bp_1_r2';
        pitFloor.position.set(0, 0.05, 0);
        pitFloor.receiveShadow = true;
        scene.add(pitFloor);
        registerPhysicsMesh(pitFloor, 'part_bp_1_r2', 1, 2);

        // part_bp_1_r3: 半地穴环形排水明沟 (围绕地坪四周的排水明沟护坎)
        const ditchGroup = new THREE.Group();
        ditchGroup.name = 'part_bp_1_r3';
        const trenchMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.95 });
        // 四条环沟
        const tNorth = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.2, 0.6), trenchMat);
        tNorth.position.set(0, 0.1, -5.55);
        ditchGroup.add(tNorth);
        const tSouth = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.2, 0.6), trenchMat);
        tSouth.position.set(0, 0.1, 5.55);
        ditchGroup.add(tSouth);
        const tWest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 11.6), trenchMat);
        tWest.position.set(-5.65, 0.1, 0);
        ditchGroup.add(tWest);
        const tEast = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 11.6), trenchMat);
        tEast.position.set(5.65, 0.1, 0);
        ditchGroup.add(tEast);
        ditchGroup.receiveShadow = true;
        scene.add(ditchGroup);
        registerPhysicsMesh(ditchGroup, 'part_bp_1_r3', 1, 3);

        // part_bp_1_r4: 防潮碎石散水垫层 (基台外围环铺碎石)
        const gravelGroup = new THREE.Group();
        gravelGroup.name = 'part_bp_1_r4';
        const gravelRing = new THREE.Mesh(
            new THREE.RingGeometry(6.0, 7.8, 24),
            new THREE.MeshStandardMaterial({ color: 0x857d76, roughness: 0.92, side: THREE.DoubleSide })
        );
        gravelRing.rotation.x = -Math.PI / 2;
        gravelRing.position.y = 0.18;
        gravelRing.receiveShadow = true;
        gravelGroup.add(gravelRing);
        scene.add(gravelGroup);
        registerPhysicsMesh(gravelGroup, 'part_bp_1_r4', 1, 4);
    }

    // =========================================================================
    // 阶段 2: 树柱立壁 (5 件构件契约)
    // =========================================================================
    if (stage >= 2) {
        // [Key] part_bp_2_k: 百年坚栎中央顶梁主柱 (带红烧土防潮防腐泥圈)
        const centerPillarsGroup = buildSculptedOakPillars();
        centerPillarsGroup.name = 'part_bp_2_k';
        scene.add(centerPillarsGroup);
        registerPhysicsMesh(centerPillarsGroup, 'part_bp_2_k', 2, 0, true);

        // part_bp_2_r1: 穿枋横向牵拉榫 (连接大立柱的粗横木)
        const tieBeamsGroup = new THREE.Group();
        tieBeamsGroup.name = 'part_bp_2_r1';
        // 南北向穿枋
        const tbW = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 5.2), materials.oakWood);
        tbW.position.set(-2.6, 4.2, 0);
        tieBeamsGroup.add(tbW);
        const tbE = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 5.2), materials.oakWood);
        tbE.position.set(2.6, 4.2, 0);
        tieBeamsGroup.add(tbE);
        // 东西向穿枋
        const tbN = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 0.3), materials.oakWood);
        tbN.position.set(0, 4.4, -2.4);
        tieBeamsGroup.add(tbN);
        const tbS = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 0.3), materials.oakWood);
        tbS.position.set(0, 4.4, 2.4);
        tieBeamsGroup.add(tbS);
        tieBeamsGroup.castShadow = true;
        scene.add(tieBeamsGroup);
        registerPhysicsMesh(tieBeamsGroup, 'part_bp_2_r1', 2, 1);

        // part_bp_2_r2: 外圈周向扶壁斜撑 (密排外围承重斜木柱)
        const wallPostsGroup = new THREE.Group();
        wallPostsGroup.name = 'part_bp_2_r2';
        const addWallPosts = (startX, startZ, endX, endZ, count) => {
            for (let i = 0; i <= count; i++) {
                const t = i / count;
                const px = startX + (endX - startX) * t;
                const pz = startZ + (endZ - startZ) * t;
                // 门洞避让 (南面中央留出门洞)
                if (Math.abs(pz - 5.2) < 0.2 && Math.abs(px) < 1.4) continue;
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.8, 8), materials.oakWood);
                post.position.set(px, 1.45, pz);
                post.castShadow = true;
                wallPostsGroup.add(post);
            }
        };
        addWallPosts(-5.2, -5.1, 5.2, -5.1, 14); // 北墙
        addWallPosts(-5.2, 5.1, 5.2, 5.1, 14);   // 南墙
        addWallPosts(-5.2, -5.1, -5.2, 5.1, 14); // 西墙
        addWallPosts(5.2, -5.1, 5.2, 5.1, 14);  // 东墙
        scene.add(wallPostsGroup);
        registerPhysicsMesh(wallPostsGroup, 'part_bp_2_r2', 2, 2);

        // part_bp_2_r3: 密排柳条扎木骨架 (木柱之间编织的荆条柳条芯网)
        const wattleGroup = new THREE.Group();
        wattleGroup.name = 'part_bp_2_r3';
        const wattleMat = new THREE.MeshStandardMaterial({ color: 0x855835, roughness: 0.9 });
        for (let h = 0.5; h <= 2.4; h += 0.45) {
            const beamN = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.08, 0.08), wattleMat);
            beamN.position.set(0, h, -5.1);
            wattleGroup.add(beamN);
            const beamW = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 10.0), wattleMat);
            beamW.position.set(-5.2, h, 0);
            wattleGroup.add(beamW);
            const beamE = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 10.0), wattleMat);
            beamE.position.set(5.2, h, 0);
            wattleGroup.add(beamE);
        }
        scene.add(wattleGroup);
        registerPhysicsMesh(wattleGroup, 'part_bp_2_r3', 2, 3);

        // part_bp_2_r4: 泥草相间护壁厚抹 (木骨泥墙体，带泥草抹面与门窗洞口)
        const mudWallGroup = new THREE.Group();
        mudWallGroup.name = 'part_bp_2_r4';
        const wallMat = new THREE.MeshStandardMaterial({
            map: textures.rammedEarth.map,
            roughness: 0.9,
            metalness: 0.02
        });
        // 北实墙
        const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(10.4, 2.5, 0.35), wallMat);
        wallNorth.position.set(0, 1.35, -5.1);
        wallNorth.castShadow = true;
        wallNorth.receiveShadow = true;
        mudWallGroup.add(wallNorth);
        // 西墙
        const wallWest = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.5, 10.2), wallMat);
        wallWest.position.set(-5.2, 1.35, 0);
        wallWest.castShadow = true;
        wallWest.receiveShadow = true;
        mudWallGroup.add(wallWest);
        // 东墙
        const wallEast = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.5, 10.2), wallMat);
        wallEast.position.set(5.2, 1.35, 0);
        wallEast.castShadow = true;
        wallEast.receiveShadow = true;
        mudWallGroup.add(wallEast);
        // 南墙 (留出中央门洞 2.4m)
        const wallSouthL = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.5, 0.35), wallMat);
        wallSouthL.position.set(-3.2, 1.35, 5.1);
        mudWallGroup.add(wallSouthL);
        const wallSouthR = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.5, 0.35), wallMat);
        wallSouthR.position.set(3.2, 1.35, 5.1);
        mudWallGroup.add(wallSouthR);
        scene.add(mudWallGroup);
        registerPhysicsMesh(mudWallGroup, 'part_bp_2_r4', 2, 4);
    }

    // =========================================================================
    // 阶段 3: 架构梁架 (5 件构件契约)
    // =========================================================================
    if (stage >= 3) {
        // [Key] part_bp_3_k: 火烤硬化红烧土主板与主柱大梁榫卯合抱
        const masterBeamGroup = buildSculptedWattleDaubWall();
        masterBeamGroup.name = 'part_bp_3_k';
        // 梁端大卯鞘加固榫
        [-3.6, 3.6].forEach(bx => {
            const wedge = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 0.6), materials.oakWood);
            wedge.position.set(bx, 5.75, 2.4);
            masterBeamGroup.add(wedge);
        });
        scene.add(masterBeamGroup);
        registerPhysicsMesh(masterBeamGroup, 'part_bp_3_k', 3, 0, true);

        // part_bp_3_r1: 纵向脊木桁条连结 (13米长通长屋脊大木及上中下三道檩条)
        const purlinsGroup = new THREE.Group();
        purlinsGroup.name = 'part_bp_3_r1';
        // 中央正脊檩 (高 7.6m，长 13.0m)
        const ridgePole = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 13.2, 12), materials.oakWood);
        ridgePole.rotation.z = Math.PI / 2;
        ridgePole.position.set(0, 7.6, 0);
        ridgePole.castShadow = true;
        purlinsGroup.add(ridgePole);

        // 前后坡中间檩条 (上檩、中檩、檐檩)
        [-1.8, 1.8].forEach(pz => {
            const midPurlin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 12.8, 10), materials.oakWood);
            midPurlin.rotation.z = Math.PI / 2;
            midPurlin.position.set(0, 6.2, pz);
            midPurlin.castShadow = true;
            purlinsGroup.add(midPurlin);
        });
        [-3.6, 3.6].forEach(pz => {
            const lowPurlin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 12.6, 10), materials.oakWood);
            lowPurlin.rotation.z = Math.PI / 2;
            lowPurlin.position.set(0, 4.4, pz);
            lowPurlin.castShadow = true;
            purlinsGroup.add(lowPurlin);
        });
        scene.add(purlinsGroup);
        registerPhysicsMesh(purlinsGroup, 'part_bp_3_r1', 3, 1);

        // part_bp_3_r2: 顺水密排搭挂斜椽 (顺坡密排下挂的整齐椽木)
        const raftersGroup = new THREE.Group();
        raftersGroup.name = 'part_bp_3_r2';
        const rafterLen = 7.5;
        const rafterAngle = Math.atan2(7.6 - 2.5, 6.0); // 倾角
        for (let x = -6.2; x <= 6.2; x += 0.55) {
            // 南坡斜椽
            const rSouth = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, rafterLen, 6), materials.oakWood);
            rSouth.position.set(x, 5.0, 3.0);
            rSouth.rotation.x = rafterAngle;
            rSouth.castShadow = true;
            raftersGroup.add(rSouth);
            // 北坡斜椽
            const rNorth = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, rafterLen, 6), materials.oakWood);
            rNorth.position.set(x, 5.0, -3.0);
            rNorth.rotation.x = -rafterAngle;
            rNorth.castShadow = true;
            raftersGroup.add(rNorth);
        }
        scene.add(raftersGroup);
        registerPhysicsMesh(raftersGroup, 'part_bp_3_r2', 3, 2);

        // part_bp_3_r3: 细竹横向压条穿插 (横向绑扎固定椽条的竹竿压条)
        const battensGroup = new THREE.Group();
        battensGroup.name = 'part_bp_3_r3';
        const battenMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 });
        for (let step = 0; step < 7; step++) {
            const py = 3.2 + step * 0.65;
            const pzSouth = 5.5 - step * 0.78;
            const bS = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 12.8, 6), battenMat);
            bS.rotation.z = Math.PI / 2;
            bS.position.set(0, py, pzSouth);
            battensGroup.add(bS);

            const bN = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 12.8, 6), battenMat);
            bN.rotation.z = Math.PI / 2;
            bN.position.set(0, py, -pzSouth);
            battensGroup.add(bN);
        }
        scene.add(battensGroup);
        registerPhysicsMesh(battensGroup, 'part_bp_3_r3', 3, 3);

        // part_bp_3_r4: 芦苇编制屋顶席衬 (铺设在椽木上的整张苇席底层)
        const matSheathingGroup = new THREE.Group();
        matSheathingGroup.name = 'part_bp_3_r4';
        const sheathingMat = new THREE.MeshStandardMaterial({ color: 0x926e45, roughness: 0.88, side: THREE.DoubleSide });
        const sheathS = new THREE.Mesh(new THREE.PlaneGeometry(12.8, 7.2), sheathingMat);
        sheathS.position.set(0, 5.05, 3.0);
        sheathS.rotation.x = rafterAngle;
        matSheathingGroup.add(sheathS);

        const sheathN = new THREE.Mesh(new THREE.PlaneGeometry(12.8, 7.2), sheathingMat);
        sheathN.position.set(0, 5.05, -3.0);
        sheathN.rotation.x = -rafterAngle;
        matSheathingGroup.add(sheathN);
        scene.add(matSheathingGroup);
        registerPhysicsMesh(matSheathingGroup, 'part_bp_3_r4', 3, 4);
    }

    // =========================================================================
    // 阶段 4: 封顶聚落 (5 件构件契约 + 聚落生活场景与烟火动效)
    // =========================================================================
    if (stage >= 4) {
        // [Key] part_bp_4_k: 仰韶人面双鱼彩陶大盆 (安放于大屋正脊中央镇宅)
        const basinGroup = buildSculptedBanpoBasin();
        basinGroup.name = 'part_bp_4_k';
        basinGroup.position.set(0, 8.25, 0);
        scene.add(basinGroup);
        registerPhysicsMesh(basinGroup, 'part_bp_4_k', 4, 0, true);

        // part_bp_4_r1: 阶梯压实深挑茅草顶 (四层阶梯式厚质芦草屋面，深挑出檐2米)
        const thatchRoofGroup = new THREE.Group();
        thatchRoofGroup.name = 'part_bp_4_r1';
        // 南北两坡 4 层阶梯厚草与 3D 参差毛茸草丝垂须 (3D Thatch Fringes & Tier Strands)
        for (let tier = 0; tier < 4; tier++) {
            const ty = 3.6 + tier * 1.0;
            const tz = 5.2 - tier * 1.35;
            const tDepth = 2.4;

            // 南坡厚草板
            const tSouth = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.24, tDepth), materials.thatch);
            tSouth.position.set(0, ty, tz);
            tSouth.rotation.x = 0.65;
            tSouth.castShadow = true;
            tSouth.receiveShadow = true;
            thatchRoofGroup.add(tSouth);

            // 南坡 3D 参差垂落草丝草披 (Organic 3D Thatch Eave Fringe)
            const fringeGeoS = createThatchFringeGeometry(13.6, tier === 0 ? 0.65 : 0.42, 56);
            const fringeMeshS = new THREE.Mesh(fringeGeoS, materials.thatch);
            fringeMeshS.position.set(0, ty - 0.12, tz + tDepth * 0.42);
            fringeMeshS.rotation.x = 0.65;
            fringeMeshS.castShadow = true;
            thatchRoofGroup.add(fringeMeshS);

            // 北坡厚草板
            const tNorth = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.24, tDepth), materials.thatch);
            tNorth.position.set(0, ty, -tz);
            tNorth.rotation.x = -0.65;
            tNorth.castShadow = true;
            tNorth.receiveShadow = true;
            thatchRoofGroup.add(tNorth);

            // 北坡 3D 参差垂落草丝草披
            const fringeGeoN = createThatchFringeGeometry(13.6, tier === 0 ? 0.65 : 0.42, 56);
            const fringeMeshN = new THREE.Mesh(fringeGeoN, materials.thatch);
            fringeMeshN.position.set(0, ty - 0.12, -(tz + tDepth * 0.42));
            fringeMeshN.rotation.x = -0.65;
            fringeMeshN.castShadow = true;
            thatchRoofGroup.add(fringeMeshN);
        }

        // 屋脊粗大覆草卷 (Thick Thatch Ridge Roll)
        const ridgeThatchRoll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.38, 14.0, 16),
            materials.thatch
        );
        ridgeThatchRoll.rotation.z = Math.PI / 2;
        ridgeThatchRoll.position.set(0, 7.82, 0);
        ridgeThatchRoll.castShadow = true;
        thatchRoofGroup.add(ridgeThatchRoll);

        // 两端悬山草檐封山板与下垂草穗
        [-6.7, 6.7].forEach(bx => {
            const gableThatch = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 7.8), materials.thatch);
            gableThatch.position.set(bx, 5.0, 3.0);
            gableThatch.rotation.x = 0.65;
            gableThatch.castShadow = true;
            thatchRoofGroup.add(gableThatch);

            const gableFringeS = new THREE.Mesh(createThatchFringeGeometry(7.8, 0.38, 28), materials.thatch);
            gableFringeS.position.set(bx + (bx > 0 ? 0.2 : -0.2), 4.9, 3.0);
            gableFringeS.rotation.z = bx > 0 ? Math.PI / 2 : -Math.PI / 2;
            gableFringeS.rotation.y = 0.65;
            thatchRoofGroup.add(gableFringeS);

            const gableThatchN = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 7.8), materials.thatch);
            gableThatchN.position.set(bx, 5.0, -3.0);
            gableThatchN.rotation.x = -0.65;
            gableThatchN.castShadow = true;
            thatchRoofGroup.add(gableThatchN);

            const gableFringeN = new THREE.Mesh(createThatchFringeGeometry(7.8, 0.38, 28), materials.thatch);
            gableFringeN.position.set(bx + (bx > 0 ? 0.2 : -0.2), 4.9, -3.0);
            gableFringeN.rotation.z = bx > 0 ? Math.PI / 2 : -Math.PI / 2;
            gableFringeN.rotation.y = -0.65;
            thatchRoofGroup.add(gableFringeN);
        });

        // 仰韶大悬山山花排烟通气窗与叉手木 (Yangshao Gable Vent & Scissor Braces)
        [-6.72, 6.72].forEach(gx => {
            const gableVentGroup = new THREE.Group();
            gableVentGroup.position.set(gx, 6.6, 0);

            // 叉手木 (交叉成三角形的人字柁架)
            const scissorA = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8), materials.oakWood);
            scissorA.rotation.z = Math.PI / 2;
            scissorA.rotation.x = Math.PI / 4;
            scissorA.castShadow = true;
            gableVentGroup.add(scissorA);

            const scissorB = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8), materials.oakWood);
            scissorB.rotation.z = Math.PI / 2;
            scissorB.rotation.x = -Math.PI / 4;
            scissorB.castShadow = true;
            gableVentGroup.add(scissorB);

            // 通风排烟木格栅
            for (let vy = -0.5; vy <= 0.5; vy += 0.28) {
                const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 1.4 - Math.abs(vy) * 1.1), materials.oakWood);
                slat.position.y = vy;
                gableVentGroup.add(slat);
            }

            thatchRoofGroup.add(gableVentGroup);
        });

        scene.add(thatchRoofGroup);
        registerPhysicsMesh(thatchRoofGroup, 'part_bp_4_r1', 4, 1);

        // part_bp_4_r2: 7 组 X 形交叉防风压脊木 (Crossing Ridge Braces)
        const ridgeXGroup = new THREE.Group();
        ridgeXGroup.name = 'part_bp_4_r2';
        for (let i = 0; i < 7; i++) {
            const rx = -5.4 + i * 1.8;
            if (Math.abs(rx) < 0.8) continue; // 避开中央彩陶大盆
            const xGroup = new THREE.Group();
            const poleA = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), materials.oakWood);
            poleA.rotation.x = Math.PI / 4;
            poleA.castShadow = true;
            xGroup.add(poleA);
            const poleB = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), materials.oakWood);
            poleB.rotation.x = -Math.PI / 4;
            poleB.castShadow = true;
            xGroup.add(poleB);
            // 交叉处草绳绑扎结
            const ropeKnot = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.05, 6, 12), materials.thatch);
            xGroup.add(ropeKnot);
            xGroup.position.set(rx, 7.85, 0);
            ridgeXGroup.add(xGroup);
        }
        scene.add(ridgeXGroup);
        registerPhysicsMesh(ridgeXGroup, 'part_bp_4_r2', 4, 2);

        // part_bp_4_r3: 中央烧结永恒火塘与烤肉架 (Raised Hearth Pit with Charcoal & Meat Roast)
        const hearthGroup = buildSculptedHearthAndRack();
        hearthGroup.name = 'part_bp_4_r3';
        hearthGroup.position.set(0, 0, 0);
        scene.add(hearthGroup);
        registerPhysicsMesh(hearthGroup, 'part_bp_4_r3', 4, 3);

        // part_bp_4_r4: 仰韶鱼纹陶熏炉与防风门斗 (Projecting Porch with Amphora & Censer)
        const porchGroup = new THREE.Group();
        porchGroup.name = 'part_bp_4_r4';
        // 门斗外凸两根粗柱
        [-1.3, 1.3].forEach(px => {
            const pp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 2.8, 8), materials.oakWood);
            pp.position.set(px, 1.4, 6.7);
            pp.castShadow = true;
            porchGroup.add(pp);
        });
        // 门斗双坡人字草披
        const porchRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.2, 4), materials.thatch);
        porchRoof.rotation.y = Math.PI / 4;
        porchRoof.position.set(0, 3.2, 6.5);
        porchRoof.castShadow = true;
        porchGroup.add(porchRoof);
        // 门旁青石磨盘与磨棒 (Saddle Quern & Muller)
        const quern = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.45), materials.stone);
        quern.position.set(2.0, 0.18, 6.3);
        quern.castShadow = true;
        porchGroup.add(quern);
        const muller = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), materials.stone);
        muller.rotation.z = Math.PI / 2;
        muller.position.set(2.0, 0.28, 6.3);
        porchGroup.add(muller);
        // 经典仰韶双耳尖底水瓶
        const amphora = buildSculptedAmphora();
        amphora.position.set(-2.0, 0.15, 6.3);
        porchGroup.add(amphora);
        // 仰韶鱼纹镂空彩陶熏炉
        const censer = buildSculptedCenser();
        censer.position.set(2.0, 0.35, 5.5);
        porchGroup.add(censer);
        scene.add(porchGroup);
        registerPhysicsMesh(porchGroup, 'part_bp_4_r4', 4, 4);

        // =====================================================================
        // LITTLEST TOKYO 级生活化微缩场景与关键帧动效道具 (Diorama Life Props)
        // =====================================================================

        // 1. 双山花升腾翻滚的连环炊烟粒子系统 (Multi-segment Gable Chimney Smoke)
        const smokeGeo = new THREE.DodecahedronGeometry(0.35, 1);
        const smokeMat = new THREE.MeshStandardMaterial({
            color: 0xf3f4f6,
            roughness: 0.9,
            metalness: 0.0,
            transparent: true,
            opacity: 0.55
        });
        for (let i = 0; i < 18; i++) {
            const smokePuff = new THREE.Mesh(smokeGeo, smokeMat.clone());
            smokePuff.visible = false;
            // 记录独立动效参数
            smokePuff.userData = {
                id: i,
                isEastGable: i % 2 === 0,
                birthTime: (i / 18) * 3.5,
                progress: (i / 18),
                baseX: i % 2 === 0 ? 6.2 : -6.2,
                baseY: 6.8,
                baseZ: 0
            };
            scene.add(smokePuff);
            animatedElements.smokePuffs.push(smokePuff);
        }

        // 2. 氏族图腾木桩与风吹羽毛 (Swaying Bird Totem Pole)
        const totemGroup = new THREE.Group();
        const totemPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.2, 8), materials.oakWood);
        totemPole.position.y = 2.1;
        totemPole.castShadow = true;
        totemGroup.add(totemPole);
        // 桩头雕刻神鸟与彩羽
        const birdHead = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 6), materials.pottery);
        birdHead.rotation.x = Math.PI / 2;
        birdHead.position.set(0, 4.3, 0.2);
        totemGroup.add(birdHead);
        // 飘动羽毛吊坠
        for (let f = 0; f < 3; f++) {
            const feather = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.6, 0.02),
                new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8, side: THREE.DoubleSide })
            );
            feather.position.set((f - 1) * 0.2, 3.8, 0.25);
            totemGroup.add(feather);
            animatedElements.totemFeathers.push(feather);
        }
        totemGroup.position.set(-8.8, 0.2, 7.2);
        scene.add(totemGroup);

        // 3. 户外制陶作坊与慢轮制陶坑 (Pottery Firing Kiln Workshop with Potter's Wheel)
        const kilnWorkshop = buildSculptedKilnWorkshop();
        scene.add(kilnWorkshop);

        // 4. 晾晒鱼干与兽皮木架 (Meat & Pelt Curing Rack)
        const rackGroup = new THREE.Group();
        // A字架
        const ra1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), materials.oakWood);
        ra1.position.set(-1.0, 1.1, 0);
        rackGroup.add(ra1);
        const ra2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), materials.oakWood);
        ra2.position.set(1.0, 1.1, 0);
        rackGroup.add(ra2);
        const rbar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), materials.oakWood);
        rbar.rotation.z = Math.PI / 2;
        rbar.position.set(0, 1.9, 0);
        rackGroup.add(rbar);
        // 挂晾的红褐干鱼与鹿皮
        const peltMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), materials.pelt);
        peltMesh.position.set(0, 1.35, 0.02);
        rackGroup.add(peltMesh);
        animatedElements.windSwayables.push(peltMesh);
        rackGroup.position.set(-8.5, 0.2, -4.5);
        scene.add(rackGroup);

        // 5. 门侧趴卧的氏族忠犬 (Stylized Low-poly Sleeping Dog with Wagging Tail)
        const dogGroup = new THREE.Group();
        const dogBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.32, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.75 })
        );
        dogBody.position.y = 0.2;
        dogGroup.add(dogBody);
        const dogHead = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.28, 0.28),
            new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.75 })
        );
        dogHead.position.set(0.38, 0.32, 0);
        dogGroup.add(dogHead);
        // 摇动的小尾巴
        const dogTail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.05, 0.35, 6),
            new THREE.MeshStandardMaterial({ color: 0x9a3412 })
        );
        dogTail.position.set(-0.35, 0.3, 0);
        dogTail.rotation.z = Math.PI / 4;
        dogGroup.add(dogTail);
        animatedElements.dogTail = dogTail;
        // 狗食水碗
        const dogBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.12, 8), materials.pottery);
        dogBowl.position.set(0.6, 0.06, 0.2);
        dogGroup.add(dogBowl);
        dogGroup.position.set(3.8, 0.2, 5.8);
        dogGroup.rotation.y = -Math.PI / 3;
        scene.add(dogGroup);

        // 6. 整齐堆放的柴火木垛 (Firewood Stack)
        const woodpileGroup = new THREE.Group();
        for (let l = 0; l < 16; l++) {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.8, 6), materials.oakWood);
            log.rotation.x = Math.PI / 2;
            const row = Math.floor(l / 4);
            const col = l % 4;
            log.position.set(col * 0.2, row * 0.18 + 0.1, 0);
            woodpileGroup.add(log);
        }
        woodpileGroup.position.set(-5.6, 0.2, 3.2);
        woodpileGroup.rotation.y = Math.PI / 2;
        scene.add(woodpileGroup);
    }

    // =========================================================================
    // 关键帧/循环动力学更新函数 (由主渲染循环每帧调用，对标 Littlest Tokyo)
    // =========================================================================
    return {
        updateAnimations: (delta, elapsedTime) => {
            // 1. 太湖/环壕水流偏移
            if (animatedElements.waterMesh && textures.water) {
                textures.water.offset.x += delta * 0.03;
                textures.water.offset.y += delta * 0.015;
            }

            // 2. 双山花炊烟升腾飘散循环动效
            const puffs = animatedElements.smokePuffs;
            const cycleDuration = 3.6;
            for (let i = 0; i < puffs.length; i++) {
                const puff = puffs[i];
                const age = (elapsedTime + puff.userData.birthTime) % cycleDuration;
                const progress = age / cycleDuration; // 0.0 ~ 1.0

                puff.visible = true;
                // 向上升腾并在空中受向东的微风吹拂漂移
                const windOffset = progress * progress * 3.8;
                puff.position.x = puff.userData.baseX + (puff.userData.isEastGable ? windOffset : -windOffset * 0.3 + 1.2);
                puff.position.y = puff.userData.baseY + progress * 3.2;
                puff.position.z = puff.userData.baseZ + Math.sin(progress * 6 + i) * 0.4;

                // 尺寸逐渐膨胀扩散
                const s = 0.4 + progress * 1.8;
                puff.scale.set(s, s * 0.85, s);

                // 透明度渐隐淡出
                puff.material.opacity = Math.max(0, (1.0 - progress) * 0.65);
                puff.rotation.y += delta * 0.8;
            }

            // 3. 自然微风吹拂吊挂皮张与羽毛 (Harmonic Wind Oscillation)
            const wind = Math.sin(elapsedTime * 2.8) * 0.15 + Math.cos(elapsedTime * 5.2) * 0.08;
            animatedElements.windSwayables.forEach((item) => {
                item.rotation.x = wind;
            });
            animatedElements.totemFeathers.forEach((feather, idx) => {
                feather.rotation.z = Math.sin(elapsedTime * 3.5 + idx) * 0.25;
            });

            // 4. 忠犬摇尾巴
            if (animatedElements.dogTail) {
                animatedElements.dogTail.rotation.y = Math.sin(elapsedTime * 8) * 0.35;
            }

            // 5. 火塘与窑火真实跳动
            if (animatedElements.hearthLight) {
                animatedElements.hearthLight.intensity = 2.2 + Math.sin(elapsedTime * 12) * 0.5 + Math.cos(elapsedTime * 24) * 0.25;
            }
        }
    };
}
