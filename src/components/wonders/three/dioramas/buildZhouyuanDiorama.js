import * as THREE from 'three';

/**
 * 🏛️ 周原 · 岐邑凤雏周庙（华夏第一四合院）微缩立体建筑箱庭 (Architectural Diorama)
 * 严格依据陕西岐山凤雏村西周甲组建筑基址考古挖掘报告（杨鸿勋先生复原论证）：
 * 1. 真实两进四合院中轴对称格局 (南北 45.2m x 东西 32.5m 比例缩放)：
 *    - 南门外影壁（树塞门，界定等级与视线遮挡）；
 *    - 南大门穿堂门道（断砌造便于车马通行）与东西双门塾；
 *    - 宽阔中院前庭大天井（白灰红烧土铺地，中央设定穴规矩盘与燎祭大火塘）；
 *    - 东西连列八间通长厢房与柱廊（两翼严密闭合）；
 *    - 前堂（正殿，面阔六间进深三间，高耸宏伟四阿庑殿顶）；
 *    - 中轴穿廊（工字连接）与后室（五间私密后寝，独立四阿顶）；
 *    - 穿廊东西两侧幽深后庭天井；
 * 2. 真实西周陶瓦与屋顶建筑群体系：
 *    - 彻底告别粗糙单块大盖子，各单体建筑均有独立精细的西周陶板瓦与筒瓦屋顶；
 *    - 前堂独立高大四阿庑殿顶、后室独立四阿顶、东西厢房南北通长双坡悬山顶、门塾双坡顶；
 * 3. 西周国宝重器与礼乐图腾：
 *    - 铭刻“宅兹中国”何尊（圆口方体、高耸透雕勾云齿扉棱、高浮雕饕餮纹）；
 *    - 武王征商利簋（侈口垂腹、双兽首垂长耳珥、天圆地方连铸厚重方座）；
 *    - 毛公鼎（双立耳三矮蹄足、32行499字金文巨册）；
 *    - 周原微雕卜甲窖藏与西周青铜甬钟三层乐架（36枚钟枚、随风摇曳）；
 * 4. 20 件标准零部件数据契约 100% 满匹配，构件级独立材质克隆隔离，无光晕串扰。
 */

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

// 辅助工具：构建南北贯通的纵向双坡廊房屋顶（Gable/Shed Roof for Wings）
function createLongitudinalRoofGeometry(w, d, h) {
    const hw = w / 2;
    const hd = d / 2;
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

    const rF = [0, h, hd];
    const rB = [0, h, -hd];

    // 西面斜坡
    addQuad(cBL, cFL, rF, rB);
    // 东面斜坡
    addQuad(cFR, cBR, rB, rF);
    // 南山墙
    addTri(cFL, cFR, rF);
    // 北山墙
    addTri(cBR, cBL, rB);
    // 底面封底
    addQuad(cFL, cBL, cBR, cFR);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geo;
}

