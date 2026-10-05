import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

import {
    createRammedEarthTextures,
    createThatchTextures,
    createWoodTextures,
    createJadeCongTextures,
    createPaintedPotteryTextures,
    createStonePaverTextures,
    createWaterTextures,
    createAncientBronzeTextures,
    createTurquoiseTextures,
    createGoldFoilTextures,
    createSanxingduiBronzeTextures,
    createIvoryTextures,
    createZhouTileTextures
} from './proceduralTextures';

import { buildBanpoDiorama } from './dioramas/buildBanpoDiorama';
import { buildLiangzhuDiorama } from './dioramas/buildLiangzhuDiorama';
import { buildErlitouDiorama } from './dioramas/buildErlitouDiorama';
import { buildSanxingduiDiorama } from './dioramas/buildSanxingduiDiorama';
import { buildZhouyuanDiorama } from './dioramas/buildZhouyuanDiorama';

import {
    loadGLTFFromUrl,
    parseGLTFFile,
    inspectGLTFModel,
    normalizeAndConfigureGLTF,
    exportObjectToGLB,
    downloadGLBFile
} from './gltfPipeline';

/**
 * 🏛️ 时空营造司 · 实时 WebGL 3D 建筑箱庭引擎 (Architectural Diorama Engine)
 * 对标官方标杆：three.js/examples/#webgl_animation_keyframes (Littlest Tokyo 风格)
 * 
 * 核心技术与美学升级：
 * 1. 接入 RoomEnvironment + PMREMGenerator 环境贴图预过滤，赋能所有 PBR 材质天然的展厅级环境漫射与高光；
 * 2. 纯代码程序化立体微缩建筑箱庭 (Diorama Strata Base)，包含考古地层切片、环壕水系、水利溢流坝与聚落活态生活道具；
 * 3. 实时循环关键帧动力学系统 (巡航独木舟与划桨人、双山花排烟炊烟微粒、摇曳神幡与羽毛图腾、悬浮自转大玉琮王与灵环)；
 * 4. 电影级后处理合成 (UnrealBloom 呼吸辉光 + ACES Filmic + 4x MSAA + 文博暗角镜头聚焦)；
 * 5. 工业级 GLTF/GLB 导入、解析、拓扑 HUD 透视与双向导出本地下载能力。
 */
