import * as THREE from 'three';

/**
 * 🏛️ 三星堆 · 古蜀青铜神庙与通天神树 微缩立体建筑箱庭 (Architectural Diorama)
 * 对标 Littlest Tokyo (webgl_animation_keyframes) 级文博标杆：
 * 
 * 关键重器高精写实雕塑还原：
 * 1. 【青铜大立人像 (2.62m)】：
 *    - 象头兽首四足镂空神坛底座（4个卷鼻獠牙兽面角足、大拱形神坛门）；
 *    - 赤足立地、带青铜足镯；
 *    - 三重龙袍华服（云雷龙纹宽腰带、左右交叉斜领、燕尾式后下摆、双肩披帛）；
 *    - 一高一低、巨大的双环虚握手孔（雕琢拇指与四指弯曲成环）；
 *    - 花状高冠（兽面莲花层叠花瓣、高耸翎羽）与方颐大耳、斜竖大眼、双耳垂穿孔。
 * 2. 【一号青铜通天神树 (3.96m)】：
 *    - 三山拱形镂空神山底座（三足拱立、盘龙浮雕、镂空拱洞）；
 *    - 竹节状三层主树干（竹节环状凸棱、枝节接口）；
 *    - 三层九枝一仰一垂（S形舒展主枝、下垂铃铛花蕾果实托、上弯立枝）；
 *    - 九只金羽太阳神鸟（神乌引吭高歌、展翅尖喙、长尾羽翘立）；
 *    - 麻花辫绳状青铜飞龙（自天倒悬探首、马脸圆眼、张口露齿、刀状羽翅、前足伏地、后爪攀干）；
 *    - 树顶通天神花与双环翡翠/流金神光聚能环。
 * 3. 【青铜纵目千里眼巨型面具 (宽1.38米)】：
 *    - 阔口咧嘴上扬的神秘微笑、蒜头鹰钩鼻；
 *    - 凸出达16厘米的长圆柱形凸目瞳孔，中带箍圈，端部旋涡纹；
 *    - 倒八字舒展的巨大展翅顺风耳，上挑尖耳轮与耳垂穿孔；
 *    - 粗大上扬的立体剑眉与额中夔龙插槽。
 * 4. 【戴黄金面罩青铜人头坐像】：
 *    - 真实双层青铜圆雕人头基底 + 锤揲金箔面罩，精确眼眶与眉骨镂空！
 * 5. 【青铜太阳轮五辐圆盘】：
 *    - 突出半球阳核嵌金、五道等距 72° 放射宽辐条、重环外周圈。
 * 6. 【鱼鸟纹透雕黄金王权权杖】：
 *    - 纯金金箔包卷杖芯、两端双人冠面、鱼鸟相望与飞箭贯穿錾刻纹饰。
 * 7. 【其他小零件精细雕塑】：
 *    - 燎祭大铜鼎（立耳、三兽蹄足、饕餮雷纹腹）；
 *    - 象牙祭坑（双曲抛物线 3D 天然象牙真实层叠）；
 *    - 青铜戈玉璋仪仗、跪坐执璋神职小人、扭头跪坐神人等。
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

export function buildSanxingduiDiorama({
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
        sacredTree: null,
        solarBirds: [],
        treeDragon: null,
        solarWheel: null,
        treeAuraRings: [],
        fireSparks: [],
        windBanners: [],
        waterMesh: null,
        treeLight: jadeLight,
        altarLight: fireLight
    };

    // 辅助阴影开启
    const applyShadows = (mesh) => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    };

    // 基础 PBR 材质
    const materials = {
        rammedEarth: new THREE.MeshStandardMaterial({
            map: textures.rammedEarth ? textures.rammedEarth.map : null,
            bumpMap: textures.rammedEarth ? textures.rammedEarth.bumpMap : null,
            bumpScale: 0.14,
            roughness: 0.88,
            metalness: 0.04
        }),
        strataDeepRock: new THREE.MeshStandardMaterial({
            color: 0x221e1a,
            roughness: 0.95,
            metalness: 0.02
        }),
        strataRedClay: new THREE.MeshStandardMaterial({
            color: 0x5a2d18,
            roughness: 0.92,
            metalness: 0.03
        }),
        strataPaleoSoil: new THREE.MeshStandardMaterial({
            color: 0x855428,
            roughness: 0.9,
            metalness: 0.03
        }),
        nanmuWood: new THREE.MeshStandardMaterial({
            map: textures.nanmuWood ? textures.nanmuWood.map : null,
            roughness: 0.65,
            metalness: 0.08
        }),
        oakWood: new THREE.MeshStandardMaterial({
            map: textures.oakWood ? textures.oakWood.map : null,
            roughness: 0.72,
            metalness: 0.05
        }),
        thatch: new THREE.MeshStandardMaterial({
            map: textures.thatch ? textures.thatch.map : null,
            bumpMap: textures.thatch ? textures.thatch.bumpMap : null,
            bumpScale: 0.24,
            roughness: 0.82,
            metalness: 0.02,
            side: THREE.DoubleSide
        }),
        stonePaver: new THREE.MeshStandardMaterial({
            map: textures.stonePaver ? textures.stonePaver.map : null,
            bumpMap: textures.stonePaver ? textures.stonePaver.bumpMap : null,
            bumpScale: 0.08,
            roughness: 0.75,
            metalness: 0.05
        }),
        pottery: new THREE.MeshStandardMaterial({
            map: textures.pottery ? textures.pottery.map : null,
            color: 0x9a3412,
            roughness: 0.68,
            metalness: 0.08
        }),
        // 古蜀青铜 (鲜明孔雀石绿锈古铜，高金属感与适度粗糙度，捕捉展厅天光与高光倒影)
        bronze: new THREE.MeshStandardMaterial({
            map: textures.sxdBronze ? textures.sxdBronze.map : (textures.bronze ? textures.bronze.map : null),
            bumpMap: textures.sxdBronze ? textures.sxdBronze.bumpMap : (textures.bronze ? textures.bronze.bumpMap : null),
            bumpScale: 0.08,
            color: 0x529177,
            roughness: 0.32,
            metalness: 0.65
        }),
        // 青铜暗黑基底 (用于金面罩下衬与深色五官)
        bronzeDark: new THREE.MeshStandardMaterial({
            color: 0x1a3329,
            roughness: 0.42,
            metalness: 0.72
        }),
        // 锤揲金箔 (高反射灿烂纯金，微带暖光，调控自发光防止Bloom过曝)
        goldFoil: new THREE.MeshStandardMaterial({
            map: textures.goldFoil ? textures.goldFoil.map : null,
            bumpMap: textures.goldFoil ? textures.goldFoil.bumpMap : null,
            bumpScale: 0.04,
            color: 0xf59e0b,
            roughness: 0.28,
            metalness: 0.92
        }),
        // 古玉 (羊脂/青玉璋色)
        jadeZhang: new THREE.MeshStandardMaterial({
            map: textures.jadeCong ? textures.jadeCong.map : null,
            color: 0xa7f3d0,
            roughness: 0.28,
            metalness: 0.12
        }),
        // 天然象牙 (考古出土温润象牙黄/古骨色，彻底解决强光下Bloom纯白过曝)
        ivory: new THREE.MeshStandardMaterial({
            map: textures.ivory ? (textures.ivory.map || textures.ivory) : null,
            bumpMap: textures.ivory ? textures.ivory.bumpMap : null,
            bumpScale: 0.03,
            color: 0xccb28d,
            roughness: 0.52,
            metalness: 0.04
        }),
        // 燎祭炭火
        fireEmbers: new THREE.MeshStandardMaterial({
            color: 0xff3b00,
            emissive: new THREE.Color(0xff5500),
            emissiveIntensity: 2.2,
            roughness: 0.4
        }),
        // 鸭子河水体 (深沉古蜀翡翠流水)
        waterMat: new THREE.MeshStandardMaterial({
            color: 0x155e75,
            roughness: 0.2,
            metalness: 0.3,
            transparent: true,
            opacity: 0.85
        }),
        // 朱砂大漆
        vermilionLacquered: new THREE.MeshStandardMaterial({
            color: 0x991b1b,
            roughness: 0.32,
            metalness: 0.15
        })
    };

    // =========================================================================
    // 箱庭立体地台：考古地层切片 (Diorama Base)
    // 宽 32m，长 28m，厚度 3.2m
    // =========================================================================
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const baseW = 32.0;
    const baseL = 28.0;

    const strataLayers = [
        { h: 1.2, mat: materials.strataDeepRock, y: -2.4 },
        { h: 0.9, mat: materials.strataRedClay, y: -1.35 },
        { h: 0.8, mat: materials.strataPaleoSoil, y: -0.5 },
        { h: 0.6, mat: materials.rammedEarth, y: 0.2 }
    ];

    strataLayers.forEach((layer) => {
        const geo = new THREE.BoxGeometry(baseW, layer.h, baseL);
        const mesh = new THREE.Mesh(geo, layer.mat);
        mesh.position.set(0, layer.y, 0);
        applyShadows(mesh);
        baseGroup.add(mesh);
    });

    // 鸭子河流水系切角 (箱庭前缘横穿)
    const riverGeo = new THREE.BoxGeometry(baseW + 0.2, 0.25, 6.5);
    const riverMesh = new THREE.Mesh(riverGeo, materials.waterMat);
    riverMesh.position.set(0, 0.45, 12.8);
    baseGroup.add(riverMesh);
    animatedElements.waterMesh = riverMesh;

    // 箱庭边缘黑石倒角护框
    const borderGeo = new THREE.BoxGeometry(baseW + 0.5, 0.2, baseL + 0.5);
    const borderMesh = new THREE.Mesh(borderGeo, materials.strataDeepRock);
    borderMesh.position.y = -3.05;
    baseGroup.add(borderMesh);

    // 箱庭前庭与神树大立人柔和暖光 (照亮前庭立人像、一号神树与燎祭坛，避免局部阴影过暗)
    const courtyardWarmLight = new THREE.PointLight(0xfff7ed, 1.5, 30, 1.2);
    courtyardWarmLight.position.set(0, 8.5, 4.0);
    scene.add(courtyardWarmLight);

    // =========================================================================
    // 高级程序化几何雕塑发生器 (Procedural Sculpting Helpers)
    // =========================================================================

    // 1. 生成真实弯曲象牙 (Tapered curved elephant tusk)
    const createCurvedTusk = (length = 2.8, curveRad = 0.65, baseRadius = 0.16) => {
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(curveRad * 0.4, 0.35, length * 0.5),
            new THREE.Vector3(curveRad, 0.9, length)
        );
        // 使用挤出管道制作渐变锥形象牙
        const segments = 20;
        const frames = curve.computeFrenetFrames(segments, false);
        const geom = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        const radialSegments = 12;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const pt = curve.getPointAt(t);
            const radius = baseRadius * (1.0 - t * 0.88); // 底部到尖端渐细
            const normal = frames.normals[i];
            const binormal = frames.binormals[i];

            for (let j = 0; j <= radialSegments; j++) {
                const angle = (j / radialSegments) * Math.PI * 2;
                const sin = Math.sin(angle);
                const cos = -Math.cos(angle);
                const normalVec = new THREE.Vector3()
                    .addScaledVector(normal, cos)
                    .addScaledVector(binormal, sin)
                    .normalize();
                const pos = new THREE.Vector3().copy(pt).addScaledVector(normalVec, radius);

                positions.push(pos.x, pos.y, pos.z);
                normals.push(normalVec.x, normalVec.y, normalVec.z);
                uvs.push(j / radialSegments, t);
            }
        }

        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < radialSegments; j++) {
                const a = i * (radialSegments + 1) + j;
                const b = (i + 1) * (radialSegments + 1) + j;
                const c = (i + 1) * (radialSegments + 1) + (j + 1);
                const d = i * (radialSegments + 1) + (j + 1);
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geom.setIndex(indices);
        const mesh = new THREE.Mesh(geom, materials.ivory);
        applyShadows(mesh);
        return mesh;
    };

    // 2. 雕塑青铜大立人像 (2.62米通天神巫雕像)
    const buildSculptedStandingGiant = () => {
        const root = new THREE.Group();

        // 2.1 象头四足兽面镂空神坛底座 (Base)
        const baseGroup = new THREE.Group();
        // 上层圆形石坛
        const topPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.18, 24), materials.bronze);
        topPlinth.position.y = 1.1;
        applyShadows(topPlinth);
        baseGroup.add(topPlinth);

        // 中间方形四面镂空拱门坛身
        const tanBody = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.75, 1.3), materials.bronze);
        tanBody.position.y = 0.65;
        applyShadows(tanBody);
        baseGroup.add(tanBody);

        // 四角凸出的大象头/怪兽首雕塑足 (4 Elephant/Monster Head Feet)
        const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
        angles.forEach((ang) => {
            const legSub = new THREE.Group();
            legSub.position.set(Math.cos(ang) * 0.72, 0.5, Math.sin(ang) * 0.72);
            legSub.rotation.y = -ang - Math.PI / 2;

            // 兽头面颊
            const beastHead = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.35), materials.bronze);
            legSub.add(beastHead);

            // 凸出的巨大兽眼
            [-0.14, 0.14].forEach((ex) => {
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), materials.goldFoil);
                eye.position.set(ex, 0.08, 0.18);
                legSub.add(eye);
            });

            // 卷曲向下的长象鼻/獠牙支撑足
            const trunkCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, 0, 0.15),
                new THREE.Vector3(0, -0.3, 0.35),
                new THREE.Vector3(0, -0.5, 0.15)
            );
            const trunkMesh = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 8, 0.07, 8, false), materials.bronze);
            legSub.add(trunkMesh);

            baseGroup.add(legSub);
        });

        // 最下层平整方框基座
        const bottomRim = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.15, 1.7), materials.bronze);
        bottomRim.position.y = 0.08;
        applyShadows(bottomRim);
        baseGroup.add(bottomRim);

        root.add(baseGroup);

        // 2.2 赤足立地与青铜脚镯 (Bare Feet & Anklets)
        const feetGroup = new THREE.Group();
        feetGroup.position.set(0, 1.2, 0);

        [-0.18, 0.18].forEach((fx) => {
            // 脚镯 (Anklet)
            const anklet = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 16), materials.bronze);
            anklet.rotation.x = Math.PI / 2;
            anklet.position.set(fx, 0.08, 0);
            feetGroup.add(anklet);

            // 脚掌 (Foot with 5 toes)
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.32), materials.bronze);
            foot.position.set(fx, 0.04, 0.06);
            feetGroup.add(foot);
        });
        root.add(feetGroup);

        // 2.3 三重龙袍华服 (Ceremonial Robes)
        const robeGroup = new THREE.Group();
        robeGroup.position.set(0, 1.35, 0);

        // 内层长袍 (直筒下垂，微带收褶)
        const innerSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.52, 1.1, 16), materials.bronze);
        innerSkirt.position.y = 0.55;
        applyShadows(innerSkirt);
        robeGroup.add(innerSkirt);

        // 最外层半臂式龙袍长衣 (燕尾式后下摆 Swallowtail)
        const coatBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 1.2, 16), materials.bronze);
        coatBody.position.y = 1.35;
        applyShadows(coatBody);
        robeGroup.add(coatBody);

        // 燕尾式后下摆 (Swallowtail flaps extending backwards)
        [-0.15, 0.15].forEach((swX) => {
            const swallowtail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.06), materials.bronze);
            swallowtail.position.set(swX, 0.65, -0.42);
            swallowtail.rotation.x = 0.22;
            robeGroup.add(swallowtail);
        });

        // 雕琢龙纹宽腰带 (Belt with relief buckle)
        const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.16, 16), materials.goldFoil);
        belt.position.y = 1.15;
        robeGroup.add(belt);

        // 双肩龙纹披帛与左右交领 (Crossed Lapels)
        const lapelL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.08), materials.goldFoil);
        lapelL.position.set(-0.12, 1.7, 0.36);
        lapelL.rotation.z = -0.35;
        robeGroup.add(lapelL);

        const lapelR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.08), materials.goldFoil);
        lapelR.position.set(0.12, 1.7, 0.36);
        lapelR.rotation.z = 0.35;
        robeGroup.add(lapelR);

        root.add(robeGroup);

        // 2.4 一高一低、巨大的双环虚握手孔 (Massive Hollow Grasping Hands)
        const armsGroup = new THREE.Group();
        armsGroup.position.set(0, 1.35 + 1.6, 0);

        // 右臂抬高（右手居高）
        const armRightCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.42, 0.25, 0.0),
            new THREE.Vector3(0.62, 0.38, 0.28),
            new THREE.Vector3(0.38, 0.58, 0.48),
            new THREE.Vector3(0.18, 0.62, 0.52)
        ]);
        const armRightMesh = new THREE.Mesh(new THREE.TubeGeometry(armRightCurve, 12, 0.09, 8, false), materials.bronze);
        applyShadows(armRightMesh);
        armsGroup.add(armRightMesh);

        // 右手巨大的环形握孔 (Right Hand Socket - 高位)
        const handRightGroup = new THREE.Group();
        handRightGroup.position.set(0.15, 0.62, 0.52);
        handRightGroup.rotation.y = -0.2;
        handRightGroup.rotation.z = 0.15;

        // 手掌与四指弯曲成圆筒环 (Fingers Clasping Ring)
        const rightRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.05, 8, 20, Math.PI * 1.8), materials.bronze);
        handRightGroup.add(rightRing);
        // 翘起的大拇指 (Thumb)
        const thumbRight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 8), materials.bronze);
        thumbRight.position.set(0.12, 0.06, 0.06);
        thumbRight.rotation.z = -0.6;
        handRightGroup.add(thumbRight);
        armsGroup.add(handRightGroup);

        // 左臂稍低（左手居低）
        const armLeftCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.42, 0.22, 0.0),
            new THREE.Vector3(-0.58, 0.12, 0.26),
            new THREE.Vector3(-0.35, 0.18, 0.48),
            new THREE.Vector3(-0.15, 0.22, 0.52)
        ]);
        const armLeftMesh = new THREE.Mesh(new THREE.TubeGeometry(armLeftCurve, 12, 0.09, 8, false), materials.bronze);
        applyShadows(armLeftMesh);
        armsGroup.add(armLeftMesh);

        // 左手巨大的环形握孔 (Left Hand Socket - 低位)
        const handLeftGroup = new THREE.Group();
        handLeftGroup.position.set(-0.12, 0.22, 0.52);
        handLeftGroup.rotation.y = 0.2;
        handLeftGroup.rotation.z = -0.15;

        const leftRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.05, 8, 20, Math.PI * 1.8), materials.bronze);
        handLeftGroup.add(leftRing);
        const thumbLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 8), materials.bronze);
        thumbLeft.position.set(-0.12, 0.06, 0.06);
        thumbLeft.rotation.z = 0.6;
        handLeftGroup.add(thumbLeft);
        armsGroup.add(handLeftGroup);

        root.add(armsGroup);

        // 2.5 头部、神秘神面与盛开莲花高冠 (Head, Face & High Lotus Crown)
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.35 + 2.15, 0);

        // 粗长修长的颈部
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.35, 12), materials.bronze);
        headGroup.add(neck);

        // 方颐深目神面 (Angular Head Sculpt)
        const headCore = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.36), materials.bronze);
        headCore.position.y = 0.35;
        applyShadows(headCore);
        headGroup.add(headCore);

        // 斜竖大眼 (Almond-shaped Eyes with hollow pupils)
        [-0.12, 0.12].forEach((eyX) => {
            const eyeFrame = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.065, 0.06), materials.bronze);
            eyeFrame.position.set(eyX, 0.38, 0.19);
            eyeFrame.rotation.z = eyX > 0 ? 0.25 : -0.25;
            headGroup.add(eyeFrame);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), materials.goldFoil);
            pupil.position.set(eyX, 0.38, 0.21);
            headGroup.add(pupil);
        });

        // 挺直的蒜头大鼻
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.12), materials.bronze);
        nose.position.set(0, 0.34, 0.22);
        headGroup.add(nose);

        // 闭合的薄阔嘴
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.06), materials.bronze);
        mouth.position.set(0, 0.2, 0.19);
        headGroup.add(mouth);

        // 两侧大扇耳与双耳垂穿孔 (Pierced Ears)
        [-0.24, 0.24].forEach((erX) => {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.16), materials.bronze);
            ear.position.set(erX, 0.36, -0.02);
            ear.rotation.y = erX > 0 ? 0.3 : -0.3;
            headGroup.add(ear);

            // 耳垂穿孔双环
            const earRing = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.015, 6, 12), materials.goldFoil);
            earRing.position.set(erX * 1.05, 0.22, -0.02);
            headGroup.add(earRing);
        });

        // 莲花花状高冠 (High Lotus Petal & Feather Crown)
        const crownGroup = new THREE.Group();
        crownGroup.position.set(0, 0.58, 0);

        // 底层花冠箍带
        const crownBand = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.14, 16), materials.goldFoil);
        crownGroup.add(crownBand);

        // 盛开外翻的兽面莲花花瓣 (Blooming Petals)
        for (let p = 0; p < 6; p++) {
            const pAngle = (p * Math.PI * 2) / 6;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 6), materials.goldFoil);
            petal.position.set(Math.cos(pAngle) * 0.26, 0.22, Math.sin(pAngle) * 0.26);
            petal.rotation.z = -Math.cos(pAngle) * 0.35;
            petal.rotation.x = Math.sin(pAngle) * 0.35;
            crownGroup.add(petal);
        }

        // 顶层高耸的翎羽尖冠 (Soaring Feather Spire)
        const crestSpire = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.65, 8), materials.goldFoil);
        crestSpire.position.y = 0.42;
        crownGroup.add(crestSpire);

        headGroup.add(crownGroup);
        root.add(headGroup);

        root.scale.set(1.15, 1.15, 1.15);
        return root;
    };

    // 3. 雕塑一号青铜通天神树 (3.96米九枝神鸟青铜飞龙)
    const buildSculptedSacredTree = () => {
        const root = new THREE.Group();

        // 3.1 三山拱形镂空神山底座 (Three-arched Mountain Base)
        const baseGroup = new THREE.Group();
        for (let m = 0; m < 3; m++) {
            const mAngle = (m * Math.PI * 2) / 3;
            // 拱形伏兽山腿
            const legPath = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, 1.1, 0),
                new THREE.Vector3(Math.cos(mAngle) * 1.2, 0.7, Math.sin(mAngle) * 1.2),
                new THREE.Vector3(Math.cos(mAngle) * 1.8, 0.1, Math.sin(mAngle) * 1.8)
            );
            const legMesh = new THREE.Mesh(new THREE.TubeGeometry(legPath, 12, 0.22, 8, false), materials.bronze);
            applyShadows(legMesh);
            baseGroup.add(legMesh);

            // 山腿端部的爬伏兽爪
            const paw = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.55), materials.bronze);
            paw.position.set(Math.cos(mAngle) * 1.85, 0.09, Math.sin(mAngle) * 1.85);
            paw.rotation.y = -mAngle - Math.PI / 2;
            baseGroup.add(paw);
        }

        // 底座中央承树圆盘
        const collarDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.25, 16), materials.bronze);
        collarDisk.position.y = 1.15;
        applyShadows(collarDisk);
        baseGroup.add(collarDisk);

        root.add(baseGroup);

        // 3.2 竹节状多层挺拔主树干 (Segmented Trunk with Node Collars)
        const trunkGroup = new THREE.Group();
        trunkGroup.position.set(0, 1.25, 0);

        // 三层渐细树干
        const tierHeights = [2.0, 1.8, 1.6];
        let curY = 0;
        for (let t = 0; t < 3; t++) {
            const h = tierHeights[t];
            const rBottom = 0.38 - t * 0.06;
            const rTop = 0.32 - t * 0.06;
            const seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, 16), materials.bronze);
            seg.position.y = curY + h / 2;
            applyShadows(seg);
            trunkGroup.add(seg);

            // 竹节凸棱环 (Node Collar)
            const collar = new THREE.Mesh(new THREE.TorusGeometry(rBottom + 0.05, 0.045, 8, 20), materials.bronze);
            collar.rotation.x = Math.PI / 2;
            collar.position.y = curY;
            trunkGroup.add(collar);

            curY += h;
        }

        // 树顶尖端的通天神花果实 (Apex Blossom)
        const apexBlossom = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.75, 8), materials.goldFoil);
        apexBlossom.position.y = curY + 0.35;
        trunkGroup.add(apexBlossom);

        root.add(trunkGroup);

        // 3.3 三层九枝一仰一垂与悬垂花蕾果托 (3 Tiers of 9 Branches)
        const branchesGroup = new THREE.Group();
        branchesGroup.position.set(0, 1.25, 0);

        const tierBranchY = [1.6, 3.3, 4.8];
        for (let t = 0; t < 3; t++) {
            const bY = tierBranchY[t];
            const branchLen = 2.4 - t * 0.25;

            for (let b = 0; b < 3; b++) {
                const bAngle = (b * Math.PI * 2) / 3 + t * 0.45; // 每层错开旋转角度

                // 主弧形拱枝 (S-curve Main Branch arching outward and downward)
                const branchCurve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(0, bY, 0),
                    new THREE.Vector3(Math.cos(bAngle) * (branchLen * 0.65), bY + 0.65, Math.sin(bAngle) * (branchLen * 0.65)),
                    new THREE.Vector3(Math.cos(bAngle) * branchLen, bY - 0.35, Math.sin(bAngle) * branchLen)
                );
                const bMesh = new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 16, 0.09, 8, false), materials.bronze);
                applyShadows(bMesh);
                branchesGroup.add(bMesh);

                // 枝端倒垂的花蕾与果实托 (Drooping Blossom & Bell-Fruit)
                const tipX = Math.cos(bAngle) * branchLen;
                const tipZ = Math.sin(bAngle) * branchLen;

                const flowerBudCurve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(tipX, bY - 0.35, tipZ),
                    new THREE.Vector3(tipX, bY - 0.75, tipZ),
                    new THREE.Vector3(tipX, bY - 1.05, tipZ)
                );
                const budStem = new THREE.Mesh(new THREE.TubeGeometry(flowerBudCurve, 6, 0.04, 6, false), materials.bronze);
                branchesGroup.add(budStem);

                // 悬垂的八角果托与金色神果
                const fruitPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.08, 0.22, 8), materials.bronze);
                fruitPedestal.position.set(tipX, bY - 0.95, tipZ);
                branchesGroup.add(fruitPedestal);

                const goldenFruit = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15), materials.goldFoil);
                goldenFruit.position.set(tipX, bY - 1.15, tipZ);
                branchesGroup.add(goldenFruit);

                // 枝头向上弯曲的神鸟立枝 (Upward Perch for Sunbird)
                const perchCurve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(tipX * 0.75, bY + 0.15, tipZ * 0.75),
                    new THREE.Vector3(tipX * 0.85, bY + 0.55, tipZ * 0.85),
                    new THREE.Vector3(tipX * 0.82, bY + 0.85, tipZ * 0.82)
                );
                const perchMesh = new THREE.Mesh(new THREE.TubeGeometry(perchCurve, 8, 0.055, 6, false), materials.bronze);
                branchesGroup.add(perchMesh);
            }
        }
        root.add(branchesGroup);

        root.scale.set(1.22, 1.22, 1.22);
        return root;
    };

    // 4. 雕塑九只昂首引吭金羽太阳神鸟 (Sculpted Golden Sunbirds)
    const buildSculptedSunbird = () => {
        const bird = new THREE.Group();

        // 丰满挺立的鸟身与胸脯 (Plump Breast)
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), materials.goldFoil);
        body.scale.set(1.0, 1.35, 1.65);
        applyShadows(body);
        bird.add(body);

        // 昂首冲天的长颈 (Long Arched Neck)
        const neckCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0.08, 0.14),
            new THREE.Vector3(0, 0.28, 0.22),
            new THREE.Vector3(0, 0.42, 0.18)
        );
        const neck = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 8, 0.05, 8, false), materials.goldFoil);
        bird.add(neck);

        // 鸟头、锐利尖喙与凤冠头羽 (Head, Pointed Beak & Crest)
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), materials.goldFoil);
        head.position.set(0, 0.44, 0.18);
        bird.add(head);

        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 6), materials.goldFoil);
        beak.position.set(0, 0.46, 0.32);
        beak.rotation.x = Math.PI / 2.2;
        bird.add(beak);

        // 凤冠羽毛 (Crest Plumes)
        const crest = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 6), materials.goldFoil);
        crest.position.set(0, 0.58, 0.12);
        crest.rotation.x = -0.4;
        bird.add(crest);

        // 左右展羽翅膀 (Spread Wings)
        [-0.14, 0.14].forEach((wx) => {
            const wing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.38), materials.goldFoil);
            wing.position.set(wx, 0.08, -0.05);
            wing.rotation.y = wx > 0 ? 0.35 : -0.35;
            wing.rotation.z = wx > 0 ? -0.25 : 0.25;
            bird.add(wing);
        });

        // 高翘的三叉长尾羽 (Upturned Tail Plumage)
        const tailCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, -0.2),
            new THREE.Vector3(0, 0.25, -0.45),
            new THREE.Vector3(0, 0.55, -0.52)
        );
        const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 8, 0.045, 6, false), materials.goldFoil);
        bird.add(tail);

        return bird;
    };

    // 5. 雕塑麻花辫绳状青铜飞龙 (Sculpted Diving Dragon)
    const buildSculptedDragon = () => {
        const dragonRoot = new THREE.Group();

        // 盘旋下潜的蛇形麻花龙身 (Twisted Serpentine Dragon Body)
        const dragonSpine = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.15, 6.2, 0.15),
            new THREE.Vector3(0.55, 5.0, -0.35),
            new THREE.Vector3(-0.45, 3.8, -0.45),
            new THREE.Vector3(0.65, 2.6, 0.45),
            new THREE.Vector3(1.35, 1.4, 0.75)
        ]);
        const dragonBodyMesh = new THREE.Mesh(new THREE.TubeGeometry(dragonSpine, 32, 0.14, 10, false), materials.bronze);
        applyShadows(dragonBodyMesh);
        dragonRoot.add(dragonBodyMesh);

        // 沿龙身两侧排列的刀状羽翅 (Blade-shaped Dragon Wings)
        for (let w = 1; w <= 4; w++) {
            const t = w / 5;
            const pt = dragonSpine.getPointAt(t);
            [-0.22, 0.22].forEach((wx) => {
                const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.18), materials.bronze);
                wingBlade.position.set(pt.x + wx, pt.y, pt.z);
                wingBlade.rotation.z = Math.PI / 4;
                dragonRoot.add(wingBlade);
            });
        }

        // 倒悬回首龙首 (Inverted Dragon Head)
        const headGroup = new THREE.Group();
        headGroup.position.set(1.35, 1.4, 0.75);
        headGroup.rotation.set(0.4, -0.6, 0.2);

        // 马脸状龙吻与张口长颚
        const snoutUpper = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.55), materials.bronze);
        snoutUpper.position.z = 0.25;
        headGroup.add(snoutUpper);

        const jawLower = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.45), materials.bronze);
        jawLower.position.set(0, -0.16, 0.22);
        jawLower.rotation.x = 0.35; // 张口露齿
        headGroup.add(jawLower);

        // 圆凸大眼与金眼珠
        [-0.15, 0.15].forEach((ex) => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), materials.goldFoil);
            eye.position.set(ex, 0.12, 0.15);
            headGroup.add(eye);
        });

        // 刀状后掠龙角/鹿角 (Backward Dragon Antlers)
        [-0.12, 0.12].forEach((ax) => {
            const antlerCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(ax, 0.15, -0.1),
                new THREE.Vector3(ax * 1.5, 0.45, -0.35),
                new THREE.Vector3(ax * 1.8, 0.75, -0.55)
            );
            const antler = new THREE.Mesh(new THREE.TubeGeometry(antlerCurve, 8, 0.045, 6, false), materials.bronze);
            headGroup.add(antler);
        });

        dragonRoot.add(headGroup);

        // 攀附树干的类似人手后爪 (Hand-like Claws)
        const claw1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.14, 0.35), materials.bronze);
        claw1.position.set(0.25, 3.2, 0.25);
        dragonRoot.add(claw1);

        // 前足爬伏于底座
        const claw2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.45), materials.bronze);
        claw2.position.set(1.45, 0.2, 0.85);
        dragonRoot.add(claw2);

        return dragonRoot;
    };

    // 6. 雕塑青铜纵目面具 (1.38米宽长柱圆瞳顺风耳)
    const buildSculptedProtrudingMask = () => {
        const mask = new THREE.Group();

        // 6.1 阔面深颧颊骨神面基底 (Contoured Face)
        const faceShape = new THREE.Shape();
        faceShape.moveTo(-0.95, 0.35);
        faceShape.lineTo(-0.75, -0.35);
        faceShape.lineTo(0.0, -0.55); // 尖下巴
        faceShape.lineTo(0.75, -0.35);
        faceShape.lineTo(0.95, 0.35);
        faceShape.lineTo(0.0, 0.42); // 额头中弧
        faceShape.closePath();

        const extrudeSettings = { depth: 0.18, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.06, bevelThickness: 0.06 };
        const faceGeo = new THREE.ExtrudeGeometry(faceShape, extrudeSettings);
        const faceMesh = new THREE.Mesh(faceGeo, materials.bronze);
        faceMesh.position.set(0, 0, -0.09);
        applyShadows(faceMesh);
        mask.add(faceMesh);

        // 6.2 阔口裂嘴神秘微笑 (Wide Smiling Mouth)
        const mouthShape = new THREE.Shape();
        mouthShape.moveTo(-0.55, 0.05);
        mouthShape.quadraticCurveTo(0, -0.12, 0.55, 0.05);
        mouthShape.quadraticCurveTo(0, -0.04, -0.55, 0.05);
        const mouthGeo = new THREE.ExtrudeGeometry(mouthShape, { depth: 0.08, bevelEnabled: false });
        const mouthMesh = new THREE.Mesh(mouthGeo, materials.bronzeDark);
        mouthMesh.position.set(0, -0.22, 0.11);
        mask.add(mouthMesh);

        // 6.3 鹰钩蒜头大鼻
        const noseGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.55, 8);
        const noseMesh = new THREE.Mesh(noseGeo, materials.bronze);
        noseMesh.position.set(0, 0.08, 0.22);
        noseMesh.rotation.x = -0.3;
        mask.add(noseMesh);

        // 6.4 长圆柱形纵目凸眼 (Protruding Ocular Stalks - 凸出达16cm)
        [-0.52, 0.52].forEach((eyeX) => {
            const stalkGroup = new THREE.Group();
            stalkGroup.position.set(eyeX, 0.12, 0.12);
            stalkGroup.rotation.y = eyeX > 0 ? 0.08 : -0.08;

            // 根部菱形眼眶座
            const socket = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.12), materials.bronze);
            stalkGroup.add(socket);

            // 凸出的粗大圆柱形眼柱 (Cylindrical Stalk)
            const stalkGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.65, 16);
            stalkGeo.rotateX(Math.PI / 2);
            const stalk = new THREE.Mesh(stalkGeo, materials.bronze);
            stalk.position.z = 0.32;
            applyShadows(stalk);
            stalkGroup.add(stalk);

            // 中间加强凸棱箍圈 (Reinforced Ring)
            const midRing = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.035, 8, 16), materials.goldFoil);
            midRing.position.z = 0.32;
            stalkGroup.add(midRing);

            // 端部旋涡状瞳孔尖端 (Spiral Tip)
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.16, 16), materials.goldFoil);
            tip.position.z = 0.68;
            tip.rotation.x = Math.PI / 2;
            stalkGroup.add(tip);

            mask.add(stalkGroup);
        });

        // 6.5 倒八字上挑立体剑眉 (Inverted Crescent Eyebrows)
        [-0.52, 0.52].forEach((eyX) => {
            const browCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(eyX * 0.3, 0.28, 0.16),
                new THREE.Vector3(eyX * 0.8, 0.48, 0.18),
                new THREE.Vector3(eyX * 1.15, 0.58, 0.14)
            );
            const brow = new THREE.Mesh(new THREE.TubeGeometry(browCurve, 10, 0.06, 6, false), materials.bronze);
            mask.add(brow);
        });

        // 6.6 倒八字舒展顺风飞翼巨耳 (Winged Ears - 达到1.38米总跨度)
        [-1.0, 1.0].forEach((erX) => {
            const earGroup = new THREE.Group();
            earGroup.position.set(erX * 0.95, 0.15, 0);
            earGroup.rotation.y = erX > 0 ? 0.35 : -0.35;
            earGroup.rotation.z = erX > 0 ? 0.45 : -0.45;

            // 大展翅耳廓 (Fan-shaped Winged Ear)
            const earShape = new THREE.Shape();
            earShape.moveTo(0, 0);
            earShape.quadraticCurveTo(erX * 0.45, 0.65, erX * 0.85, 1.05); // 桃尖状耳尖
            earShape.quadraticCurveTo(erX * 0.65, 0.45, erX * 0.55, -0.15);
            earShape.quadraticCurveTo(erX * 0.25, -0.35, 0, -0.25);
            earShape.closePath();

            const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
            const earMesh = new THREE.Mesh(earGeo, materials.bronze);
            earGroup.add(earMesh);

            // 耳垂穿孔 (Pierced Earlobe Hole)
            const earHole = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 6, 12), materials.goldFoil);
            earHole.position.set(erX * 0.2, -0.22, 0.04);
            earGroup.add(earHole);

            mask.add(earGroup);
        });

        // 6.7 额头中央夔龙插槽 (Forehead Crest Socket)
        const foreheadSocket = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.12), materials.goldFoil);
        foreheadSocket.position.set(0, 0.55, 0.08);
        mask.add(foreheadSocket);

        mask.scale.set(1.1, 1.1, 1.1);
        return mask;
    };

    // 7. 雕塑戴黄金面罩青铜人头像 (Bronze Head with Hammered Gold Mask)
    const buildSculptedGoldMaskHead = () => {
        const headRoot = new THREE.Group();

        // 汉白玉/青石基座
        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.35, 16), materials.stonePaver);
        applyShadows(plinth);
        headRoot.add(plinth);

        // 青铜长颈
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.55, 16), materials.bronze);
        neck.position.y = 0.45;
        applyShadows(neck);
        headRoot.add(neck);

        // 青铜人头母体 (Bronze Head Core)
        const headGeo = new THREE.CylinderGeometry(0.35, 0.32, 0.72, 16);
        const headCore = new THREE.Mesh(headGeo, materials.bronze);
        headCore.position.y = 1.05;
        applyShadows(headCore);
        headRoot.add(headCore);

        // 后脑发髻与发簪 (Hair Braided with Hairpin)
        const bun = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 8), materials.bronze);
        bun.position.set(0, 1.05, -0.36);
        bun.rotation.x = Math.PI / 4;
        headRoot.add(bun);

        const hairpin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8), materials.goldFoil);
        hairpin.position.set(0, 1.05, -0.36);
        hairpin.rotation.z = Math.PI / 2;
        headRoot.add(hairpin);

        // 青铜深邃眼睛与剑眉（衬在金面罩孔洞之内）
        [-0.14, 0.14].forEach((ex) => {
            const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), materials.bronzeDark);
            eyeBall.position.set(ex, 1.12, 0.32);
            headRoot.add(eyeBall);

            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), materials.bronzeDark);
            brow.position.set(ex, 1.22, 0.32);
            brow.rotation.z = ex > 0 ? 0.2 : -0.2;
            headRoot.add(brow);
        });

        // 真实覆盖的前脸锤揲金面罩 (Hammered Gold Foil Mask with Eye Cutouts)
        const maskShape = new THREE.Shape();
        maskShape.moveTo(-0.34, 0.32);
        maskShape.lineTo(-0.28, -0.32);
        maskShape.lineTo(0.0, -0.42);
        maskShape.lineTo(0.28, -0.32);
        maskShape.lineTo(0.34, 0.32);
        maskShape.lineTo(0.0, 0.38);
        maskShape.closePath();

        // 镂空左右眼孔洞 (Cutouts for Eyes)
        const eyeHoleL = new THREE.Path();
        eyeHoleL.moveTo(-0.21, 0.07);
        eyeHoleL.lineTo(-0.07, 0.12);
        eyeHoleL.lineTo(-0.07, 0.02);
        eyeHoleL.closePath();
        maskShape.holes.push(eyeHoleL);

        const eyeHoleR = new THREE.Path();
        eyeHoleR.moveTo(0.07, 0.12);
        eyeHoleR.lineTo(0.21, 0.07);
        eyeHoleR.lineTo(0.07, 0.02);
        eyeHoleR.closePath();
        maskShape.holes.push(eyeHoleR);

        const maskGeo = new THREE.ExtrudeGeometry(maskShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
        const maskMesh = new THREE.Mesh(maskGeo, materials.goldFoil);
        maskMesh.position.set(0, 1.05, 0.28);
        headRoot.add(maskMesh);

        // 金面罩挺立鼻梁与嘴唇
        const goldNose = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.12), materials.goldFoil);
        goldNose.position.set(0, 1.08, 0.38);
        headRoot.add(goldNose);

        const goldMouth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), materials.goldFoil);
        goldMouth.position.set(0, 0.92, 0.34);
        headRoot.add(goldMouth);

        // 两侧大招风耳
        [-0.36, 0.36].forEach((erX) => {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.18), materials.bronze);
            ear.position.set(erX, 1.08, 0.0);
            ear.rotation.y = erX > 0 ? 0.35 : -0.35;
            headRoot.add(ear);
        });

        headRoot.scale.set(1.25, 1.25, 1.25);
        return headRoot;
    };

    // 8. 雕塑青铜太阳轮五辐圆盘 (Bronze Sun Wheel)
    const buildSculptedSunWheel = () => {
        const wheel = new THREE.Group();

        // 外周重环 (Broad outer rim)
        const outerRim = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.12, 16, 48), materials.bronze);
        applyShadows(outerRim);
        wheel.add(outerRim);

        // 中央半球凸起阳核 (Central Sun Hub)
        const sunHub = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), materials.goldFoil);
        sunHub.scale.set(1.0, 1.0, 0.55);
        applyShadows(sunHub);
        wheel.add(sunHub);

        // 阳核外周环
        const hubRim = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.05, 8, 24), materials.bronze);
        wheel.add(hubRim);

        // 五道等距 72° 放射宽辐条 (5 Spokes)
        const spokeGeo = new THREE.BoxGeometry(0.16, 0.85, 0.09);
        for (let s = 0; s < 5; s++) {
            const angle = (s * Math.PI * 2) / 5;
            const spoke = new THREE.Mesh(spokeGeo, materials.bronze);
            spoke.position.set(Math.sin(angle) * 0.78, Math.cos(angle) * 0.78, 0);
            spoke.rotation.z = -angle;
            applyShadows(spoke);
            wheel.add(spoke);
        }

        wheel.scale.set(1.3, 1.3, 1.3);
        return wheel;
    };

    // 9. 雕塑鱼鸟箭纹纯金王权权杖 (Gold Scepter)
    const buildSculptedGoldScepter = () => {
        const scepter = new THREE.Group();

        // 杖身 (1.42米长木芯包金圆杖)
        const rodGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.8, 16);
        const rod = new THREE.Mesh(rodGeo, materials.goldFoil);
        applyShadows(rod);
        scepter.add(rod);

        // 杖端双人面与神鸟冠帽 (Top Finial)
        const finialGroup = new THREE.Group();
        finialGroup.position.set(0, 1.4, 0);

        [-0.06, 0.06].forEach((fx) => {
            const crownFace = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), materials.goldFoil);
            crownFace.position.set(fx, 0.08, 0);
            finialGroup.add(crownFace);
        });

        // 镂空展翅神鸟
        const birdTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 8), materials.goldFoil);
        birdTip.position.y = 0.28;
        finialGroup.add(birdTip);

        scepter.add(finialGroup);

        // 杖身鱼鸟飞箭纹饰凸环 (Relief Motifs Collars)
        [-0.6, -0.2, 0.2, 0.6, 1.0].forEach((ry) => {
            const collar = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 6, 16), materials.goldFoil);
            collar.rotation.x = Math.PI / 2;
            collar.position.y = ry;
            scepter.add(collar);
        });

        return scepter;
    };

    // 10. 雕塑祭祀大铜鼎 (Bronze Cauldron with cabriole legs)
    const buildSculptedCauldron = () => {
        const cauldron = new THREE.Group();

        // 鼎身圆腹
        const bodyGeo = new THREE.SphereGeometry(1.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.75);
        const body = new THREE.Mesh(bodyGeo, materials.bronze);
        body.position.y = 1.35;
        applyShadows(body);
        cauldron.add(body);

        // 鼎口折沿
        const rim = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.08, 8, 24), materials.bronze);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 1.85;
        cauldron.add(rim);

        // 双立耳 (Two Upright Loop Handles)
        [-1.0, 1.0].forEach((hx) => {
            const handle = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.07, 8, 16, Math.PI), materials.bronze);
            handle.position.set(hx, 2.05, 0);
            handle.rotation.z = hx > 0 ? 0 : Math.PI;
            cauldron.add(handle);
        });

        // 三兽蹄壮足 (Three Cabriole Legs)
        for (let l = 0; l < 3; l++) {
            const lAngle = (l * Math.PI * 2) / 3;
            const legCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(Math.sin(lAngle) * 0.85, 1.15, Math.cos(lAngle) * 0.85),
                new THREE.Vector3(Math.sin(lAngle) * 1.05, 0.65, Math.cos(lAngle) * 1.05),
                new THREE.Vector3(Math.sin(lAngle) * 0.95, 0.0, Math.cos(lAngle) * 0.95)
            );
            const leg = new THREE.Mesh(new THREE.TubeGeometry(legCurve, 8, 0.12, 8, false), materials.bronze);
            applyShadows(leg);
            cauldron.add(leg);

            // 蹄端
            const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.18, 8), materials.bronze);
            hoof.position.set(Math.sin(lAngle) * 0.95, 0.09, Math.cos(lAngle) * 0.95);
            cauldron.add(hoof);
        }

        // 鼎内熊熊火炭
        const coal = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.25, 16), materials.fireEmbers);
        coal.position.y = 1.72;
        cauldron.add(coal);

        // 飞升火星粒子 (Sparks)
        const sparkGeo = new THREE.SphereGeometry(0.08, 8, 8);
        for (let sp = 0; sp < 6; sp++) {
            const spark = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.9 }));
            spark.position.set(0, 2.0 + sp * 0.4, 0);
            spark.userData = {
                baseY: 1.85,
                birthTime: sp * 0.4,
                driftX: (Math.random() - 0.5) * 0.5,
                driftZ: (Math.random() - 0.5) * 0.5
            };
            cauldron.add(spark);
            animatedElements.fireSparks.push(spark);
        }

        return cauldron;
    };

    // =========================================================================
    // 【第一阶段：筑坛掘坑】(Stage >= 1) - 8件
    // 1. part_sxd_1_k1: 象牙测天祭祀灵标 [Key 1]
    // 2. part_sxd_1_k2: 祭祀坑八角青石基石 [Key 2]
    // 3. part_sxd_1_r1: 鸭子河鹅卵石防冲护堤
    // 4. part_sxd_1_r2: 三星伴月阶梯夯土台·下层
    // 5. part_sxd_1_r3: 三星伴月阶梯夯土台·上层
    // 6. part_sxd_1_r4: 祭坑青紫防渗硬土层
    // 7. part_sxd_1_r5: 整根祭祀原生象牙排束·东
    // 8. part_sxd_1_r6: 整根祭祀原生象牙排束·西
    // =========================================================================
    if (stage >= 1) {
        // 1.1 三星伴月阶梯夯土台·下层 (part_sxd_1_r2)
        const lowerTerraceGroup = new THREE.Group();
        const lowTerraceGeo = new THREE.BoxGeometry(28.0, 0.65, 24.0);
        const lowTerrace = new THREE.Mesh(lowTerraceGeo, materials.rammedEarth);
        lowTerrace.position.set(0, 0.55, -1.0);
        applyShadows(lowTerrace);
        lowerTerraceGroup.add(lowTerrace);

        lowerTerraceGroup.userData = { id: 'part_sxd_1_r2' };
        scene.add(lowerTerraceGroup);
        registerPhysicsMesh(lowerTerraceGroup, 'part_sxd_1_r2', 1, 1, false);

        // 1.2 三星伴月阶梯夯土台·上层 (part_sxd_1_r3)
        const upperTerraceGroup = new THREE.Group();
        const upTerraceGeo = new THREE.BoxGeometry(20.0, 0.55, 16.0);
        const upTerrace = new THREE.Mesh(upTerraceGeo, materials.rammedEarth);
        upTerrace.position.set(0, 1.15, -4.0);
        applyShadows(upTerrace);
        upperTerraceGroup.add(upTerrace);

        // 台阶踏步
        const stepGeo = new THREE.BoxGeometry(4.2, 0.28, 1.2);
        const step = new THREE.Mesh(stepGeo, materials.stonePaver);
        step.position.set(0, 0.95, 4.2);
        upperTerraceGroup.add(step);

        upperTerraceGroup.userData = { id: 'part_sxd_1_r3' };
        scene.add(upperTerraceGroup);
        registerPhysicsMesh(upperTerraceGroup, 'part_sxd_1_r3', 1, 2, false);

        // 1.3 鸭子河鹅卵石防冲护堤 (part_sxd_1_r1)
        const embankmentGroup = new THREE.Group();
        const pebbleGeo = new THREE.DodecahedronGeometry(0.24, 1);
        for (let x = -16.0; x <= 16.0; x += 0.55) {
            const pebble = new THREE.Mesh(pebbleGeo, materials.stonePaver);
            pebble.position.set(x + (Math.random() - 0.5) * 0.15, 0.62, 9.4 + (Math.random() - 0.5) * 0.2);
            pebble.rotation.set(Math.random(), Math.random(), Math.random());
            applyShadows(pebble);
            embankmentGroup.add(pebble);
        }
        embankmentGroup.userData = { id: 'part_sxd_1_r1' };
        scene.add(embankmentGroup);
        registerPhysicsMesh(embankmentGroup, 'part_sxd_1_r1', 1, 3, false);

        // 1.4 祭坑青紫防渗硬土层 (part_sxd_1_r4)
        // 祭祀坑（一号坑、二号坑）凹槽
        const pitGroup = new THREE.Group();
        const pitGeo = new THREE.BoxGeometry(6.4, 0.25, 4.2);
        const pitFloor = new THREE.Mesh(pitGeo, materials.strataDeepRock);
        pitFloor.position.set(-8.5, 0.85, 4.5);
        applyShadows(pitFloor);
        pitGroup.add(pitFloor);

        pitGroup.userData = { id: 'part_sxd_1_r4' };
        scene.add(pitGroup);
        registerPhysicsMesh(pitGroup, 'part_sxd_1_r4', 1, 4, false);

        // 1.5 整根祭祀原生象牙排束·东 (part_sxd_1_r5)
        const tuskEastGroup = new THREE.Group();
        tuskEastGroup.position.set(-7.5, 0.95, 4.0);

        for (let i = 0; i < 5; i++) {
            const tusk = createCurvedTusk(2.6, 0.6, 0.16);
            tusk.position.set((i % 2) * 0.35, i * 0.14, Math.floor(i / 2) * 0.45);
            tusk.rotation.set(0.1, i * 0.4, 0.25);
            tuskEastGroup.add(tusk);
        }
        tuskEastGroup.userData = { id: 'part_sxd_1_r5' };
        scene.add(tuskEastGroup);
        registerPhysicsMesh(tuskEastGroup, 'part_sxd_1_r5', 1, 5, false);

        // 1.6 整根祭祀原生象牙排束·西 (part_sxd_1_r6)
        const tuskWestGroup = new THREE.Group();
        tuskWestGroup.position.set(-9.2, 0.95, 4.2);

        for (let i = 0; i < 5; i++) {
            const tusk = createCurvedTusk(2.5, -0.6, 0.16);
            tusk.position.set((i % 2) * -0.35, i * 0.14, Math.floor(i / 2) * 0.45);
            tusk.rotation.set(-0.1, -i * 0.35, -0.2);
            tuskWestGroup.add(tusk);
        }
        tuskWestGroup.userData = { id: 'part_sxd_1_r6' };
        scene.add(tuskWestGroup);
        registerPhysicsMesh(tuskWestGroup, 'part_sxd_1_r6', 1, 6, false);

        // 1.7 【关键件 1】象牙测天祭祀灵标 (part_sxd_1_k1)
        const gnomonGroup = new THREE.Group();
        gnomonGroup.position.set(-8.5, 1.1, 2.5);

        // 两根向上交错拱立的象牙
        const gnomonTusk1 = createCurvedTusk(3.2, 0.8, 0.18);
        gnomonTusk1.rotation.set(0.2, 0, Math.PI / 4);
        gnomonGroup.add(gnomonTusk1);

        const gnomonTusk2 = createCurvedTusk(3.2, -0.8, 0.18);
        gnomonTusk2.rotation.set(0.2, 0, -Math.PI / 4);
        gnomonGroup.add(gnomonTusk2);

        // 象牙顶端镶嵌的青铜测天环 (Celestial Ring)
        const celRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 8, 24), materials.goldFoil);
        celRing.position.set(0, 2.2, 0.8);
        gnomonGroup.add(celRing);

        gnomonGroup.userData = { id: 'part_sxd_1_k1' };
        scene.add(gnomonGroup);
        registerPhysicsMesh(gnomonGroup, 'part_sxd_1_k1', 1, 0, true);

        // 1.8 【关键件 2】祭祀坑八角青石基石 (part_sxd_1_k2)
        const plinthOctaGroup = new THREE.Group();
        plinthOctaGroup.position.set(0, 0.95, 6.2);

        const octaGeo = new THREE.CylinderGeometry(1.8, 2.1, 0.45, 8);
        const octaMesh = new THREE.Mesh(octaGeo, materials.stonePaver);
        applyShadows(octaMesh);
        plinthOctaGroup.add(octaMesh);

        // 八角踏步雕纹
        const octaUpperGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.25, 8);
        const octaUpper = new THREE.Mesh(octaUpperGeo, materials.stonePaver);
        octaUpper.position.y = 0.35;
        applyShadows(octaUpper);
        plinthOctaGroup.add(octaUpper);

        plinthOctaGroup.userData = { id: 'part_sxd_1_k2' };
        scene.add(plinthOctaGroup);
        registerPhysicsMesh(plinthOctaGroup, 'part_sxd_1_k2', 1, 7, true);
    }

    // =========================================================================
    // 【第二阶段：神宇初起】(Stage >= 2) - 8件
    // 1. part_sxd_2_k1: 神庙中轴通天香樟大梁 [Key 1]
    // 2. part_sxd_2_k2: 四方神位抱头榫卯立柱 [Key 2]
    // 3. part_sxd_2_r1: 回廊图腾雕花金丝楠木柱·东
    // 4. part_sxd_2_r2: 回廊图腾雕花金丝楠木柱·西
    // 5. part_sxd_2_r3: 古蜀人字斜撑穿斗木架构
    // 6. part_sxd_2_r4: 祭祀大殿四面迎风出挑飞檐椽
    // 7. part_sxd_2_r5: 神殿双开朱漆雕凤重门
    // 8. part_sxd_2_r6: 殿内白灰掺合黑陶防潮地坪
    // =========================================================================
    if (stage >= 2) {
        // 神殿殿堂内廷柔和暖金顶光 (照亮殿堂内木构梁柱、金杖与太阳轮，避免屋檐与殿堂过暗)
        const shrineInteriorLight = new THREE.PointLight(0xffeedd, 1.4, 22, 1.2);
        shrineInteriorLight.position.set(0, 5.2, -4.5);
        scene.add(shrineInteriorLight);

        // 2.1 殿内白灰掺合黑陶防潮地坪 (part_sxd_2_r6)
        const floorGroup = new THREE.Group();
        const floorGeo = new THREE.BoxGeometry(19.2, 0.15, 9.2);
        const floor = new THREE.Mesh(floorGeo, materials.pottery);
        floor.position.set(0, 1.48, -5.0);
        applyShadows(floor);
        floorGroup.add(floor);

        floorGroup.userData = { id: 'part_sxd_2_r6' };
        scene.add(floorGroup);
        registerPhysicsMesh(floorGroup, 'part_sxd_2_r6', 2, 6, false);

        // 2.2 回廊图腾雕花金丝楠木柱·东 (part_sxd_2_r1)
        const eastColsGroup = new THREE.Group();
        const colGeo = new THREE.CylinderGeometry(0.22, 0.25, 4.4, 16);
        const plinthGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.22, 16);

        [-8.8, -6.6].forEach((cx) => {
            for (let cz = -9.2; cz <= -0.8; cz += 2.8) {
                const col = new THREE.Mesh(colGeo, materials.nanmuWood);
                col.position.set(cx, 3.6, cz);
                applyShadows(col);
                eastColsGroup.add(col);

                const pl = new THREE.Mesh(plinthGeo, materials.stonePaver);
                pl.position.set(cx, 1.55, cz);
                eastColsGroup.add(pl);
            }
        });
        eastColsGroup.userData = { id: 'part_sxd_2_r1' };
        scene.add(eastColsGroup);
        registerPhysicsMesh(eastColsGroup, 'part_sxd_2_r1', 2, 1, false);

        // 2.3 回廊图腾雕花金丝楠木柱·西 (part_sxd_2_r2)
        const westColsGroup = new THREE.Group();
        [8.8, 6.6].forEach((cx) => {
            for (let cz = -9.2; cz <= -0.8; cz += 2.8) {
                const col = new THREE.Mesh(colGeo, materials.nanmuWood);
                col.position.set(cx, 3.6, cz);
                applyShadows(col);
                westColsGroup.add(col);

                const pl = new THREE.Mesh(plinthGeo, materials.stonePaver);
                pl.position.set(cx, 1.55, cz);
                westColsGroup.add(pl);
            }
        });
        westColsGroup.userData = { id: 'part_sxd_2_r2' };
        scene.add(westColsGroup);
        registerPhysicsMesh(westColsGroup, 'part_sxd_2_r2', 2, 2, false);

        // 2.4 古蜀人字斜撑穿斗木架构 (part_sxd_2_r3)
        const chuandouGroup = new THREE.Group();
        const strutGeo = new THREE.BoxGeometry(0.24, 0.24, 4.2);
        strutGeo.rotateX(Math.PI / 4);

        [-5.5, 0, 5.5].forEach((sx) => {
            const strutL = new THREE.Mesh(strutGeo, materials.oakWood);
            strutL.position.set(sx, 4.8, -7.2);
            applyShadows(strutL);
            chuandouGroup.add(strutL);

            const strutR = new THREE.Mesh(strutGeo, materials.oakWood);
            strutR.position.set(sx, 4.8, -2.8);
            strutR.rotation.x = -Math.PI / 2;
            applyShadows(strutR);
            chuandouGroup.add(strutR);
        });

        chuandouGroup.userData = { id: 'part_sxd_2_r3' };
        scene.add(chuandouGroup);
        registerPhysicsMesh(chuandouGroup, 'part_sxd_2_r3', 2, 3, false);

        // 2.5 祭祀大殿四面迎风出挑飞檐椽 (part_sxd_2_r4)
        const raftersGroup = new THREE.Group();
        // 承重桁架底框
        const rafterBase = new THREE.Mesh(new THREE.BoxGeometry(19.2, 0.22, 9.4), materials.oakWood);
        rafterBase.position.set(0, 5.4, -5.0);
        applyShadows(rafterBase);
        raftersGroup.add(rafterBase);

        // 南北两排密布出挑飞椽 (40 根圆木飞椽)
        for (let rx = -9.2; rx <= 9.2; rx += 0.96) {
            // 南向飞椽
            const rS = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.8, 8), materials.nanmuWood);
            rS.position.set(rx, 5.48, -0.1);
            rS.rotation.x = Math.PI / 2 - 0.22;
            applyShadows(rS);
            raftersGroup.add(rS);

            // 北向飞椽
            const rN = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.8, 8), materials.nanmuWood);
            rN.position.set(rx, 5.48, -9.9);
            rN.rotation.x = Math.PI / 2 + 0.22;
            applyShadows(rN);
            raftersGroup.add(rN);
        }
        // 四角加长出挑大角梁
        [
            [-9.8, -0.3, -0.6], [9.8, -0.3, 0.6],
            [-9.8, -9.7, 0.6],  [9.8, -9.7, -0.6]
        ].forEach(([cx, cz, rz]) => {
            const cornerBeam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 2.4), materials.nanmuWood);
            cornerBeam.position.set(cx, 5.55, cz);
            cornerBeam.rotation.y = Math.atan2(cx, cz + 5.0);
            cornerBeam.rotation.z = rz;
            applyShadows(cornerBeam);
            raftersGroup.add(cornerBeam);
        });

        raftersGroup.userData = { id: 'part_sxd_2_r4' };
        scene.add(raftersGroup);
        registerPhysicsMesh(raftersGroup, 'part_sxd_2_r4', 2, 4, false);

        // 2.6 神殿双开朱漆雕凤重门 (part_sxd_2_r5)
        const doorsGroup = new THREE.Group();
        doorsGroup.position.set(0, 1.5, -0.2);

        const doorLeafGeo = new THREE.BoxGeometry(1.6, 3.6, 0.15);
        const doorL = new THREE.Mesh(doorLeafGeo, materials.vermilionLacquered);
        doorL.position.set(-1.0, 1.8, 0);
        doorL.rotation.y = 0.45;
        applyShadows(doorL);
        doorsGroup.add(doorL);

        const doorR = new THREE.Mesh(doorLeafGeo, materials.vermilionLacquered);
        doorR.position.set(1.0, 1.8, 0);
        doorR.rotation.y = -0.45;
        applyShadows(doorR);
        doorsGroup.add(doorR);

        // 铜制兽面铺首衔环 (Door Knockers)
        [-1.0, 1.0].forEach((dx) => {
            const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 12), materials.goldFoil);
            knocker.position.set(dx > 0 ? dx - 0.45 : dx + 0.45, 1.8, 0.12);
            doorsGroup.add(knocker);
        });

        doorsGroup.userData = { id: 'part_sxd_2_r5' };
        scene.add(doorsGroup);
        registerPhysicsMesh(doorsGroup, 'part_sxd_2_r5', 2, 5, false);

        // 2.7 【关键件 1】神庙中轴通天香樟大梁 (part_sxd_2_k1)
        const masterRidgeGroup = new THREE.Group();
        const ridgeBeamGeo = new THREE.CylinderGeometry(0.38, 0.38, 18.0, 16);
        ridgeBeamGeo.rotateZ(Math.PI / 2);
        const masterRidgeBeam = new THREE.Mesh(ridgeBeamGeo, materials.nanmuWood);
        masterRidgeBeam.position.set(0, 7.6, -5.0);
        applyShadows(masterRidgeBeam);
        masterRidgeGroup.add(masterRidgeBeam);

        masterRidgeGroup.userData = { id: 'part_sxd_2_k1' };
        scene.add(masterRidgeGroup);
        registerPhysicsMesh(masterRidgeGroup, 'part_sxd_2_k1', 2, 0, true);

        // 2.8 【关键件 2】四方神位抱头榫卯立柱 (part_sxd_2_k2)
        const cornerPillarsGroup = new THREE.Group();
        const bigPillarGeo = new THREE.CylinderGeometry(0.36, 0.42, 6.2, 16);

        [
            [-9.2, -9.2], [9.2, -9.2],
            [-9.2, -0.8], [9.2, -0.8]
        ].forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(bigPillarGeo, materials.nanmuWood);
            pillar.position.set(px, 4.5, pz);
            applyShadows(pillar);
            cornerPillarsGroup.add(pillar);

            // 抱头榫拱形节点 (Mortise bracket)
            const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.9), materials.goldFoil);
            bracket.position.set(px, 7.2, pz);
            cornerPillarsGroup.add(bracket);
        });

        cornerPillarsGroup.userData = { id: 'part_sxd_2_k2' };
        scene.add(cornerPillarsGroup);
        registerPhysicsMesh(cornerPillarsGroup, 'part_sxd_2_k2', 2, 7, true);
    }

    // =========================================================================
    // 【第三阶段：灵面通神】(Stage >= 3) - 8件
    // 1. part_sxd_3_k1: 青铜纵目千里眼巨型面具 [Key 1]
    // 2. part_sxd_3_k2: 戴黄金面罩青铜人头坐像 [Key 2]
    // 3. part_sxd_3_r1: 青铜面具祭祀石台列阵·左
    // 4. part_sxd_3_r2: 青铜面具祭祀石台列阵·右
    // 5. part_sxd_3_r3: 祭祀玄石燎祭大铜鼎与火膛
    // 6. part_sxd_3_r4: 殿前列阵青铜戈玉璋仪仗
    // 7. part_sxd_3_r5: 神庙重檐覆云厚茅草大顶
    // 8. part_sxd_3_r6: 屋脊两端青铜立鸟兽角瓦脊
    // =========================================================================
    if (stage >= 3) {
        // 3.1 神庙重檐覆云厚茅草大顶 (part_sxd_3_r5)
        const templeRoofGroup = new THREE.Group();

        // 1. 真实四阿庑殿主草顶 (Top Hipped Roof Core)
        // 面阔 21.0 米，进深 10.6 米，脊长 11.5 米，高 3.6 米
        const roofUpperGeo = createHippedRoofGeometry(21.0, 10.6, 3.6, 0.55);
        const roofMesh = new THREE.Mesh(roofUpperGeo, materials.thatch);
        roofMesh.position.set(0, 7.2, -5.0);
        applyShadows(roofMesh);
        templeRoofGroup.add(roofMesh);

        // 2. 四周檐口 3D 参差毛茸草丝垂须 (3D Thatch Fringes for Sanxingdui Temple)
        const sFringeS = new THREE.Mesh(createThatchFringeGeometry(21.2, 0.65, 54), materials.thatch);
        sFringeS.position.set(0, 7.1, 0.4);
        sFringeS.rotation.x = 0.36;
        sFringeS.castShadow = true;
        templeRoofGroup.add(sFringeS);

        const sFringeN = new THREE.Mesh(createThatchFringeGeometry(21.2, 0.65, 54), materials.thatch);
        sFringeN.position.set(0, 7.1, -10.4);
        sFringeN.rotation.x = -0.36;
        sFringeN.rotation.y = Math.PI;
        sFringeN.castShadow = true;
        templeRoofGroup.add(sFringeN);

        const sFringeW = new THREE.Mesh(createThatchFringeGeometry(10.8, 0.6, 36), materials.thatch);
        sFringeW.position.set(-10.6, 7.1, -5.0);
        sFringeW.rotation.y = Math.PI / 2;
        sFringeW.rotation.x = 0.36;
        sFringeW.castShadow = true;
        templeRoofGroup.add(sFringeW);

        const sFringeE = new THREE.Mesh(createThatchFringeGeometry(10.8, 0.6, 36), materials.thatch);
        sFringeE.position.set(10.6, 7.1, -5.0);
        sFringeE.rotation.y = -Math.PI / 2;
        sFringeE.rotation.x = 0.36;
        sFringeE.castShadow = true;
        templeRoofGroup.add(sFringeE);

        // 3. 正脊粗大覆草卷 (Thick Thatch Ridge Roll, 长12.0米)
        const ridgePole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36, 0.36, 12.0, 16),
            materials.thatch
        );
        ridgePole.rotation.z = Math.PI / 2;
        ridgePole.position.set(0, 10.85, -5.0);
        applyShadows(ridgePole);
        templeRoofGroup.add(ridgePole);

        // 4. 四条垂脊覆草加固卷 (Four Hip Ridge Rolls)
        const hipRollLength = 7.4;
        [
            [-5.75, 9.0, -7.7, Math.PI / 6, -Math.PI / 4],
            [5.75, 9.0, -7.7, Math.PI / 6, Math.PI / 4],
            [-5.75, 9.0, -2.3, -Math.PI / 6, -Math.PI / 4],
            [5.75, 9.0, -2.3, -Math.PI / 6, Math.PI / 4]
        ].forEach(([hx, hy, hz, rx, ry]) => {
            const hipRoll = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.26, hipRollLength, 8),
                materials.thatch
            );
            hipRoll.position.set(hx, hy, hz);
            hipRoll.rotation.x = rx;
            hipRoll.rotation.y = ry;
            hipRoll.rotation.z = Math.PI / 4;
            templeRoofGroup.add(hipRoll);
        });

        // 5. 下层重檐挑檐腰檐 (Lower Eaves Apron)
        const lowerApronGroup = new THREE.Group();
        lowerApronGroup.position.set(0, 5.5, -5.0);

        const apronS = new THREE.Mesh(new THREE.BoxGeometry(22.2, 0.22, 2.4), materials.thatch);
        apronS.position.set(0, 0, 4.8);
        apronS.rotation.x = 0.28;
        applyShadows(apronS);
        lowerApronGroup.add(apronS);

        const lowerFringeS = new THREE.Mesh(createThatchFringeGeometry(22.4, 0.5, 54), materials.thatch);
        lowerFringeS.position.set(0, -0.25, 5.9);
        lowerFringeS.rotation.x = 0.28;
        lowerApronGroup.add(lowerFringeS);

        const apronN = new THREE.Mesh(new THREE.BoxGeometry(22.2, 0.22, 2.4), materials.thatch);
        apronN.position.set(0, 0, -4.8);
        apronN.rotation.x = -0.28;
        applyShadows(apronN);
        lowerApronGroup.add(apronN);

        const lowerFringeN = new THREE.Mesh(createThatchFringeGeometry(22.4, 0.5, 54), materials.thatch);
        lowerFringeN.position.set(0, -0.25, -5.9);
        lowerFringeN.rotation.x = -0.28;
        lowerFringeN.rotation.y = Math.PI;
        lowerApronGroup.add(lowerFringeN);

        const apronW = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 11.2), materials.thatch);
        apronW.position.set(-10.8, 0, 0);
        apronW.rotation.z = -0.28;
        applyShadows(apronW);
        lowerApronGroup.add(apronW);

        const lowerFringeW = new THREE.Mesh(createThatchFringeGeometry(11.4, 0.5, 34), materials.thatch);
        lowerFringeW.position.set(-11.9, -0.25, 0);
        lowerFringeW.rotation.y = Math.PI / 2;
        lowerFringeW.rotation.x = 0.28;
        lowerApronGroup.add(lowerFringeW);

        const apronE = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 11.2), materials.thatch);
        apronE.position.set(10.8, 0, 0);
        apronE.rotation.z = 0.28;
        applyShadows(apronE);
        lowerApronGroup.add(apronE);

        const lowerFringeE = new THREE.Mesh(createThatchFringeGeometry(11.4, 0.5, 34), materials.thatch);
        lowerFringeE.position.set(11.9, -0.25, 0);
        lowerFringeE.rotation.y = -Math.PI / 2;
        lowerFringeE.rotation.x = 0.28;
        lowerApronGroup.add(lowerFringeE);

        templeRoofGroup.add(lowerApronGroup);

        templeRoofGroup.userData = { id: 'part_sxd_3_r5' };
        scene.add(templeRoofGroup);
        registerPhysicsMesh(templeRoofGroup, 'part_sxd_3_r5', 3, 5, false);

        // 3.2 屋脊两端青铜立鸟兽角瓦脊 (part_sxd_3_r6)
        const ridgeBeastsGroup = new THREE.Group();
        [-5.75, 5.75].forEach((bx, idx) => {
            const bird = buildSculptedSunbird();
            bird.position.set(bx, 10.95, -5.0);
            bird.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
            bird.scale.set(1.4, 1.4, 1.4);
            ridgeBeastsGroup.add(bird);
        });

        ridgeBeastsGroup.userData = { id: 'part_sxd_3_r6' };
        scene.add(ridgeBeastsGroup);
        registerPhysicsMesh(ridgeBeastsGroup, 'part_sxd_3_r6', 3, 6, false);

        // 3.3 祭祀玄石燎祭大铜鼎与火膛 (part_sxd_3_r3)
        const cauldronGroup = buildSculptedCauldron();
        cauldronGroup.position.set(0, 1.15, 4.0);
        cauldronGroup.userData = { id: 'part_sxd_3_r3' };
        scene.add(cauldronGroup);
        registerPhysicsMesh(cauldronGroup, 'part_sxd_3_r3', 3, 3, false);

        // 3.4 殿前列阵青铜戈玉璋仪仗 (part_sxd_3_r4)
        const honorGuardGroup = new THREE.Group();
        [-3.6, 3.6].forEach((gx) => {
            for (let gz = 0; gz < 3; gz++) {
                // 玉璋 (Jade Zhang)
                const zhang = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.32), materials.jadeZhang);
                zhang.position.set(gx + (gz % 2) * 0.35, 2.2, 1.5 + gz * 1.4);
                zhang.rotation.z = (Math.random() - 0.5) * 0.1;
                applyShadows(zhang);
                honorGuardGroup.add(zhang);

                // 青铜戈 (Bronze Dagger-Axe Blade)
                const geBlade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 3), materials.bronze);
                geBlade.position.set(gx + (gz % 2) * 0.35, 2.7, 1.5 + gz * 1.4);
                geBlade.rotation.x = Math.PI / 2;
                honorGuardGroup.add(geBlade);

                // 支撑木柄
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.4, 8), materials.oakWood);
                pole.position.set(gx + (gz % 2) * 0.35, 1.2, 1.5 + gz * 1.4);
                honorGuardGroup.add(pole);
            }
        });
        honorGuardGroup.userData = { id: 'part_sxd_3_r4' };
        scene.add(honorGuardGroup);
        registerPhysicsMesh(honorGuardGroup, 'part_sxd_3_r4', 3, 4, false);

        // 3.5 青铜面具祭祀石台列阵·左 (part_sxd_3_r1)
        const maskArrayLGroup = new THREE.Group();
        const maskStandGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.9, 8);

        for (let m = 0; m < 3; m++) {
            const stand = new THREE.Mesh(maskStandGeo, materials.stonePaver);
            stand.position.set(-6.8, 1.95, -1.0 - m * 2.2);
            maskArrayLGroup.add(stand);

            // 雕刻小铜人像
            const smallMask = buildSculptedGoldMaskHead();
            smallMask.scale.set(0.5, 0.5, 0.5);
            smallMask.position.set(-6.8, 2.4, -1.0 - m * 2.2);
            smallMask.rotation.y = Math.PI / 4;
            maskArrayLGroup.add(smallMask);
        }
        maskArrayLGroup.userData = { id: 'part_sxd_3_r1' };
        scene.add(maskArrayLGroup);
        registerPhysicsMesh(maskArrayLGroup, 'part_sxd_3_r1', 3, 1, false);

        // 3.6 青铜面具祭祀石台列阵·右 (part_sxd_3_r2)
        const maskArrayRGroup = new THREE.Group();
        for (let m = 0; m < 3; m++) {
            const stand = new THREE.Mesh(maskStandGeo, materials.stonePaver);
            stand.position.set(6.8, 1.95, -1.0 - m * 2.2);
            maskArrayRGroup.add(stand);

            const smallMask = buildSculptedGoldMaskHead();
            smallMask.scale.set(0.5, 0.5, 0.5);
            smallMask.position.set(6.8, 2.4, -1.0 - m * 2.2);
            smallMask.rotation.y = -Math.PI / 4;
            maskArrayRGroup.add(smallMask);
        }
        maskArrayRGroup.userData = { id: 'part_sxd_3_r2' };
        scene.add(maskArrayRGroup);
        registerPhysicsMesh(maskArrayRGroup, 'part_sxd_3_r2', 3, 2, false);

        // 3.7 【关键件 1】青铜纵目千里眼巨型面具 (part_sxd_3_k1)
        // 宽 1.38米！长圆柱状眼球前凸达16厘米，大耳如展翅飞翼，高悬于正门楣额
        const giantMaskGroup = buildSculptedProtrudingMask();
        giantMaskGroup.position.set(0, 5.4, 0.2);
        giantMaskGroup.userData = { id: 'part_sxd_3_k1' };
        scene.add(giantMaskGroup);
        registerPhysicsMesh(giantMaskGroup, 'part_sxd_3_k1', 3, 0, true);

        // 3.8 【关键件 2】戴黄金面罩青铜人头坐像 (part_sxd_3_k2)
        // 真实双层青铜圆雕人头基底 + 锤揲金面罩
        const goldHeadGroup = buildSculptedGoldMaskHead();
        goldHeadGroup.position.set(0, 1.8, -2.5);
        goldHeadGroup.userData = { id: 'part_sxd_3_k2' };
        scene.add(goldHeadGroup);
        registerPhysicsMesh(goldHeadGroup, 'part_sxd_3_k2', 3, 7, true);
    }

    // =========================================================================
    // 【第四阶段：光轮金杖】(Stage >= 4) - 8件
    // 1. part_sxd_4_k1: 青铜太阳轮五辐圆盘 [Key 1]
    // 2. part_sxd_4_k2: 鱼鸟纹透雕黄金王权权杖 [Key 2]
    // 3. part_sxd_4_r1: 悬空光芒铜质天穹吊环
    // 4. part_sxd_4_r2: 祭祀神坛三层镂空青铜座
    // 5. part_sxd_4_r3: 跪坐执璋青铜神职小人像
    // 6. part_sxd_4_r4: 神庙四周云雷纹祭幡金带
    // 7. part_sxd_4_r5: 古蜀青铜扭头跪坐神人
    // 8. part_sxd_4_r6: 祭坑红烧土玉璧铺底层
    // =========================================================================
    if (stage >= 4) {
        // 4.1 祭坑红烧土玉璧铺底层 (part_sxd_4_r6)
        const pitJadeGroup = new THREE.Group();
        const biGeo = new THREE.TorusGeometry(0.28, 0.1, 8, 24);
        for (let b = 0; b < 8; b++) {
            const biMesh = new THREE.Mesh(biGeo, materials.jadeZhang);
            biMesh.position.set(-8.5 + (b % 3) * 0.7 - 0.7, 0.98, 3.8 + Math.floor(b / 3) * 0.7 - 0.7);
            biMesh.rotation.x = Math.PI / 2;
            pitJadeGroup.add(biMesh);
        }
        pitJadeGroup.userData = { id: 'part_sxd_4_r6' };
        scene.add(pitJadeGroup);
        registerPhysicsMesh(pitJadeGroup, 'part_sxd_4_r6', 4, 6, false);

        // 4.2 祭祀神坛三层镂空青铜座 (part_sxd_4_r2)
        const tieredAltarGroup = new THREE.Group();
        tieredAltarGroup.position.set(0, 1.5, -4.5);

        for (let t = 0; t < 3; t++) {
            const tierGeo = new THREE.BoxGeometry(4.2 - t * 0.9, 0.38, 3.2 - t * 0.7);
            const tierMesh = new THREE.Mesh(tierGeo, materials.bronze);
            tierMesh.position.y = t * 0.38;
            applyShadows(tierMesh);
            tieredAltarGroup.add(tierMesh);
        }
        tieredAltarGroup.userData = { id: 'part_sxd_4_r2' };
        scene.add(tieredAltarGroup);
        registerPhysicsMesh(tieredAltarGroup, 'part_sxd_4_r2', 4, 2, false);

        // 4.3 跪坐执璋青铜神职小人像 (part_sxd_4_r3)
        const kneelingPriestGroup = new THREE.Group();
        kneelingPriestGroup.position.set(-2.0, 1.5, -3.2);

        const priestBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.65), materials.bronze);
        priestBody.position.y = 0.5;
        applyShadows(priestBody);
        kneelingPriestGroup.add(priestBody);

        const priestHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), materials.bronze);
        priestHead.position.y = 1.15;
        kneelingPriestGroup.add(priestHead);

        const priestZhang = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.22), materials.jadeZhang);
        priestZhang.position.set(0, 0.85, 0.4);
        kneelingPriestGroup.add(priestZhang);

        kneelingPriestGroup.userData = { id: 'part_sxd_4_r3' };
        scene.add(kneelingPriestGroup);
        registerPhysicsMesh(kneelingPriestGroup, 'part_sxd_4_r3', 4, 3, false);

        // 4.4 古蜀青铜扭头跪坐神人 (part_sxd_4_r5)
        const twistedFigureGroup = new THREE.Group();
        twistedFigureGroup.position.set(2.0, 1.5, -3.2);

        const twistBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.65), materials.bronze);
        twistBody.position.y = 0.5;
        twistedFigureGroup.add(twistBody);

        const twistHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), materials.bronze);
        twistHead.position.set(0, 1.15, 0);
        twistHead.rotation.y = 0.85; // 扭头向天
        twistedFigureGroup.add(twistHead);

        twistedFigureGroup.userData = { id: 'part_sxd_4_r5' };
        scene.add(twistedFigureGroup);
        registerPhysicsMesh(twistedFigureGroup, 'part_sxd_4_r5', 4, 5, false);

        // 4.5 神庙四周云雷纹祭幡金带 (part_sxd_4_r4)
        const bannersGroup = new THREE.Group();
        const bannerClothGeo = new THREE.PlaneGeometry(0.75, 3.2);
        [-8.2, 8.2].forEach((bx) => {
            const bMesh = new THREE.Mesh(bannerClothGeo, materials.vermilionLacquered);
            bMesh.position.set(bx, 4.2, 2.5);
            bannersGroup.add(bMesh);
            animatedElements.windBanners.push(bMesh);
        });
        bannersGroup.userData = { id: 'part_sxd_4_r4' };
        scene.add(bannersGroup);
        registerPhysicsMesh(bannersGroup, 'part_sxd_4_r4', 4, 4, false);

        // 4.6 悬空光芒铜质天穹吊环 (part_sxd_4_r1)
        const celestialRingGroup = new THREE.Group();
        celestialRingGroup.position.set(0, 6.8, -4.5);

        const ringHalo = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 16, 48), materials.bronze);
        celestialRingGroup.add(ringHalo);

        celestialRingGroup.userData = { id: 'part_sxd_4_r1' };
        scene.add(celestialRingGroup);
        registerPhysicsMesh(celestialRingGroup, 'part_sxd_4_r1', 4, 1, false);

        // 4.7 【关键件 1】青铜太阳轮五辐圆盘 (part_sxd_4_k1)
        // 直径约 85cm，五道等距太阳光芒辐条自中央圆凸阳核射向外周晕圈
        const solarWheelGroup = buildSculptedSunWheel();
        solarWheelGroup.position.set(0, 4.2, -4.5);
        solarWheelGroup.userData = { id: 'part_sxd_4_k1' };
        scene.add(solarWheelGroup);
        animatedElements.solarWheel = solarWheelGroup;
        registerPhysicsMesh(solarWheelGroup, 'part_sxd_4_k1', 4, 0, true);

        // 4.8 【关键件 2】鱼鸟纹透雕黄金王权权杖 (part_sxd_4_k2)
        // 全长 1.42米！纯金金箔包卷木柄，细若发丝刻划鱼鸟飞箭图腾，古蜀王至高权威
        const goldScepterGroup = buildSculptedGoldScepter();
        goldScepterGroup.position.set(0, 3.2, -2.5);
        goldScepterGroup.rotation.z = Math.PI / 4;
        goldScepterGroup.userData = { id: 'part_sxd_4_k2' };
        scene.add(goldScepterGroup);
        registerPhysicsMesh(goldScepterGroup, 'part_sxd_4_k2', 4, 7, true);
    }

    // =========================================================================
    // 【第五阶段：通天神树】(Stage >= 5) - 8件
    // 1. part_sxd_5_k1: 一号青铜通天神树 · 参天神干 [Key 1]
    // 2. part_sxd_5_k2: 青铜大立人像 · 龙袍通天神巫 [Key 2]
    // 3. part_sxd_5_r1: 神树枝头金羽太阳神鸟·九只
    // 4. part_sxd_5_r2: 神树游弋探首青铜飞龙
    // 5. part_sxd_5_r3: 神树三叉镂空圆盘底座
    // 6. part_sxd_5_r4: 神殿顶端青铜神兽风铎
    // 7. part_sxd_5_r5: 通天神树金碧神光聚能环
    // 8. part_sxd_5_r6: 古蜀大地星宿运转祥云
    // =========================================================================
    if (stage >= 5) {
        // 5.1 神树三叉镂空圆盘底座 (part_sxd_5_r3)
        // 独立注册底座，包含神山镂空雕塑
        const treeBaseGroup = new THREE.Group();
        treeBaseGroup.position.set(-5.6, 1.15, 3.2);

        for (let m = 0; m < 3; m++) {
            const mAngle = (m * Math.PI * 2) / 3;
            const legCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, 1.1, 0),
                new THREE.Vector3(Math.cos(mAngle) * 1.4, 0.65, Math.sin(mAngle) * 1.4),
                new THREE.Vector3(Math.cos(mAngle) * 2.1, 0.1, Math.sin(mAngle) * 2.1)
            );
            const leg = new THREE.Mesh(new THREE.TubeGeometry(legCurve, 12, 0.22, 8, false), materials.bronze);
            applyShadows(leg);
            treeBaseGroup.add(leg);

            const paw = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.65), materials.bronze);
            paw.position.set(Math.cos(mAngle) * 2.15, 0.11, Math.sin(mAngle) * 2.15);
            paw.rotation.y = -mAngle - Math.PI / 2;
            treeBaseGroup.add(paw);
        }

        const collarDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.32, 16), materials.bronze);
        collarDisk.position.y = 1.15;
        applyShadows(collarDisk);
        treeBaseGroup.add(collarDisk);

        treeBaseGroup.userData = { id: 'part_sxd_5_r3' };
        scene.add(treeBaseGroup);
        registerPhysicsMesh(treeBaseGroup, 'part_sxd_5_r3', 5, 3, false);

        // 5.2 【关键件 1】一号青铜通天神树 · 参天神干 (part_sxd_5_k1)
        // 高达近 4 米！三层九枝，果实垂悬，下有飞龙，上栖神乌
        const sacredTreeGroup = buildSculptedSacredTree();
        sacredTreeGroup.position.set(-5.6, 1.15, 3.2);
        sacredTreeGroup.userData = { id: 'part_sxd_5_k1' };
        scene.add(sacredTreeGroup);
        animatedElements.sacredTree = sacredTreeGroup;
        registerPhysicsMesh(sacredTreeGroup, 'part_sxd_5_k1', 5, 0, true);

        // 5.3 神树枝头金羽太阳神鸟·九只 (part_sxd_5_r1)
        const birdsGroup = new THREE.Group();
        birdsGroup.position.set(-5.6, 1.15, 3.2);

        const tierBranchY = [1.6, 3.3, 4.8];
        for (let t = 0; t < 3; t++) {
            const bY = tierBranchY[t];
            const branchLen = 2.4 - t * 0.25;

            for (let b = 0; b < 3; b++) {
                const bAngle = (b * Math.PI * 2) / 3 + t * 0.45;
                const bird = buildSculptedSunbird();
                const tipX = Math.cos(bAngle) * branchLen * 0.82;
                const tipZ = Math.sin(bAngle) * branchLen * 0.82;
                bird.position.set(tipX, bY + 0.95, tipZ);
                bird.rotation.y = -bAngle - Math.PI / 2;
                bird.scale.set(0.75, 0.75, 0.75);
                birdsGroup.add(bird);
                animatedElements.solarBirds.push(bird);
            }
        }
        birdsGroup.scale.set(1.22, 1.22, 1.22);
        birdsGroup.userData = { id: 'part_sxd_5_r1' };
        scene.add(birdsGroup);
        registerPhysicsMesh(birdsGroup, 'part_sxd_5_r1', 5, 1, false);

        // 5.4 神树游弋探首青铜飞龙 (part_sxd_5_r2)
        const dragonGroup = buildSculptedDragon();
        dragonGroup.position.set(-5.6, 1.15, 3.2);
        dragonGroup.scale.set(1.22, 1.22, 1.22);
        dragonGroup.userData = { id: 'part_sxd_5_r2' };
        scene.add(dragonGroup);
        animatedElements.treeDragon = dragonGroup;
        registerPhysicsMesh(dragonGroup, 'part_sxd_5_r2', 5, 2, false);

        // 5.5 【关键件 2】青铜大立人像 · 龙袍通天神巫 (part_sxd_5_k2)
        // 2.62米！象首四足座、赤足脚镯、三重龙袍燕尾服、双环虚握手、莲花高冠
        const grandFigureGroup = buildSculptedStandingGiant();
        grandFigureGroup.position.set(5.6, 1.15, 3.2);
        grandFigureGroup.userData = { id: 'part_sxd_5_k2' };
        scene.add(grandFigureGroup);
        registerPhysicsMesh(grandFigureGroup, 'part_sxd_5_k2', 5, 7, true);

        // 5.6 神殿顶端青铜神兽风铎 (part_sxd_5_r4)
        const bellsGroup = new THREE.Group();
        const bellGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
        [-8.5, 8.5].forEach((bx) => {
            const bell = new THREE.Mesh(bellGeo, materials.bronze);
            bell.position.set(bx, 5.7, -0.2);
            bell.rotation.x = Math.PI;
            bellsGroup.add(bell);
        });
        bellsGroup.userData = { id: 'part_sxd_5_r4' };
        scene.add(bellsGroup);
        registerPhysicsMesh(bellsGroup, 'part_sxd_5_r4', 5, 4, false);

        // 5.7 通天神树金碧神光聚能环 (part_sxd_5_r5)
        const haloGroup = new THREE.Group();
        haloGroup.position.set(-5.6, 8.2, 3.2);

        const auraRing1 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 16, 48), new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.65 }));
        auraRing1.rotation.x = Math.PI / 2;
        haloGroup.add(auraRing1);
        animatedElements.treeAuraRings.push(auraRing1);

        const auraRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 16, 48), new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.7 }));
        auraRing2.rotation.x = Math.PI / 2.2;
        haloGroup.add(auraRing2);
        animatedElements.treeAuraRings.push(auraRing2);

        haloGroup.userData = { id: 'part_sxd_5_r5' };
        scene.add(haloGroup);
        registerPhysicsMesh(haloGroup, 'part_sxd_5_r5', 5, 5, false);

        // 5.8 古蜀大地星宿运转祥云 (part_sxd_5_r6)
        const cloudGroup = new THREE.Group();
        cloudGroup.position.set(0, 10.5, 0);

        const cloudPuffGeo = new THREE.SphereGeometry(0.65, 12, 12);
        const cloudMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
        [-3.2, 0, 3.2].forEach((cx, i) => {
            const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
            puff.position.set(cx, Math.sin(i * 1.5) * 0.3, (i % 2) * 0.4);
            cloudGroup.add(puff);
        });

        cloudGroup.userData = { id: 'part_sxd_5_r6' };
        scene.add(cloudGroup);
        registerPhysicsMesh(cloudGroup, 'part_sxd_5_r6', 5, 6, false);
    }

    // =========================================================================
    // 关键帧动力学系统驱动器 (Littlest Tokyo 标杆循环动画)
    // =========================================================================
    return {
        updateAnimations: (delta, elapsedTime) => {
            // 1. 燎祭神火与飞星粒子跳动
            if (animatedElements.fireSparks.length > 0) {
                animatedElements.fireSparks.forEach((sp) => {
                    const t = (elapsedTime * 1.6 + sp.userData.birthTime) % 1.5;
                    sp.position.y = sp.userData.baseY + t * 1.6;
                    sp.position.x = Math.sin(elapsedTime * 3.0 + sp.userData.birthTime) * 0.35 + sp.userData.driftX;
                    sp.position.z = Math.cos(elapsedTime * 2.5 + sp.userData.birthTime) * 0.35 + sp.userData.driftZ;
                    sp.material.opacity = Math.max(0, 1.0 - t / 1.5);
                });
            }

            // 2. 燎祭火光呼吸跳跃
            if (animatedElements.altarLight) {
                animatedElements.altarLight.intensity = 1.4 + Math.sin(elapsedTime * 6.0) * 0.28 + Math.cos(elapsedTime * 8.5) * 0.15;
            }

            // 3. 通天神树双环神光自转与悬浮微浮
            if (animatedElements.treeAuraRings.length > 0) {
                animatedElements.treeAuraRings[0].rotation.z += delta * 0.45;
                animatedElements.treeAuraRings[1].rotation.z -= delta * 0.65;
            }

            // 4. 一号神树通天神光碧翠脉冲
            if (animatedElements.treeLight) {
                animatedElements.treeLight.intensity = 1.8 + Math.sin(elapsedTime * 2.2) * 0.35;
            }

            // 5. 青铜太阳轮五辐圆盘慢速神圣自转
            if (animatedElements.solarWheel) {
                animatedElements.solarWheel.rotation.z += delta * 0.25;
            }

            // 6. 神树枝头九只金羽神鸟迎风轻颤引吭
            if (animatedElements.solarBirds.length > 0) {
                animatedElements.solarBirds.forEach((b, idx) => {
                    b.rotation.x = Math.sin(elapsedTime * 2.5 + idx * 0.6) * 0.08;
                    b.position.y += Math.sin(elapsedTime * 3.0 + idx) * 0.001;
                });
            }

            // 7. 神幡迎风猎猎飘动
            if (animatedElements.windBanners.length > 0) {
                animatedElements.windBanners.forEach((b, idx) => {
                    b.rotation.y = Math.sin(elapsedTime * 2.2 + idx * 1.2) * 0.18;
                    b.rotation.z = Math.cos(elapsedTime * 1.8 + idx * 0.8) * 0.08;
                });
            }

            // 8. 鸭子河流水光波影
            if (animatedElements.waterMesh && textures.water?.map) {
                textures.water.map.offset.x = (elapsedTime * 0.035) % 1;
                textures.water.map.offset.y = (elapsedTime * 0.02) % 1;
            }
        }
    };
}