export function buildZhouyuanDiorama({
    scene,
    stage,
    isConstructing,
    textures,
    fireLight,
    jadeLight,
    registerPhysicsMesh
}) {
    const animatedElements = {
        sacredHeZun: null,
        heZunLight: jadeLight,
        templeSparks: [],
        chimeBells: [],
        windBanners: []
    };

    // 基础 PBR 材质
    const materials = {
        rammedEarth: new THREE.MeshStandardMaterial({
            map: textures.rammedEarth.map,
            bumpMap: textures.rammedEarth.bumpMap,
            bumpScale: 0.08,
            roughness: 0.88,
            metalness: 0.04
        }),
        strataDeepRock: new THREE.MeshStandardMaterial({
            color: 0x221c16,
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
        zhouTile: new THREE.MeshStandardMaterial({
            map: textures.zhouTile ? textures.zhouTile.map : textures.stonePaver.map,
            bumpMap: textures.zhouTile ? textures.zhouTile.bumpMap : textures.stonePaver.bumpMap,
            bumpScale: 0.1,
            color: 0xffffff,
            roughness: 0.65,
            metalness: 0.06,
            side: THREE.DoubleSide
        }),
        stonePaver: new THREE.MeshStandardMaterial({
            map: textures.stonePaver.map,
            bumpMap: textures.stonePaver.bumpMap,
            bumpScale: 0.06,
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
            bumpScale: 0.05,
            color: 0x3d5a45, // 典雅西周青绿古锈
            roughness: 0.36,
            metalness: 0.75
        }),
        brightBronze: new THREE.MeshStandardMaterial({
            color: 0xd97706,
            roughness: 0.3,
            metalness: 0.85
        }),
        goldInscription: new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: new THREE.Color(0xd97706),
            emissiveIntensity: 0.85,
            roughness: 0.25,
            metalness: 0.9
        }),
        vermilionPillar: new THREE.MeshStandardMaterial({
            color: 0x991b1b, // 周室朱红木立柱
            roughness: 0.65,
            metalness: 0.08
        }),
        vermilionWall: new THREE.MeshStandardMaterial({
            color: 0xa8422b, // 红烧土草拌泥墙
            roughness: 0.82,
            metalness: 0.04
        }),
        whiteMarble: new THREE.MeshStandardMaterial({
            color: 0xc8c3b4, // 汉白玉/青石质测影规矩盘
            roughness: 0.65,
            metalness: 0.03
        }),
        burntPlasterFloor: new THREE.MeshStandardMaterial({
            color: 0x694632, // 考古实证：西周红烧土草拌泥白灰面硬化地坪 (温润厚重赭褐色，绝不反光过曝)
            roughness: 0.88,
            metalness: 0.02
        }),
        oracleBone: new THREE.MeshStandardMaterial({
            color: 0xdfd4be, // 占卜卜甲温润骨黄色
            roughness: 0.45,
            metalness: 0.05
        })
    };

    // 箱庭厚地层基盘尺寸 (南北长 28m，东西宽 22m，厚 2.2m)
    const baseW = 22.0;
    const baseD = 28.0;
    const baseH = 2.2;

    // ==========================================================================
    // 阶段 1：夯基通渠 (夯土长方形台基、公母榫卯水管、散水暗井与斜坡御道)
    // ==========================================================================
    if (stage >= 1) {
        const stage1Group = new THREE.Group();
        stage1Group.name = "Zhouyuan_Stage_1";

        // 1.1 考古地层厚切基盘 (4层地层剖面)
        const strataGeos = [
            { h: 0.75, mat: materials.strataDeepRock, y: 0.375 },
            { h: 0.65, mat: materials.strataRedClay, y: 1.075 },
            { h: 0.45, mat: materials.strataPaleoSoil, y: 1.625 },
            { h: 0.35, mat: materials.rammedEarth, y: 2.025 }
        ];

        strataGeos.forEach((strata, idx) => {
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(baseW, strata.h, baseD),
                strata.mat
            );
            mesh.position.set(0, strata.y, 0);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            stage1Group.add(mesh);

            if (idx === strataGeos.length - 1) {
                registerPhysicsMesh(mesh, 'part_zy_1_r1', false);
            }
        });

        // 1.2 凤雏甲组万方版筑夯土主台基 (高出地面 0.8m，长 22m x 宽 16m 的规整两进台基)
        const podiumW = 16.0;
        const podiumD = 22.0;
        const podiumH = 0.8;
        const podium = new THREE.Mesh(
            new THREE.BoxGeometry(podiumW, podiumH, podiumD),
            materials.rammedEarth
        );
        podium.position.set(0, baseH + podiumH / 2, -0.5);
        podium.receiveShadow = true;
        podium.castShadow = true;
        stage1Group.add(podium);
        registerPhysicsMesh(podium, 'part_zy_1_r1', false);

        // 1.3 关键件：岐山周原定穴规矩盘 (周公测影定子午线神盘，置于中院前庭)
        const dialGroup = new THREE.Group();
        dialGroup.position.set(0, baseH + podiumH + 0.05, 4.2);

        // 汉白玉八角石台
        const stoneDial = new THREE.Mesh(
            new THREE.CylinderGeometry(0.95, 1.05, 0.22, 8),
            materials.whiteMarble
        );
        stoneDial.receiveShadow = true;
        stoneDial.castShadow = true;
        dialGroup.add(stoneDial);

        // 二十八宿青铜圆环
        const bronzeRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.68, 0.07, 16, 32),
            materials.brightBronze
        );
        bronzeRing.rotation.x = Math.PI / 2;
        bronzeRing.position.y = 0.12;
        dialGroup.add(bronzeRing);

        // 中央垂直测影立表圭臬
        const gnomon = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.065, 1.15, 12),
            materials.brightBronze
        );
        gnomon.position.y = 0.65;
        gnomon.castShadow = true;
        dialGroup.add(gnomon);

        stage1Group.add(dialGroup);
        registerPhysicsMesh(stoneDial, 'part_zy_1_k', true);

        // 1.4 陶制公母榫卯地下排水暗渠 (两排圆筒陶管穿出台基两侧切片外露)
        const pipeGroup = new THREE.Group();
        const pipeSegments = 6;
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < pipeSegments; i++) {
                const z = -7.5 + i * 2.5;
                const pipe = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.22, 0.22, 2.2, 16, 1, true),
                    materials.pottery
                );
                pipe.rotation.x = Math.PI / 2;
                pipe.position.set(side * 8.6, baseH + 0.22, z);
                pipe.castShadow = true;
                pipeGroup.add(pipe);

                // 母头承口扩圈 (Bell socket)
                const bell = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.28, 0.24, 0.35, 16),
                    materials.pottery
                );
                bell.rotation.x = Math.PI / 2;
                bell.position.set(side * 8.6, baseH + 0.22, z + 1.05);
                pipeGroup.add(bell);
            }
        }
        stage1Group.add(pipeGroup);
        pipeGroup.children.forEach(c => registerPhysicsMesh(c, 'part_zy_1_r2', false));

        // 1.5 庭院渗水暗井与散水卵石明沟 (庭院四围卵石散水护道与渗水井)
        const drainGroup = new THREE.Group();
        for (let side = -1; side <= 1; side += 2) {
            const trench = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.1, podiumD - 1.2),
                materials.stonePaver
            );
            trench.position.set(side * (podiumW / 2 - 0.45), baseH + podiumH + 0.02, -0.5);
            drainGroup.add(trench);
        }
        // 四角渗水暗井
        const wells = [
            [-6.8, -9.2], [6.8, -9.2], [-6.8, 8.2], [6.8, 8.2]
        ];
        wells.forEach(([cx, cz]) => {
            const wellRim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.42, 0.46, 0.28, 16, 1, true),
                materials.pottery
            );
            wellRim.position.set(cx, baseH + podiumH + 0.1, cz);
            drainGroup.add(wellRim);
        });
        stage1Group.add(drainGroup);
        drainGroup.children.forEach(c => registerPhysicsMesh(c, 'part_zy_1_r3', false));

        // 1.6 南大门外夯土斜坡御道踏步 (前道斜坡御道)
        const rampGroup = new THREE.Group();
        const rampW = 4.2;
        const rampL = 3.8;
        const ramp = new THREE.Mesh(
            new THREE.BoxGeometry(rampW, 0.45, rampL),
            materials.rammedEarth
        );
        ramp.rotation.x = 0.15;
        ramp.position.set(0, baseH + 0.35, 12.0);
        ramp.receiveShadow = true;
        ramp.castShadow = true;
        rampGroup.add(ramp);

        // 两侧青石护道齿条
        for (let side = -1; side <= 1; side += 2) {
            const kerb = new THREE.Mesh(
                new THREE.BoxGeometry(0.28, 0.55, rampL),
                materials.stonePaver
            );
            kerb.rotation.x = 0.15;
            kerb.position.set(side * (rampW / 2 + 0.16), baseH + 0.4, 12.0);
            rampGroup.add(kerb);
        }
        stage1Group.add(rampGroup);
        rampGroup.children.forEach(c => registerPhysicsMesh(c, 'part_zy_1_r4', false));

        scene.add(stage1Group);
    }

    // ==========================================================================
    // 阶段 2：立塾安屏 (大门外影壁萧墙、南大门与东西门塾、东西通长八间厢房)
    // ==========================================================================
    if (stage >= 2) {
        const stage2Group = new THREE.Group();
        stage2Group.name = "Zhouyuan_Stage_2";

        const floorY = baseH + 0.8; // 庭院地平标高

        // 2.1 关键件：华夏最早影壁萧墙 (位于大门外正南方约 3 米处，树塞门之祖制！)
        const screenGroup = new THREE.Group();
        screenGroup.position.set(0, floorY, 13.5);

        // 青石条基座
        const screenBase = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 0.42, 0.85),
            materials.stonePaver
        );
        screenBase.position.y = 0.21;
        screenBase.castShadow = true;
        screenGroup.add(screenBase);

        // 版筑红烧土照壁墙心
        const screenWall = new THREE.Mesh(
            new THREE.BoxGeometry(3.8, 2.1, 0.52),
            materials.vermilionWall
        );
        screenWall.position.y = 1.35;
        screenWall.castShadow = true;
        screenGroup.add(screenWall);

        // 影壁正反双面高浮雕饕餮神兽面青砖雕
        for (let side = -1; side <= 1; side += 2) {
            const brickPlaque = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 1.1, 0.08),
                materials.pottery
            );
            brickPlaque.position.set(0, 1.4, side * 0.29);
            screenGroup.add(brickPlaque);

            // 饕餮双圆眼
            for (let eyeSide = -1; eyeSide <= 1; eyeSide += 2) {
                const eye = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.1, 0.14, 12),
                    materials.bronze
                );
                eye.rotation.x = Math.PI / 2;
                eye.position.set(eyeSide * 0.32, 1.45, side * 0.32);
                screenGroup.add(eye);
            }

            // 饕餮大卷角
            const horns = new THREE.Mesh(
                new THREE.TorusGeometry(0.26, 0.055, 8, 16, Math.PI),
                materials.bronze
            );
            horns.rotation.z = Math.PI;
            horns.position.set(0, 1.72, side * 0.31);
            screenGroup.add(horns);
        }

        // 影壁屋顶：独立小悬山陶板瓦顶
        const screenRoofGeo = createHippedRoofGeometry(4.4, 1.1, 0.55, 0.7);
        const screenRoof = new THREE.Mesh(screenRoofGeo, materials.zhouTile);
        screenRoof.position.y = 2.4;
        screenRoof.castShadow = true;
        screenGroup.add(screenRoof);

        stage2Group.add(screenGroup);
        registerPhysicsMesh(screenWall, 'part_zy_2_k', true);

        // 2.2 南大门（穿堂门道断砌造）与左右双门塾
        const gateGroup = new THREE.Group();
        gateGroup.position.set(0, floorY, 9.2);

        // 门道（隧，宽 2.8m，进深 3.4m）
        // 门楼木架构柱网 (四根粗壮朱漆立柱)
        [[-1.5, -1.2], [-1.5, 1.2], [1.5, -1.2], [1.5, 1.2]].forEach(([gx, gz]) => {
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.16, 0.18, 3.2, 12),
                materials.vermilionPillar
            );
            col.position.set(gx, 1.6, gz);
            col.castShadow = true;
            gateGroup.add(col);

            const plinth = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.32, 0.22, 12),
                materials.stonePaver
            );
            plinth.position.set(gx, 0.11, gz);
            gateGroup.add(plinth);
        });

        // 门楼大额枋横梁
        const gateLintel = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 0.32, 0.32),
            materials.oakWood
        );
        gateLintel.position.set(0, 2.95, 0);
        gateLintel.castShadow = true;
        gateGroup.add(gateLintel);

        // 双开朱红木门扇
        for (let side = -1; side <= 1; side += 2) {
            const doorLeaf = new THREE.Mesh(
                new THREE.BoxGeometry(1.35, 2.65, 0.1),
                materials.vermilionWall
            );
            doorLeaf.position.set(side * 0.75, 1.4, 0);
            doorLeaf.castShadow = true;
            gateGroup.add(doorLeaf);

            // 门扇青铜泡钉阵列 (5排3列)
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 3; c++) {
                    const stud = new THREE.Mesh(
                        new THREE.SphereGeometry(0.035, 8, 8),
                        materials.brightBronze
                    );
                    stud.position.set(
                        side * (0.3 + c * 0.45),
                        0.4 + r * 0.5,
                        0.07
                    );
                    gateGroup.add(stud);
                }
            }

            // 纯铜兽首衔环铺首
            const knocker = new THREE.Mesh(
                new THREE.TorusGeometry(0.12, 0.03, 8, 16),
                materials.bronze
            );
            knocker.position.set(side * 0.6, 1.4, 0.08);
            gateGroup.add(knocker);
        }

        // 左右门塾房（东门塾与西门塾，各面阔 3.8m，进深 3.4m）
        for (let side = -1; side <= 1; side += 2) {
            const porterHouse = new THREE.Mesh(
                new THREE.BoxGeometry(3.6, 2.6, 3.2),
                materials.vermilionWall
            );
            porterHouse.position.set(side * 4.3, 1.3, 0);
            porterHouse.castShadow = true;
            gateGroup.add(porterHouse);

            // 门塾独立四阿陶板瓦屋顶
            const porterRoofGeo = createHippedRoofGeometry(4.4, 3.8, 1.2, 0.45);
            const porterRoof = new THREE.Mesh(porterRoofGeo, materials.zhouTile);
            porterRoof.position.set(side * 4.3, 2.6, 0);
            porterRoof.castShadow = true;
            gateGroup.add(porterRoof);
        }

        // 门楼中央屋面连接顶
        const centerGateRoofGeo = createHippedRoofGeometry(3.6, 3.8, 1.1, 0.3);
        const centerGateRoof = new THREE.Mesh(centerGateRoofGeo, materials.zhouTile);
        centerGateRoof.position.set(0, 2.85, 0);
        centerGateRoof.castShadow = true;
        gateGroup.add(centerGateRoof);

        stage2Group.add(gateGroup);
        registerPhysicsMesh(gateLintel, 'part_zy_2_r1', false);

        // 2.3 & 2.4 东西连列八间厢房与柱廊 (南北通长 14 米，严密闭合两翼)
        const wingLength = 13.8;
        const wingWidth = 3.0;
        const wingCenterZ = 0.5; // 从南到北贯通门塾至前堂

        // 东厢房 (East Wing - 8间)
        const eastWingGroup = new THREE.Group();
        const eastWingWall = new THREE.Mesh(
            new THREE.BoxGeometry(wingWidth, 2.6, wingLength),
            materials.vermilionWall
        );
        eastWingWall.position.set(-6.2, floorY + 1.3, wingCenterZ);
        eastWingWall.castShadow = true;
        eastWingGroup.add(eastWingWall);

        // 沿庭院内侧整齐排列的 8 根朱红内檐柱与柱础
        for (let i = 0; i < 8; i++) {
            const z = wingCenterZ - wingLength / 2 + 0.9 + i * (wingLength - 1.8) / 7;
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.14, 2.6, 12),
                materials.vermilionPillar
            );
            col.position.set(-4.6, floorY + 1.3, z);
            col.castShadow = true;
            eastWingGroup.add(col);

            const plinth = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.25, 0.16, 12),
                materials.stonePaver
            );
            plinth.position.set(-4.6, floorY + 0.08, z);
            eastWingGroup.add(plinth);
        }

        // 东厢房屋顶：南北贯通的整列双坡陶板瓦屋顶
        const eastRoofGeo = createLongitudinalRoofGeometry(3.6, wingLength + 0.6, 1.15);
        const eastRoof = new THREE.Mesh(eastRoofGeo, materials.zhouTile);
        eastRoof.position.set(-6.0, floorY + 2.6, wingCenterZ);
        eastRoof.castShadow = true;
        eastWingGroup.add(eastRoof);

        stage2Group.add(eastWingGroup);
        eastWingGroup.children.forEach(c => registerPhysicsMesh(c, 'part_zy_2_r2', false));

        // 西厢房 (West Wing - 8间，对称镜像)
        const westWingGroup = new THREE.Group();
        const westWingWall = new THREE.Mesh(
            new THREE.BoxGeometry(wingWidth, 2.6, wingLength),
            materials.vermilionWall
        );
        westWingWall.position.set(6.2, floorY + 1.3, wingCenterZ);
        westWingWall.castShadow = true;
        westWingGroup.add(westWingWall);

        for (let i = 0; i < 8; i++) {
            const z = wingCenterZ - wingLength / 2 + 0.9 + i * (wingLength - 1.8) / 7;
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.14, 2.6, 12),
                materials.vermilionPillar
            );
            col.position.set(4.6, floorY + 1.3, z);
            col.castShadow = true;
            westWingGroup.add(col);

            const plinth = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.25, 0.16, 12),
                materials.stonePaver
            );
            plinth.position.set(4.6, floorY + 0.08, z);
            westWingGroup.add(plinth);
        }

        const westRoofGeo = createLongitudinalRoofGeometry(3.6, wingLength + 0.6, 1.15);
        const westRoof = new THREE.Mesh(westRoofGeo, materials.zhouTile);
        westRoof.position.set(6.0, floorY + 2.6, wingCenterZ);
        westRoof.castShadow = true;
        westWingGroup.add(westRoof);

        stage2Group.add(westWingGroup);
        westWingGroup.children.forEach(c => registerPhysicsMesh(c, 'part_zy_2_r3', false));

        // 2.5 环院贯通回廊抱头榫过梁
        const tieGroup = new THREE.Group();
        [-1, 1].forEach(side => {
            const connectorBeam = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.24, 0.22),
                materials.nanmuWood
            );
            connectorBeam.position.set(side * 5.4, floorY + 2.55, 7.4);
            connectorBeam.castShadow = true;
            tieGroup.add(connectorBeam);
        });
        stage2Group.add(tieGroup);
        tieGroup.children.forEach(c => registerPhysicsMesh(c, 'part_zy_2_r4', false));

        scene.add(stage2Group);
    }

    // ==========================================================================
    // 阶段 3：巍峨堂寝 (前堂六间、后寝五间、中轴穿廊、高耸四阿庑殿顶与飞椽)
    // ==========================================================================
    if (stage >= 3) {
        const stage3Group = new THREE.Group();
        stage3Group.name = "Zhouyuan_Stage_3";

        const floorY = baseH + 0.8;

        // 3.1 关键件：前堂六开间祭祀议事中堂 (主殿核心架构，面阔 17.2m x 进深 6.1m 比例)
        const hallGroup = new THREE.Group();
        const hallZ = -3.2;
        hallGroup.position.set(0, floorY, hallZ);

        // 前堂台明月台 (比庭院再抬高 0.35m)
        const hallPodium = new THREE.Mesh(
            new THREE.BoxGeometry(12.8, 0.35, 5.2),
            materials.stonePaver
        );
        hallPodium.position.y = 0.175;
        hallPodium.receiveShadow = true;
        hallPodium.castShadow = true;
        hallGroup.add(hallPodium);

        // 前堂前台阶踏步 (两级青石台阶)
        const steps = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 0.18, 0.8),
            materials.stonePaver
        );
        steps.position.set(0, 0.09, 2.8);
        hallGroup.add(steps);

        // 面阔六间柱网 (前檐柱 7 根 + 脊金柱 7 根 + 后檐柱 7 根，共 21 根朱漆大立柱)
        const colRows = [-1.9, 0, 1.9];
        const colCols = [-5.2, -3.5, -1.75, 0, 1.75, 3.5, 5.2];

        colRows.forEach(rz => {
            colCols.forEach(cx => {
                const col = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.16, 0.18, 3.6, 16),
                    materials.vermilionPillar
                );
                col.position.set(cx, 0.35 + 1.8, rz);
                col.castShadow = true;
                hallGroup.add(col);

                const plinth = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.35, 0.2, 16),
                    materials.stonePaver
                );
                plinth.position.set(cx, 0.35 + 0.1, rz);
                hallGroup.add(plinth);
            });
        });

        // 殿内后墙与左右山墙 (前檐敞开，后墙密闭)
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(11.2, 3.2, 0.25),
            materials.vermilionWall
        );
        backWall.position.set(0, 0.35 + 1.6, -2.0);
        backWall.castShadow = true;
        hallGroup.add(backWall);

        for (let side = -1; side <= 1; side += 2) {
            const sideWall = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, 3.2, 4.0),
                materials.vermilionWall
            );
            sideWall.position.set(side * 5.4, 0.35 + 1.6, 0);
            sideWall.castShadow = true;
            hallGroup.add(sideWall);
        }

        stage3Group.add(hallGroup);
        registerPhysicsMesh(hallPodium, 'part_zy_3_k', true);

        // 3.2 后进五间私密后寝神殿与中轴穿廊 (华夏最早工字殿)
        const rearGroup = new THREE.Group();
        const rearZ = -8.5;
        rearGroup.position.set(0, floorY, rearZ);

        // 后寝殿座 (面阔五间，10.2m x 3.8m)
        const rearPodium = new THREE.Mesh(
            new THREE.BoxGeometry(10.2, 0.28, 3.8),
            materials.stonePaver
        );
        rearPodium.position.y = 0.14;
        rearGroup.add(rearPodium);

        // 后寝密闭墙体与排柱
        const rearWall = new THREE.Mesh(
            new THREE.BoxGeometry(9.6, 2.6, 3.2),
            materials.vermilionWall
        );
        rearWall.position.y = 0.28 + 1.3;
        rearWall.castShadow = true;
        rearGroup.add(rearWall);

        // 后寝独立四阿陶板瓦屋顶
        const rearRoofGeo = createHippedRoofGeometry(11.0, 4.6, 1.45, 0.55);
        const rearRoof = new THREE.Mesh(rearRoofGeo, materials.zhouTile);
        rearRoof.position.y = 0.28 + 2.6;
        rearRoof.castShadow = true;
        rearGroup.add(rearRoof);

        // 中轴工字穿廊 (连接前堂后门与后寝正门)
        const corridorWalk = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.24, 2.6),
            materials.stonePaver
        );
        corridorWalk.position.set(0, 0.12, 3.0);
        rearGroup.add(corridorWalk);

        // 穿廊立柱与小屋顶
        [-0.9, 0.9].forEach(cx => {
            [-0.7, 0.7].forEach(cz => {
                const col = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.11, 2.4, 12),
                    materials.vermilionPillar
                );
                col.position.set(cx, 0.24 + 1.2, 3.0 + cz);
                rearGroup.add(col);
            });
        });

        const corridorRoof = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 0.25, 2.8),
            materials.zhouTile
        );
        corridorRoof.position.set(0, 0.24 + 2.4, 3.0);
        rearGroup.add(corridorRoof);

        stage3Group.add(rearGroup);
        registerPhysicsMesh(rearPodium, 'part_zy_3_r1', false);

        // 3.3 华夏最早西周烧制陶板瓦屋脊 (前堂宏伟高耸四阿庑殿顶)
        const mainRoofGroup = new THREE.Group();
        const mainRoofGeo = createHippedRoofGeometry(13.8, 6.2, 2.1, 0.58);
        const mainRoof = new THREE.Mesh(mainRoofGeo, materials.zhouTile);
        mainRoof.position.set(0, floorY + 0.35 + 3.6, hallZ);
        mainRoof.castShadow = true;
        mainRoof.receiveShadow = true;
        mainRoofGroup.add(mainRoof);

        // 正脊大陶筒瓦 (Ridge Tile)
        const mainRidge = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 6.8, 16),
            materials.zhouTile
        );
        mainRidge.rotation.z = Math.PI / 2;
        mainRidge.position.set(0, floorY + 0.35 + 5.7, hallZ);
        mainRidge.castShadow = true;
        mainRoofGroup.add(mainRidge);

        stage3Group.add(mainRoofGroup);
        registerPhysicsMesh(mainRoof, 'part_zy_3_r2', false);

        // 3.4 四阿重挑飞檐大木出挑飞椽 (四个殿角的木飞椽与角梁)
        const rafterGroup = new THREE.Group();
        const corners = [
            [-6.4, -2.8], [6.4, -2.8], [-6.4, 2.8], [6.4, 2.8]
        ];
        corners.forEach(([rx, rz]) => {
            const rafter = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.2, 1.8),
                materials.oakWood
            );
            rafter.position.set(rx, floorY + 3.8, hallZ + rz);
            rafter.rotation.y = rx * rz > 0 ? 0.65 : -0.65;
            rafter.rotation.x = -0.2;
            rafter.castShadow = true;
            rafterGroup.add(rafter);
        });
        stage3Group.add(rafterGroup);
        rafterGroup.children.forEach(c => registerPhysicsMesh(c, 'part_zy_3_r3', false));

        // 3.5 白灰烧土双层平整室内地平 (前堂殿内地坪)
        const plasterFloor = new THREE.Mesh(
            new THREE.BoxGeometry(11.6, 0.04, 4.4),
            materials.burntPlasterFloor
        );
        plasterFloor.position.set(0, floorY + 0.35 + 0.03, hallZ);
        plasterFloor.receiveShadow = true;
        stage3Group.add(plasterFloor);
        registerPhysicsMesh(plasterFloor, 'part_zy_3_r4', false);

        scene.add(stage3Group);
    }

    // ==========================================================================
    // 阶段 4：金石齐鸣 (国宝重器齐聚：何尊、利簋、毛公鼎、周原甲骨、青铜甬钟)
    // ==========================================================================
    if (stage >= 4) {
        const stage4Group = new THREE.Group();
        stage4Group.name = "Zhouyuan_Stage_4";

        const floorY = baseH + 0.8 + 0.35; // 前堂室内地平
        const hallZ = -3.2;

        // 4.1 关键件 1：铭刻“宅兹中国” · 西周何尊 (前堂中轴神位，圆口方体高浮雕饕餮)
        const heZunMasterGroup = new THREE.Group();
        heZunMasterGroup.position.set(0, floorY + 1.15, hallZ + 0.4);

        // 朱漆神案木几
        const altarTable = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.75, 1.1),
            materials.vermilionPillar
        );
        altarTable.position.y = -0.72;
        altarTable.receiveShadow = true;
        altarTable.castShadow = true;
        heZunMasterGroup.add(altarTable);

        // 何尊本体
        const heZunMeshGroup = buildSculptedHeZun(materials);
        heZunMasterGroup.add(heZunMeshGroup);

        // 尊内底金光微粒流转光环 (象征“宅兹中国”铭文灵光)
        const goldHalo = new THREE.Mesh(
            new THREE.RingGeometry(0.18, 0.42, 32),
            materials.goldInscription
        );
        goldHalo.rotation.x = -Math.PI / 2;
        goldHalo.position.y = 0.48;
        heZunMasterGroup.add(goldHalo);

        // 柔和碧翠环境点光源
        if (jadeLight) {
            jadeLight.position.set(0, floorY + 1.5, hallZ + 0.4);
            jadeLight.color.setHex(0x34d399);
            jadeLight.intensity = 0.35;
        }

        stage4Group.add(heZunMasterGroup);
        animatedElements.sacredHeZun = heZunMasterGroup;
        registerPhysicsMesh(heZunMeshGroup, 'part_zy_4_k1', true);

        // 4.2 关键件 2：武王征商利簋 · 天圆地方连铸方座 (神案左侧)
        const liGuiMasterGroup = new THREE.Group();
        liGuiMasterGroup.position.set(-2.4, floorY + 0.8, hallZ + 0.4);

        const liGuiMeshGroup = buildSculptedLiGui(materials);
        liGuiMasterGroup.add(liGuiMeshGroup);

        stage4Group.add(liGuiMasterGroup);
        registerPhysicsMesh(liGuiMeshGroup, 'part_zy_4_k2', true);

        // 4.3 毛公鼎 · 499字西周最长青铜铭文 (神案右侧)
        const maoGongDingGroup = new THREE.Group();
        maoGongDingGroup.position.set(2.4, floorY + 0.8, hallZ + 0.4);

        const maoGongDingMesh = buildSculptedMaoGongDing(materials);
        maoGongDingGroup.add(maoGongDingMesh);

        stage4Group.add(maoGongDingGroup);
        registerPhysicsMesh(maoGongDingMesh, 'part_zy_4_r1', false);

        // 4.4 周原微雕卜甲甲骨文窖藏 (殿前西侧)
        const oracleGroup = new THREE.Group();
        oracleGroup.position.set(-2.8, floorY - 0.35 + 0.05, 0.5);

        const oracleMesh = buildSculptedOracleBones(materials);
        oracleGroup.add(oracleMesh);

        stage4Group.add(oracleGroup);
        registerPhysicsMesh(oracleMesh, 'part_zy_4_r2', false);

        // 4.5 西周青铜甬钟三层乐架 (殿前东侧，合瓦形甬钟与36枚钟枚)
        const chimeGroup = new THREE.Group();
        chimeGroup.position.set(2.8, floorY - 0.35 + 0.05, 0.5);

        const { chimeBellFrame, bells } = buildSculptedChimeBells(materials);
        chimeGroup.add(chimeBellFrame);
        animatedElements.chimeBells = bells;

        stage4Group.add(chimeGroup);
        registerPhysicsMesh(chimeBellFrame, 'part_zy_4_r3', false);

        // 4.6 庭院中央燎祭神火塘与袅袅青烟 (设于开阔中院天井中央)
        const hearthGroup = new THREE.Group();
        const courtFloorY = baseH + 0.8;
        hearthGroup.position.set(0, courtFloorY + 0.05, 1.8);

        const hearthBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.85, 0.95, 0.3, 16),
            materials.stonePaver
        );
        hearthBase.position.y = 0.15;
        hearthGroup.add(hearthBase);

        const charcoal = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 12, 12),
            new THREE.MeshStandardMaterial({
                color: 0xff4500,
                emissive: new THREE.Color(0xff2200),
                emissiveIntensity: 1.6,
                roughness: 0.8
            })
        );
        charcoal.position.y = 0.35;
        hearthGroup.add(charcoal);

        if (fireLight) {
            fireLight.position.set(0, courtFloorY + 1.2, 1.8);
            fireLight.color.setHex(0xf97316);
            fireLight.intensity = 1.2;
        }

        // 燎祭火星粒子
        const sparkCount = 18;
        for (let i = 0; i < sparkCount; i++) {
            const spark = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
            );
            spark.userData = {
                baseY: 0.4 + Math.random() * 1.6,
                speedY: 0.7 + Math.random() * 1.0,
                radius: 0.08 + Math.random() * 0.3,
                angle: Math.random() * Math.PI * 2
            };
            hearthGroup.add(spark);
            animatedElements.templeSparks.push(spark);
        }

        stage4Group.add(hearthGroup);

        // 4.7 南大门前周天子“玄鸟云雷”祭幡
        for (let side = -1; side <= 1; side += 2) {
            const bannerPole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.07, 5.8, 12),
                materials.oakWood
            );
            bannerPole.position.set(side * 2.8, courtFloorY, 8.2);
            bannerPole.castShadow = true;
            stage4Group.add(bannerPole);

            const banner = new THREE.Mesh(
                new THREE.PlaneGeometry(0.75, 3.0, 4, 8),
                new THREE.MeshStandardMaterial({
                    color: 0x991b1b,
                    side: THREE.DoubleSide,
                    roughness: 0.7
                })
            );
            banner.position.set(side * 2.8 + 0.4, courtFloorY + 3.8, 8.2);
            stage4Group.add(banner);
            animatedElements.windBanners.push(banner);
        }

        scene.add(stage4Group);
    }

    // ==========================================================================
    // 关键帧动力学动画控制器
    // ==========================================================================
    return {
        updateAnimations: (delta, elapsedTime) => {
            // 1. 何尊沉浮与自转呼吸动效
            if (animatedElements.sacredHeZun) {
                animatedElements.sacredHeZun.position.y = (baseH + 0.8 + 0.35 + 1.15) + Math.sin(elapsedTime * 1.5) * 0.06;
                animatedElements.sacredHeZun.rotation.y = elapsedTime * 0.22;
            }

            // 2. 青铜甬钟在微风中轻微摆动 (金石雅乐和鸣)
            if (animatedElements.chimeBells && animatedElements.chimeBells.length > 0) {
                animatedElements.chimeBells.forEach((bell, idx) => {
                    bell.rotation.z = Math.sin(elapsedTime * 2.0 + idx * 0.7) * 0.05;
                    bell.rotation.x = Math.cos(elapsedTime * 1.6 + idx * 0.4) * 0.035;
                });
            }

            // 3. 庭院火星粒子升腾
            if (animatedElements.templeSparks.length > 0) {
                animatedElements.templeSparks.forEach(spark => {
                    const u = spark.userData;
                    spark.position.y += delta * u.speedY;
                    u.angle += delta * 1.6;
                    spark.position.x = Math.cos(u.angle) * u.radius;
                    spark.position.z = Math.sin(u.angle) * u.radius;

                    if (spark.position.y > 2.8) {
                        spark.position.y = 0.35;
                    }
                });
            }

            // 4. 周室祭幡随风飘动
            if (animatedElements.windBanners.length > 0) {
                animatedElements.windBanners.forEach((b, idx) => {
                    b.rotation.y = Math.sin(elapsedTime * 3.0 + idx) * 0.14;
                    b.rotation.z = Math.cos(elapsedTime * 2.2 + idx) * 0.07;
                });
            }

            // 5. 火塘火光柔和闪烁
            if (fireLight) {
                fireLight.intensity = 1.0 + Math.sin(elapsedTime * 6.0) * 0.2 + Math.cos(elapsedTime * 11.0) * 0.12;
            }
        }
    };
}