export const Wonder3DViewer = ({
    wonderId = 'liangzhu_altar',
    stage = 5,
    isConstructing = false,
    activePartId = null,
    className = "w-full h-full"
}) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const pmremGeneratorRef = useRef(null);
    const roomEnvRef = useRef(null);
    const dioramaAnimatorRef = useRef(null);

    const meshesMapRef = useRef(new Map());
    const animMeshesRef = useRef([]);
    const shockwavesRef = useRef([]);
    const animFrameRef = useRef(null);
    const fireLightRef = useRef(null);
    const jadeLightRef = useRef(null);
    const waterTextureRef = useRef(null);

    const composerRef = useRef(null);
    const renderTargetRef = useRef(null);
    const targetLookAtRef = useRef(new THREE.Vector3(0, 3.8, 0));

    const [isAutoRotating, setIsAutoRotating] = useState(true);
    const [isCinematic, setIsCinematic] = useState(true);
    const [animTrigger, setAnimTrigger] = useState(0);

    // GLTF / GLB 资产管线状态
    const [modelSource, setModelSource] = useState('procedural'); // 'procedural' | 'glb'
    const [customGlbFile, setCustomGlbFile] = useState(null);
    const [customGlbName, setCustomGlbName] = useState(null);
    const [glbStats, setGlbStats] = useState(null);
    const [isLoadingModel, setIsLoadingModel] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [glbNotice, setGlbNotice] = useState(null);
    const fileInputRef = useRef(null);

    // 暴露全局快速导出当前 3D 场景为二进制 .glb 文件能力
    useEffect(() => {
        window.__exportCurrentWonderGLB = async () => {
            const scene = sceneRef.current;
            if (!scene) return null;
            const exportRoot = new THREE.Group();
            scene.children.forEach(c => {
                if (c.isMesh || c.isGroup) {
                    exportRoot.add(c.clone());
                }
            });
            return await exportObjectToGLB(exportRoot);
        };
    }, []);

    // 焦距与观察点、点光源随奇迹切换平滑迁移
    useEffect(() => {
        if (wonderId === 'sanxingdui_shrine') {
            targetLookAtRef.current.set(0, 3.2, 0.5);
            if (fireLightRef.current) {
                fireLightRef.current.position.set(0, 2.5, 4.0); // 燎祭大铜鼎
                fireLightRef.current.intensity = 2.0;
            }
            if (jadeLightRef.current) {
                jadeLightRef.current.position.set(-5.6, 5.5, 3.2); // 一号神树通天神光
                jadeLightRef.current.intensity = 2.2;
                jadeLightRef.current.color.setHex(0x34d399);
            }
        } else if (wonderId === 'liangzhu_altar') {
            targetLookAtRef.current.set(0, 3.8, 0);
            if (fireLightRef.current) {
                fireLightRef.current.position.set(0, 3.2, 6.2); // 处于祭坛前方燎祭大鼎中
                fireLightRef.current.intensity = 1.4;
            }
            if (jadeLightRef.current) {
                jadeLightRef.current.position.set(0, 4.3, 3.5); // 处于大玉琮王神圣中心
                jadeLightRef.current.intensity = 1.5;
                jadeLightRef.current.color.setHex(0x34d399);
            }
        } else if (wonderId === 'erlitou_palace') {
            targetLookAtRef.current.set(0, 3.2, 0);
            if (fireLightRef.current) {
                fireLightRef.current.position.set(0, 2.5, 3.0);
                fireLightRef.current.intensity = 1.4;
            }
            if (jadeLightRef.current) {
                jadeLightRef.current.intensity = 0.0;
            }
        } else if (wonderId === 'zhouyuan_temple') {
            targetLookAtRef.current.set(0, 3.2, 0);
            if (fireLightRef.current) {
                fireLightRef.current.position.set(0, 3.8, 1.8);
                fireLightRef.current.intensity = 0.9;
            }
            if (jadeLightRef.current) {
                jadeLightRef.current.position.set(0, 4.5, -2.8);
                jadeLightRef.current.intensity = 0.35;
                jadeLightRef.current.color.setHex(0x34d399);
            }
        } else {
            targetLookAtRef.current.set(0, 3.2, 0);
            if (fireLightRef.current) {
                fireLightRef.current.position.set(0, 0.6, 0); // 处于半坡大草庐中央永恒火塘中
                fireLightRef.current.intensity = 1.6;
            }
            if (jadeLightRef.current) {
                jadeLightRef.current.intensity = 0.0; // 半坡无玉琮神光
            }
        }
    }, [wonderId]);

    // 1. 初始化 Three.js 场景、RoomEnvironment、相机、控制器、灯光与渲染循环
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        // 场景
        const scene = new THREE.Scene();
        // 展厅高级低饱和灰棕背景，突出立体箱庭
        scene.background = new THREE.Color(0x13110f);
        scene.fog = new THREE.FogExp2(0x13110f, 0.007);
        sceneRef.current = scene;
        window.__debugScene = scene;

        // 摄像机 (经典的 3/4 俯视轴测立体视角)
        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
        camera.position.set(22, 17, 26);
        cameraRef.current = camera;
        window.__debugCamera = camera;

        // 渲染器 (对标 webgl_animation_keyframes)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.02;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ★ 核心对标：RoomEnvironment + PMREMGenerator 预过滤环境贴图
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        const roomEnv = new RoomEnvironment();
        scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
        pmremGeneratorRef.current = pmremGenerator;
        roomEnvRef.current = roomEnv;

        // 电影级后处理管线 (HalfFloatType + 4x MSAA 硬件抗锯齿)
        const renderTarget = new THREE.WebGLRenderTarget(width, height, {
            type: THREE.HalfFloatType,
            samples: 4
        });
        renderTargetRef.current = renderTarget;

        const composer = new EffectComposer(renderer, renderTarget);
        composer.setSize(width, height);
        composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 1. 基础场景渲染通道
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        // 2. UnrealBloomPass 辉光 (仅使玉琮神光、火塘与高光悬停构件产生呼吸光晕，阈值 0.98 杜绝草顶与地面泛白过曝)
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            0.32,
            0.25,
            0.98
        );
        composer.addPass(bloomPass);

        // 3. 电影暗角通道 (Vignette Pass) - 聚焦中央箱庭
        const vignettePass = new ShaderPass(VignetteShader);
        vignettePass.uniforms['offset'].value = 1.08;
        vignettePass.uniforms['darkness'].value = 1.15;
        composer.addPass(vignettePass);
        composerRef.current = composer;

        // 控制器 (平滑阻尼 Damping，丝滑交互)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.maxPolarAngle = Math.PI / 2.05; // 避免沉入地平线之下
        controls.minDistance = 7;
        controls.maxDistance = 55;
        controls.target.set(0, 3.6, 0);
        controls.autoRotate = isAutoRotating;
        controls.autoRotateSpeed = 1.0;
        controlsRef.current = controls;

        // 灯光系统 (自然阳光主光 + 柔和天光 + 聚光补光)
        const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x475569, 0.45);
        scene.add(hemiLight);

        // 主太阳光 (投射高质量柔和 PCF 阴影)
        const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.05);
        sunLight.position.set(22, 34, 18);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 5;
        sunLight.shadow.camera.far = 80;
        sunLight.shadow.camera.left = -22;
        sunLight.shadow.camera.right = 22;
        sunLight.shadow.camera.top = 22;
        sunLight.shadow.camera.bottom = -22;
        sunLight.shadow.bias = -0.0002;
        scene.add(sunLight);

        // 侧后轮廓冷光 (Rim Light，营造立体雕塑感)
        const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.28);
        rimLight.position.set(-18, 30, -22);
        scene.add(rimLight);

        // 柔和前侧暖补光 (Fill Light)
        const fillLight = new THREE.DirectionalLight(0xfef3c7, 0.32);
        fillLight.position.set(0, 14, 26);
        scene.add(fillLight);

        // 点光源：火塘/燎祭神火
        const fireLight = new THREE.PointLight(0xf97316, 1.8, 16, 1.2);
        fireLight.position.set(0, 1.5, 0);
        fireLight.castShadow = true;
        scene.add(fireLight);
        fireLightRef.current = fireLight;

        // 点光源：大玉琮王神圣碧翠荧光
        const jadeLight = new THREE.PointLight(0x34d399, 2.0, 16, 1.0);
        jadeLight.position.set(0, 4.5, 3.5);
        scene.add(jadeLight);
        jadeLightRef.current = jadeLight;

        // 动画渲染循环
        let clock = new THREE.Clock();
        const animate = () => {
            animFrameRef.current = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            // 1. 驱动立体建筑箱庭的关键帧动力学动效 (巡航独木舟、山花炊烟、玉琮王自转、风吹羽毛与神幡)
            if (dioramaAnimatorRef.current?.updateAnimations) {
                dioramaAnimatorRef.current.updateAnimations(delta, elapsedTime);
            }

            // 2. 物理级联下坠重力动画 (构件飞入沙盘)
            const animMeshes = animMeshesRef.current;
            for (let i = 0; i < animMeshes.length; i++) {
                const mesh = animMeshes[i];
                if (!mesh || !mesh.userData.physicsAnim) continue;
                const anim = mesh.userData.physicsAnim;
                if (anim.settled) continue;

                if (elapsedTime < anim.startTime) {
                    mesh.visible = false;
                    continue;
                }
                mesh.visible = true;

                anim.velocity += 38 * delta; // 重力加速度
                anim.currentY -= anim.velocity * delta;

                if (anim.currentY <= anim.targetY) {
                    anim.currentY = anim.targetY;
                    if (anim.bounces < 2) {
                        anim.velocity = -anim.velocity * 0.32; // 弹性回弹
                        anim.bounces += 1;
                        if (anim.bounces === 1) {
                            spawnShockwave(mesh.position.x, anim.targetY, mesh.position.z, anim.isKeyPart ? 0xf59e0b : 0xe2e8f0);
                        }
                    } else {
                        anim.currentY = anim.targetY;
                        mesh.rotation.copy(anim.targetRot);
                        anim.settled = true;
                    }
                }
                mesh.position.y = anim.currentY;
            }

            // 3. 触地冲击波扩散消失
            const shockwaves = shockwavesRef.current;
            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i];
                sw.mesh.scale.x += delta * 4.5;
                sw.mesh.scale.y += delta * 4.5;
                sw.mat.opacity -= delta * 1.8;
                if (sw.mat.opacity <= 0) {
                    scene.remove(sw.mesh);
                    sw.mesh.geometry.dispose();
                    sw.mat.dispose();
                    shockwaves.splice(i, 1);
                }
            }

            // 4. 镜头焦点平滑插值
            controls.target.lerp(targetLookAtRef.current, 0.05);

            // 电影级呼吸微晃
            if (isCinematic) {
                const swayY = Math.sin(elapsedTime * 0.6) * 0.004;
                const swayX = Math.cos(elapsedTime * 0.45) * 0.003;
                camera.position.y += swayY;
                camera.position.x += swayX;
            }

            controls.update();

            // 双模式渲染：电影级后处理管线 vs 原生基础渲染
            if (isCinematic && composerRef.current) {
                composerRef.current.render();
            } else {
                renderer.render(scene, camera);
            }
        };
        animate();

        // 窗口自适应
        const handleResize = () => {
            if (!container || !renderer || !camera) return;
            const w = container.clientWidth || 800;
            const h = container.clientHeight || 600;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            if (composerRef.current) {
                composerRef.current.setSize(w, h);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            controls.dispose();
            if (composerRef.current) composerRef.current.dispose();
            if (renderTargetRef.current) renderTargetRef.current.dispose();
            if (pmremGeneratorRef.current) pmremGeneratorRef.current.dispose();
            if (roomEnvRef.current) roomEnvRef.current.dispose();
            renderer.dispose();
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // 落地冲击波光环发生器
    const spawnShockwave = (x, y, z, colorHex) => {
        const scene = sceneRef.current;
        if (!scene) return;
        const ringGeo = new THREE.RingGeometry(0.2, 0.65, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.set(x, y + 0.05, z);
        scene.add(ringMesh);
        shockwavesRef.current.push({ mesh: ringMesh, mat: ringMat });
    };

    // 监听自转开关
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = isAutoRotating;
        }
    }, [isAutoRotating]);

    // 奇迹切换时智能匹配最佳箱庭观瞻视距与俯仰角度
    useEffect(() => {
        if (controlsRef.current && cameraRef.current) {
            if (wonderId === 'zhouyuan_temple') {
                cameraRef.current.position.set(26, 22, 28);
                controlsRef.current.target.set(0, 3.5, 0);
            } else if (wonderId === 'sanxingdui_shrine') {
                cameraRef.current.position.set(24, 20, 26);
                controlsRef.current.target.set(0, 3.2, 0.5);
            } else if (wonderId === 'erlitou_palace') {
                cameraRef.current.position.set(28, 22, 32);
                controlsRef.current.target.set(0, 3.2, 0);
            } else if (wonderId === 'liangzhu_altar') {
                cameraRef.current.position.set(24, 18, 28);
                controlsRef.current.target.set(0, 3.8, 0);
            } else {
                cameraRef.current.position.set(20, 16, 24);
                controlsRef.current.target.set(0, 3.2, 0);
            }
            controlsRef.current.update();
        }
    }, [wonderId]);

    // 重构 3D 几何模型 (奇迹切换、阶段进退、施工脚手架、动效重播)
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        // 清理旧对象 (保留灯光)
        const toRemove = [];
        scene.traverse((obj) => {
            if ((obj.isMesh || obj.isGroup) && !obj.isLight) {
                toRemove.push(obj);
            }
        });
        toRemove.forEach((obj) => scene.remove(obj));
        meshesMapRef.current.clear();
        animMeshesRef.current = [];
        shockwavesRef.current = [];
        dioramaAnimatorRef.current = null;

        // 初始化超清 PBR 纹理集
        const textures = {
            rammedEarth: createRammedEarthTextures(),
            thatch: createThatchTextures(),
            nanmuWood: createWoodTextures(true),
            oakWood: createWoodTextures(false),
            jadeCong: createJadeCongTextures(),
            pottery: createPaintedPotteryTextures(),
            stonePaver: createStonePaverTextures(),
            water: createWaterTextures(),
            bronze: createAncientBronzeTextures(),
            turquoise: createTurquoiseTextures(),
            goldFoil: createGoldFoilTextures(),
            sxdBronze: createSanxingduiBronzeTextures(),
            ivory: createIvoryTextures(),
            zhouTile: createZhouTileTextures()
        };
        waterTextureRef.current = textures.water;

        // 构件物理动效注册器
        const registerPhysicsMesh = (mesh, partId, stageIndex, orderInStage, isKeyPart = false) => {
            if (partId) {
                mesh.name = partId;
                meshesMapRef.current.set(partId, mesh);
            }
            const dropHeight = 15 + Math.random() * 4;
            const targetY = mesh.position.y;

            // 仅在 MeshStandardMaterial 上克隆独立材质实例并安全记录原始 emissive，杜绝共享材质高亮串扰
            mesh.traverse((node) => {
                if (node.isMesh && node.material && node.material.isMeshStandardMaterial) {
                    node.material = node.material.clone();
                    node.userData.originalEmissive = node.material.emissive.clone();
                    node.userData.originalEmissiveIntensity = node.material.emissiveIntensity;
                }
            });

            const isSettled = !isConstructing && animTrigger === 0;
            mesh.userData.physicsAnim = {
                targetY: targetY,
                dropHeight: dropHeight,
                currentY: isSettled ? targetY : targetY + dropHeight,
                velocity: 0,
                bounces: 0,
                settled: isSettled,
                startTime: isConstructing || animTrigger > 0 ? (stageIndex - 1) * 0.45 + orderInStage * 0.12 : 0,
                targetRot: mesh.rotation.clone(),
                isKeyPart: isKeyPart
            };
            mesh.position.y = isSettled ? targetY : targetY + dropHeight;
            mesh.visible = isSettled;
            animMeshesRef.current.push(mesh);
        };

        const buildProceduralWonder = () => {
            if (wonderId === 'zhouyuan_temple') {
                return buildZhouyuanDiorama({
                    scene,
                    stage,
                    isConstructing,
                    textures,
                    fireLight: fireLightRef.current,
                    jadeLight: jadeLightRef.current,
                    registerPhysicsMesh
                });
            } else if (wonderId === 'sanxingdui_shrine') {
                return buildSanxingduiDiorama({
                    scene,
                    stage,
                    isConstructing,
                    textures,
                    fireLight: fireLightRef.current,
                    jadeLight: jadeLightRef.current,
                    registerPhysicsMesh
                });
            } else if (wonderId === 'liangzhu_altar') {
                return buildLiangzhuDiorama({
                    scene,
                    stage,
                    isConstructing,
                    textures,
                    fireLight: fireLightRef.current,
                    jadeLight: jadeLightRef.current,
                    registerPhysicsMesh
                });
            } else if (wonderId === 'erlitou_palace') {
                return buildErlitouDiorama({
                    scene,
                    stage,
                    isConstructing,
                    textures,
                    fireLight: fireLightRef.current,
                    jadeLight: jadeLightRef.current,
                    registerPhysicsMesh
                });
            } else {
                return buildBanpoDiorama({
                    scene,
                    stage,
                    isConstructing,
                    textures,
                    fireLight: fireLightRef.current,
                    registerPhysicsMesh
                });
            }
        };

        if (modelSource === 'glb') {
            setIsLoadingModel(true);
            setLoadingProgress(0);
            let isCancelled = false;

            const runLoad = async () => {
                try {
                    let gltf;
                    if (customGlbFile) {
                        gltf = await parseGLTFFile(customGlbFile);
                    } else {
                        const bundledMap = {
                            liangzhu_altar: 'liangzhu_altar',
                            banpo_f1_hall: 'banpo_f1_hall',
                            banpo_hut: 'banpo_f1_hall',
                            erlitou_palace: 'erlitou_palace',
                            sanxingdui_shrine: 'sanxingdui_shrine',
                            zhouyuan_temple: 'zhouyuan_temple'
                        };
                        const bundledModel = bundledMap[wonderId] || 'banpo_f1_hall';
                        const bundledUrl = `/models/${bundledModel}.glb`;
                        gltf = await loadGLTFFromUrl(bundledUrl, (p) => {
                            if (!isCancelled) setLoadingProgress(p);
                        });
                    }
                    if (isCancelled) return;

                    // 分析 3D 资产拓扑元数据与零件匹配率
                    const allKnownPartIds = [
                        'part_bp_1_k', 'part_bp_1_r1', 'part_bp_1_r2', 'part_bp_1_r3', 'part_bp_1_r4',
                        'part_bp_2_k', 'part_bp_2_r1', 'part_bp_2_r2', 'part_bp_2_r3', 'part_bp_2_r4',
                        'part_bp_3_k', 'part_bp_3_r1', 'part_bp_3_r2', 'part_bp_3_r3', 'part_bp_3_r4',
                        'part_bp_4_k', 'part_bp_4_r1', 'part_bp_4_r2', 'part_bp_4_r3', 'part_bp_4_r4',
                        'part_lz_1_k1', 'part_lz_1_k2', 'part_lz_1_r1', 'part_lz_1_r2', 'part_lz_1_r3', 'part_lz_1_r4', 'part_lz_1_r5', 'part_lz_1_r6',
                        'part_lz_2_k1', 'part_lz_2_k2', 'part_lz_2_r1', 'part_lz_2_r2', 'part_lz_2_r3', 'part_lz_2_r4', 'part_lz_2_r5', 'part_lz_2_r6',
                        'part_lz_3_k1', 'part_lz_3_k2', 'part_lz_3_r1', 'part_lz_3_r2', 'part_lz_3_r3', 'part_lz_3_r4', 'part_lz_3_r5', 'part_lz_3_r6',
                        'part_lz_4_k1', 'part_lz_4_k2', 'part_lz_4_r1', 'part_lz_4_r2', 'part_lz_4_r3', 'part_lz_4_r4', 'part_lz_4_r5', 'part_lz_4_r6',
                        'part_lz_5_k1', 'part_lz_5_k2', 'part_lz_5_r1', 'part_lz_5_r2', 'part_lz_5_r3', 'part_lz_5_r4', 'part_lz_5_r5', 'part_lz_5_r6',
                        'part_elt_1_k', 'part_elt_1_r1', 'part_elt_1_r2', 'part_elt_1_r3', 'part_elt_1_r4',
                        'part_elt_2_k', 'part_elt_2_r1', 'part_elt_2_r2', 'part_elt_2_r3', 'part_elt_2_r4',
                        'part_elt_3_k', 'part_elt_3_r1', 'part_elt_3_r2', 'part_elt_3_r3', 'part_elt_3_r4',
                        'part_elt_4_k1', 'part_elt_4_k2', 'part_elt_4_r1', 'part_elt_4_r2', 'part_elt_4_r3',
                        'part_sxd_1_k1', 'part_sxd_1_k2', 'part_sxd_1_r1', 'part_sxd_1_r2', 'part_sxd_1_r3', 'part_sxd_1_r4', 'part_sxd_1_r5', 'part_sxd_1_r6',
                        'part_sxd_2_k1', 'part_sxd_2_k2', 'part_sxd_2_r1', 'part_sxd_2_r2', 'part_sxd_2_r3', 'part_sxd_2_r4', 'part_sxd_2_r5', 'part_sxd_2_r6',
                        'part_sxd_3_k1', 'part_sxd_3_k2', 'part_sxd_3_r1', 'part_sxd_3_r2', 'part_sxd_3_r3', 'part_sxd_3_r4', 'part_sxd_3_r5', 'part_sxd_3_r6',
                        'part_sxd_4_k1', 'part_sxd_4_k2', 'part_sxd_4_r1', 'part_sxd_4_r2', 'part_sxd_4_r3', 'part_sxd_4_r4', 'part_sxd_4_r5', 'part_sxd_4_r6',
                        'part_sxd_5_k1', 'part_sxd_5_k2', 'part_sxd_5_r1', 'part_sxd_5_r2', 'part_sxd_5_r3', 'part_sxd_5_r4', 'part_sxd_5_r5', 'part_sxd_5_r6',
                        'part_zy_1_k', 'part_zy_1_r1', 'part_zy_1_r2', 'part_zy_1_r3', 'part_zy_1_r4',
                        'part_zy_2_k', 'part_zy_2_r1', 'part_zy_2_r2', 'part_zy_2_r3', 'part_zy_2_r4',
                        'part_zy_3_k', 'part_zy_3_r1', 'part_zy_3_r2', 'part_zy_3_r3', 'part_zy_3_r4',
                        'part_zy_4_k1', 'part_zy_4_k2', 'part_zy_4_r1', 'part_zy_4_r2', 'part_zy_4_r3'
                    ];
                    const currentWonderPartIds = allKnownPartIds.filter(id => {
                        if (wonderId === 'zhouyuan_temple') return id.startsWith('part_zy_');
                        if (wonderId === 'sanxingdui_shrine') return id.startsWith('part_sxd_');
                        if (wonderId === 'erlitou_palace') return id.startsWith('part_elt_');
                        if (wonderId === 'liangzhu_altar') return id.startsWith('part_lz_');
                        return id.startsWith('part_bp_');
                    });
                    const stats = inspectGLTFModel(gltf, currentWonderPartIds);
                    setGlbStats(stats);

                    // 拓扑归一化、居中与注册零件映射
                    const model = normalizeAndConfigureGLTF(gltf, {
                        targetSpan: 18.0,
                        meshesMap: meshesMapRef.current,
                        currentStage: stage
                    });
                    scene.add(model);
                    setIsLoadingModel(false);
                    const defaultDisplayName = wonderId === 'zhouyuan_temple' ? '周原岐邑凤雏周庙.glb' : wonderId === 'sanxingdui_shrine' ? '三星堆青铜神庙.glb' : wonderId === 'liangzhu_altar' ? '良渚莫角山神台.glb' : wonderId === 'erlitou_palace' ? '二里头一号宫殿.glb' : '半坡中央大草庐.glb';
                    setGlbNotice({ type: 'success', msg: `已加载工业级 3D 资产: ${customGlbName || defaultDisplayName}` });
                    setTimeout(() => setGlbNotice(null), 4000);
                } catch (err) {
                    if (isCancelled) return;
                    console.warn('GLB load failed, falling back to procedural engine:', err);
                    setIsLoadingModel(false);
                    setGlbNotice({ type: 'fallback', msg: '外部 GLB 资产暂未预置，已自动无缝平滑切至高精程序化沙盘' });
                    setTimeout(() => setGlbNotice(null), 4000);
                    // fallback to procedural diorama
                    dioramaAnimatorRef.current = buildProceduralWonder();
                }
            };
            runLoad();
            return () => { isCancelled = true; };
        } else {
            // 程序化高精立体建筑箱庭模式 (Littlest Tokyo 级微缩建模与动效)
            dioramaAnimatorRef.current = buildProceduralWonder();
        }
    }, [wonderId, stage, isConstructing, animTrigger, modelSource, customGlbFile]);

    // 零件悬停高亮与微放大联动
    useEffect(() => {
        if (!activePartId) {
            meshesMapRef.current.forEach((mesh) => {
                mesh.traverse((node) => {
                    if (node.isMesh && node.material && node.userData.originalEmissive) {
                        node.material.emissive.copy(node.userData.originalEmissive);
                        node.material.emissiveIntensity = node.userData.originalEmissiveIntensity ?? 0;
                    }
                });
                mesh.scale.set(1, 1, 1);
            });
            return;
        }

        const targetMesh = meshesMapRef.current.get(activePartId);
        if (targetMesh) {
            targetMesh.traverse((node) => {
                if (node.isMesh && node.material && node.material.isMeshStandardMaterial) {
                    node.material.emissive.setHex(0xf59e0b); // 尊贵流金高亮
                    node.material.emissiveIntensity = 2.4; // 触发 UnrealBloom 漫射光晕
                }
            });
            targetMesh.scale.set(1.08, 1.08, 1.08); // 零件轻微放大突出
        }

        return () => {
            if (targetMesh) {
                targetMesh.traverse((node) => {
                    if (node.isMesh && node.material && node.userData.originalEmissive) {
                        node.material.emissive.copy(node.userData.originalEmissive);
                        node.material.emissiveIntensity = node.userData.originalEmissiveIntensity ?? 0;
                    }
                });
                targetMesh.scale.set(1, 1, 1);
            }
        };
    }, [activePartId]);

    // 处理用户选择本地自定义 .glb 文件
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCustomGlbFile(file);
        setCustomGlbName(file.name);
        setModelSource('glb');
    };

    // 处理一键导出当前场景为 .glb 文件并下载
    const handleExportGLB = async () => {
        const scene = sceneRef.current;
        if (!scene) return;
        try {
            const exportRoot = new THREE.Group();
            scene.children.forEach(c => {
                if (c.isMesh || c.isGroup) {
                    exportRoot.add(c.clone());
                }
            });
            const glbBuffer = await exportObjectToGLB(exportRoot);
            const defaultName = `${wonderId === 'zhouyuan_temple' ? '周原岐邑凤雏周庙' : wonderId === 'sanxingdui_shrine' ? '三星堆古蜀青铜神庙' : wonderId === 'liangzhu_altar' ? '良渚莫角山神台' : wonderId === 'erlitou_palace' ? '二里头夏都一号宫殿' : '半坡中央大草庐'}_Stage${stage}.glb`;
            downloadGLBFile(glbBuffer, defaultName);
            setGlbNotice({ type: 'success', msg: `已成功导出标准 3D 资产: ${defaultName}` });
            setTimeout(() => setGlbNotice(null), 4000);
        } catch (err) {
            console.error('Export GLB error:', err);
            setGlbNotice({ type: 'error', msg: `导出 GLB 失败: ${err.message}` });
            setTimeout(() => setGlbNotice(null), 4000);
        }
    };

    // 自动化管线导出挂钩
    useEffect(() => {
        window.__exportCurrentWonderGLB = async () => {
            const scene = sceneRef.current;
            if (!scene) return null;
            const exportRoot = new THREE.Group();
            scene.children.forEach(c => {
                if (c.isMesh || c.isGroup) {
                    exportRoot.add(c.clone());
                }
            });
            return await exportObjectToGLB(exportRoot);
        };
        return () => {
            delete window.__exportCurrentWonderGLB;
        };
    }, [wonderId, stage]);

    return (
        <div className={`relative ${className} overflow-hidden rounded-2xl bg-gradient-to-b from-stone-950 to-stone-900 shadow-2xl`}>
            {/* 3D WebGL 画布容器 */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* 隐藏的本地 GLB 文件选择器 */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".glb,.gltf"
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* 顶部中央状态浮窗 */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center space-y-2 z-10">
                {glbNotice && (
                    <div className={`px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg border transition-all animate-bounce ${
                        glbNotice.type === 'success' ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-200' :
                        glbNotice.type === 'error' ? 'bg-rose-950/85 border-rose-500/50 text-rose-200' :
                        'bg-amber-950/85 border-amber-500/50 text-amber-200'
                    }`}>
                        {glbNotice.msg}
                    </div>
                )}
            </div>

            {/* 左上角：GLTF / GLB 工业资产透视 HUD (进入 GLB 模式时显示) */}
            {modelSource === 'glb' && glbStats && (
                <div className="absolute top-4 left-4 p-3 rounded-xl bg-stone-900/85 border border-emerald-500/40 backdrop-blur-md text-stone-200 text-xs shadow-xl space-y-1 z-10 max-w-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-300 pb-1 border-b border-stone-800">
                        <span>📦 GLTF/GLB 资产透视</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            DRACO 硬件解压
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div><span className="text-stone-400">面数:</span> <span className="font-semibold text-amber-300">{(glbStats.triangleCount ?? glbStats.triangles ?? 0).toLocaleString()}</span></div>
                        <div><span className="text-stone-400">顶点:</span> <span className="font-semibold text-stone-200">{(glbStats.vertexCount ?? glbStats.vertices ?? 0).toLocaleString()}</span></div>
                        <div><span className="text-stone-400">材质:</span> <span className="font-semibold text-cyan-300">{glbStats.materialCount ?? 0}</span></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                        <span>零件契约匹配: <strong className="text-emerald-400">{glbStats.matchedParts?.length ?? glbStats.matchedPartsCount ?? 0} 件 ({glbStats.matchedRatio ?? 0}%)</strong></span>
                        <span>跨度: {glbStats.size?.x ?? glbStats.spanX ?? 0}m × {glbStats.size?.z ?? glbStats.spanZ ?? 0}m</span>
                    </div>
                </div>
            )}

            {/* 加载进度指示器 */}
            {isLoadingModel && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
                    <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-emerald-200">
                        正在硬件极速解压 3D 资产... {loadingProgress > 0 ? `${loadingProgress}%` : ''}
                    </p>
                </div>
            )}

            {/* 右上角：电影级渲染管线指示器 */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide bg-stone-900/80 text-stone-300 border border-stone-700/60 backdrop-blur-md flex items-center space-x-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>RoomEnvironment 展厅光照 · UnrealBloom + ACES Filmic + 4x MSAA</span>
                </span>
            </div>

            {/* 底部悬浮操控条 (双模式切换器、导入、导出、自转与重播) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 p-1.5 rounded-2xl bg-stone-900/85 border border-stone-700/80 backdrop-blur-md shadow-2xl z-20">
                {/* 视角控制提示 */}
                <div className="flex items-center space-x-2 px-2 text-[10px] text-stone-400 border-r border-stone-700/60 hidden sm:flex">
                    <span>🖱️ 旋转</span>
                    <span>·</span>
                    <span>滚轮缩放</span>
                    <span>·</span>
                    <span>平移</span>
                </div>

                {/* 模式切换器：🎨 程序化箱庭 vs 📦 GLB资产 */}
                <div className="flex bg-stone-950/80 p-0.5 rounded-xl border border-stone-700/60">
                    <button
                        data-mode-btn="procedural"
                        onClick={() => setModelSource('procedural')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                            modelSource === 'procedural'
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                        title="程序化沙盘模式：包含分阶段建造演进与物理重力坠落拼装"
                    >
                        <span>🎨 程序化箱庭</span>
                    </button>
                    <button
                        data-mode-btn="glb"
                        onClick={() => setModelSource('glb')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                            modelSource === 'glb'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                        title="GLB 高精资产模式：加载工业级二进制 3D 模型与拓扑透视"
                    >
                        <span>📦 GLB资产</span>
                    </button>
                </div>

                {/* 导入外部 .glb 文件 */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-sky-950/70 border border-sky-600/50 text-sky-300 hover:bg-sky-900/80 transition-all flex items-center space-x-1"
                    title="从本地导入任意 .glb / .gltf 3D 文件"
                >
                    <span>📁 导入 .glb</span>
                </button>

                {/* 导出当前场景为 .glb 文件 */}
                <button
                    onClick={handleExportGLB}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-950/70 border border-amber-600/50 text-amber-300 hover:bg-amber-900/80 transition-all flex items-center space-x-1"
                    title="将当前 3D 场景一键打包并下载为标准的二进制 .glb 文件"
                >
                    <span>💾 导出 .glb</span>
                </button>

                {/* 360° 自转展台开关 */}
                <button
                    onClick={() => setIsAutoRotating(!isAutoRotating)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1 ${
                        isAutoRotating
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-inner'
                            : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}
                >
                    <span>🔄 360° 自转: {isAutoRotating ? '开' : '关'}</span>
                </button>

                {/* 电影光效切换器 */}
                <button
                    onClick={() => setIsCinematic(!isCinematic)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1 ${
                        isCinematic
                            ? 'bg-purple-500/25 border-purple-500/60 text-purple-300 shadow-inner'
                            : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}
                    title="切换电影级后期合成管线 (UnrealBloom 呼吸辉光 + ACES Filmic)"
                >
                    <span>✨ 电影光效: {isCinematic ? '开' : '关'}</span>
                </button>

                {/* 重播坠落拼装 (仅在程序化模式有效) */}
                {modelSource === 'procedural' && (
                    <button
                        onClick={() => setAnimTrigger(prev => prev + 1)}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-800/90 border border-stone-600/80 text-amber-200 hover:bg-amber-600 hover:text-white transition-all shadow-md flex items-center space-x-1"
                    >
                        <span>🎬 重播坠落拼装</span>
                    </button>
                )}
            </div>
        </div>
    );
};