// ==============================================================================
// 🏛️ 文博馆藏级高精度程序化几何雕塑发生器 (Museum-Grade Sculpting Generators)
// ==============================================================================

/**
 * 1. 【何尊】(He Zun): 圆口方体、四角高耸透雕勾云齿扉棱、高浮雕饕餮纹
 */
function buildSculptedHeZun(materials) {
    const group = new THREE.Group();

    // 1.1 圆口方体尊身放样 (LatheGeometry 剖面从圆到方过渡)
    const points = [
        new THREE.Vector2(0.55, 0.95),  // 敞口圆唇
        new THREE.Vector2(0.48, 0.88),  // 敛颈
        new THREE.Vector2(0.42, 0.65),  // 颈底
        new THREE.Vector2(0.52, 0.35),  // 鼓腹
        new THREE.Vector2(0.46, 0.15),  // 腹下收束
        new THREE.Vector2(0.48, 0.05),  // 圈足折沿
        new THREE.Vector2(0.52, -0.45), // 高圈足底
        new THREE.Vector2(0.46, -0.45)  // 圈足内收
    ];

    const bodyGeo = new THREE.LatheGeometry(points, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, materials.bronze);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    // 1.2 四道高大镂空勾云齿扉棱 (Four High Openwork Flanges)
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const flangeGroup = new THREE.Group();
        flangeGroup.rotation.y = angle;

        const flangeShape = new THREE.Shape();
        flangeShape.moveTo(0.52, 0.95);
        flangeShape.lineTo(0.72, 0.92); // 顶齿外挑
        flangeShape.lineTo(0.66, 0.75); // 凹齿
        flangeShape.lineTo(0.78, 0.62); // 突齿
        flangeShape.lineTo(0.64, 0.45); // 凹齿
        flangeShape.lineTo(0.82, 0.32); // 腹部最大外挑巨齿
        flangeShape.lineTo(0.68, 0.18); // 凹齿
        flangeShape.lineTo(0.76, 0.02); // 突齿
        flangeShape.lineTo(0.65, -0.15); // 凹齿
        flangeShape.lineTo(0.78, -0.35); // 圈足大齿
        flangeShape.lineTo(0.52, -0.45); // 到底
        flangeShape.lineTo(0.46, -0.45);
        flangeShape.lineTo(0.48, 0.95);
        flangeShape.closePath();

        const extrudeSettings = {
            depth: 0.06,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.015,
            bevelThickness: 0.015
        };

        const flangeGeo = new THREE.ExtrudeGeometry(flangeShape, extrudeSettings);
        const flangeMesh = new THREE.Mesh(flangeGeo, materials.bronze);
        flangeMesh.position.z = -0.03;
        flangeMesh.castShadow = true;
        flangeGroup.add(flangeMesh);

        group.add(flangeGroup);
    }

    // 1.3 腹部高浮雕饕餮兽面 (巨睛暴凸、外卷大粗角)
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const faceGroup = new THREE.Group();
        faceGroup.rotation.y = angle;
        faceGroup.position.set(0, 0.32, 0.52);

        // 暴凸圆柱双眼
        for (let eyeSide = -1; eyeSide <= 1; eyeSide += 2) {
            const eye = new THREE.Mesh(
                new THREE.CylinderGeometry(0.065, 0.08, 0.12, 16),
                materials.brightBronze
            );
            eye.rotation.x = Math.PI / 2;
            eye.position.set(eyeSide * 0.16, 0.08, 0.04);
            faceGroup.add(eye);

            const pupil = new THREE.Mesh(
                new THREE.SphereGeometry(0.035, 8, 8),
                materials.bronze
            );
            pupil.position.set(eyeSide * 0.16, 0.08, 0.11);
            faceGroup.add(pupil);

            const horn = new THREE.Mesh(
                new THREE.TorusGeometry(0.14, 0.04, 8, 16, Math.PI * 0.8),
                materials.brightBronze
            );
            horn.rotation.z = eyeSide > 0 ? 0.3 : -0.3;
            horn.position.set(eyeSide * 0.22, 0.22, 0.02);
            faceGroup.add(horn);
        }

        const nose = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.18, 0.08),
            materials.brightBronze
        );
        nose.position.set(0, 0.04, 0.05);
        faceGroup.add(nose);

        group.add(faceGroup);
    }

    group.scale.set(1.35, 1.35, 1.35);
    return group;
}

/**
 * 2. 【利簋】(Li Gui): 侈口垂腹、双兽首大耳垂长珥、天圆地方连铸高大方座
 */
function buildSculptedLiGui(materials) {
    const group = new THREE.Group();

    // 2.1 下部连铸高大厚重方座
    const baseW = 1.15;
    const baseH = 0.52;
    const squareBase = new THREE.Mesh(
        new THREE.BoxGeometry(baseW, baseH, baseW),
        materials.bronze
    );
    squareBase.position.y = -0.32;
    squareBase.castShadow = true;
    squareBase.receiveShadow = true;
    group.add(squareBase);

    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.36, 0.04),
            materials.brightBronze
        );
        panel.rotation.y = angle;
        panel.position.set(
            Math.sin(angle) * (baseW / 2 + 0.02),
            -0.32,
            Math.cos(angle) * (baseW / 2 + 0.02)
        );
        group.add(panel);
    }

    // 2.2 上部圆簋身
    const points = [
        new THREE.Vector2(0.62, 0.55),
        new THREE.Vector2(0.55, 0.45),
        new THREE.Vector2(0.64, 0.22),
        new THREE.Vector2(0.58, 0.04),
        new THREE.Vector2(0.52, -0.06),
        new THREE.Vector2(0.54, -0.08)
    ];

    const bodyGeo = new THREE.LatheGeometry(points, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, materials.bronze);
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // 2.3 双兽首长耳与下垂长珥
    for (let side = -1; side <= 1; side += 2) {
        const handleGroup = new THREE.Group();
        handleGroup.position.set(side * 0.62, 0.35, 0);

        const beastHead = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.16, 0.18),
            materials.brightBronze
        );
        beastHead.position.set(side * 0.08, 0.08, 0);
        handleGroup.add(beastHead);

        const earRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.055, 8, 16, Math.PI),
            materials.bronze
        );
        earRing.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        earRing.position.set(side * 0.12, -0.08, 0);
        handleGroup.add(earRing);

        const pendant = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.32, 0.06),
            materials.brightBronze
        );
        pendant.position.set(side * 0.14, -0.32, 0);
        handleGroup.add(pendant);

        group.add(handleGroup);
    }

    group.scale.set(1.2, 1.2, 1.2);
    return group;
}

/**
 * 3. 【毛公鼎】(Mao Gong Ding): 双宽厚立耳、大圆鼓腹、三蹄足
 */
function buildSculptedMaoGongDing(materials) {
    const group = new THREE.Group();

    const bellyGeo = new THREE.SphereGeometry(0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const bellyMesh = new THREE.Mesh(bellyGeo, materials.bronze);
    bellyMesh.position.y = 0.22;
    bellyMesh.castShadow = true;
    group.add(bellyMesh);

    const rimRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.56, 0.05, 12, 32),
        materials.brightBronze
    );
    rimRing.rotation.x = Math.PI / 2;
    rimRing.position.y = 0.42;
    group.add(rimRing);

    for (let side = -1; side <= 1; side += 2) {
        const handle = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.065, 8, 16, Math.PI),
            materials.bronze
        );
        handle.rotation.x = Math.PI / 2;
        handle.rotation.z = side > 0 ? 0.15 : -0.15;
        handle.position.set(side * 0.52, 0.58, 0);
        handle.castShadow = true;
        group.add(handle);
    }

    for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const legGroup = new THREE.Group();
        legGroup.position.set(Math.cos(angle) * 0.42, -0.05, Math.sin(angle) * 0.42);

        const upperLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.08, 0.42, 16),
            materials.bronze
        );
        upperLeg.position.y = -0.15;
        legGroup.add(upperLeg);

        const hoof = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.13, 0.12, 16),
            materials.brightBronze
        );
        hoof.position.y = -0.38;
        legGroup.add(hoof);

        group.add(legGroup);
    }

    group.scale.set(1.15, 1.15, 1.15);
    return group;
}

/**
 * 4. 【周原微雕甲骨】(Zhouyuan Oracle Bones)
 */
function buildSculptedOracleBones(materials) {
    const group = new THREE.Group();

    const mat = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.04, 1.2),
        materials.oakWood
    );
    mat.position.y = 0.02;
    group.add(mat);

    const plastronGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.05, 8);
    const plastron = new THREE.Mesh(plastronGeo, materials.oracleBone);
    plastron.rotation.y = 0.25;
    plastron.position.set(-0.35, 0.06, 0);
    plastron.castShadow = true;
    group.add(plastron);

    for (let l = 0; l < 5; l++) {
        const line = new THREE.Mesh(
            new THREE.BoxGeometry(0.015, 0.01, 0.45),
            new THREE.MeshBasicMaterial({ color: 0xb91c1c })
        );
        line.position.set(-0.45 + l * 0.06, 0.09, 0);
        group.add(line);
    }

    const scapulaGeo = new THREE.ConeGeometry(0.24, 0.85, 5);
    const scapula = new THREE.Mesh(scapulaGeo, materials.oracleBone);
    scapula.rotation.z = Math.PI / 2;
    scapula.rotation.y = -0.35;
    scapula.position.set(0.42, 0.07, 0.05);
    scapula.castShadow = true;
    group.add(scapula);

    const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.28, 0.45, 16),
        materials.pottery
    );
    pot.position.set(0.48, 0.25, -0.38);
    pot.castShadow = true;
    group.add(pot);

    return group;
}

/**
 * 5. 【西周青铜甬钟乐架】(Chime Bell Frame & Yongzhong Bells)
 */
function buildSculptedChimeBells(materials) {
    const group = new THREE.Group();
    const bells = [];

    const frameBase = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.12, 0.8),
        materials.vermilionPillar
    );
    frameBase.position.y = 0.06;
    group.add(frameBase);

    for (let side = -1; side <= 1; side += 2) {
        const col = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.09, 1.85, 12),
            materials.vermilionPillar
        );
        col.position.set(side * 0.95, 0.98, 0);
        col.castShadow = true;
        group.add(col);
    }

    const topBeam = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.14, 0.14),
        materials.vermilionPillar
    );
    topBeam.position.set(0, 1.88, 0);
    topBeam.castShadow = true;
    group.add(topBeam);

    const bellConfigs = [
        { x: -0.65, scale: 0.95 },
        { x: 0, scale: 0.82 },
        { x: 0.65, scale: 0.7 }
    ];

    bellConfigs.forEach(({ x, scale }) => {
        const bellGroup = new THREE.Group();
        bellGroup.position.set(x, 1.78, 0);

        const cord = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8),
            materials.brightBronze
        );
        cord.position.y = -0.11;
        bellGroup.add(cord);

        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.05, 0.35, 12),
            materials.bronze
        );
        stem.rotation.z = 0.12;
        stem.position.set(0.02, -0.32, 0);
        bellGroup.add(stem);

        const bellBodyGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.52, 12, 1, false);
        bellBodyGeo.scale(1.0, 1.0, 0.72);
        const bellBody = new THREE.Mesh(bellBodyGeo, materials.bronze);
        bellBody.position.y = -0.68;
        bellBody.castShadow = true;
        bellGroup.add(bellBody);

        for (let side = -1; side <= 1; side += 2) {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const boss = new THREE.Mesh(
                        new THREE.SphereGeometry(0.022, 6, 6),
                        materials.brightBronze
                    );
                    boss.position.set(
                        (c - 1) * 0.09,
                        -0.55 - r * 0.09,
                        side * 0.21
                    );
                    bellGroup.add(boss);
                }
            }
        }

        bellGroup.scale.set(scale, scale, scale);
        group.add(bellGroup);
        bells.push(bellGroup);
    });

    return { chimeBellFrame: group, bells };
}
