import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

/**
 * 【时空营造司 · 工业级 3D GLTF/GLB 资产载入管线】
 * 
 * 核心功能：
 * 1. 自动配置 DRACO 解码器 (本地 /draco/ 目录，0KB 外部网络依赖，支持压缩模型秒开)
 * 2. 异步载入外部 .glb / .gltf 文件并提供进度监控
 * 3. 支持前端拖拽或选择本地 .glb 文件并即时解析为三维场景
 * 4. 模型深度拓扑自适应：
 *    - 自动包围盒计算与居中缩放 (Normalize Bounding Box)
 *    - 阴影投影与接收 (Cast / Receive Shadows)
 *    - PBR 材质优化与自发光记录 (支持 UnrealBloom 呼吸辉光)
 *    - 构件树遍历与零件契约映射 (自动识别 part_lz_* 或 part_bp_* 节点)
 * 5. 模型质量与元数据分析器 (顶点数、面数、材质数、联动构件识别率)
 */

// 单例 DRACOLoader
let dracoLoaderInstance = null;
export function getDracoLoader() {
    if (!dracoLoaderInstance) {
        dracoLoaderInstance = new DRACOLoader();
        dracoLoaderInstance.setDecoderPath('/draco/');
        dracoLoaderInstance.setDecoderConfig({ type: 'js' });
    }
    return dracoLoaderInstance;
}

// 获取配置完毕的 GLTFLoader
export function createGLTFLoader() {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(getDracoLoader());
    return loader;
}

/**
 * 从 URL 载入 GLTF/GLB 模型
 */
export function loadGLTFFromUrl(url, onProgress) {
    return new Promise((resolve, reject) => {
        const loader = createGLTFLoader();
        loader.load(
            url,
            (gltf) => resolve(gltf),
            (xhr) => {
                if (onProgress && xhr.total > 0) {
                    const percent = Math.round((xhr.loaded / xhr.total) * 100);
                    onProgress(percent);
                }
            },
            (error) => reject(error)
        );
    });
}

/**
 * 从本地 File 对象或 ArrayBuffer 直接解析 GLB/GLTF (支持用户拖拽上传)
 */
export function parseGLTFFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const loader = createGLTFLoader();
            loader.parse(
                arrayBuffer,
                '',
                (gltf) => resolve(gltf),
                (err) => reject(err)
            );
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * 资产模型元数据分析器
 */
export function inspectGLTFModel(gltf, knownPartIds = []) {
    let triangleCount = 0;
    let vertexCount = 0;
    let meshCount = 0;
    const materialSet = new Set();
    const matchedParts = [];
    const allNodeNames = [];

    gltf.scene.traverse((node) => {
        if (node.name) allNodeNames.push(node.name);

        // 检查零件契约匹配 (支持 Mesh、Group 或任意已命名 Node)
        const candidateId = node.userData?.partId || node.name;
        if (candidateId) {
            if (knownPartIds.includes(candidateId) && !matchedParts.includes(candidateId)) {
                matchedParts.push(candidateId);
            } else {
                // 模糊匹配 (例如 "part_sxd_5_k1_mesh" 匹配 "part_sxd_5_k1")
                const matched = knownPartIds.find(id => candidateId.toLowerCase().includes(id.toLowerCase()));
                if (matched && !matchedParts.includes(matched)) {
                    matchedParts.push(matched);
                    node.userData.partId = matched;
                }
            }
        }

        if (node.isMesh) {
            meshCount++;
            if (node.geometry) {
                const geo = node.geometry;
                if (geo.index) {
                    triangleCount += geo.index.count / 3;
                } else if (geo.attributes.position) {
                    triangleCount += geo.attributes.position.count / 3;
                }
                if (geo.attributes.position) {
                    vertexCount += geo.attributes.position.count;
                }
            }
            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material.forEach((m) => materialSet.add(m));
                } else {
                    materialSet.add(node.material);
                }
            }
        }
    });

    // 计算世界空间包围盒
    const bbox = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    return {
        meshCount,
        triangleCount: Math.round(triangleCount),
        vertexCount,
        materialCount: materialSet.size,
        size: {
            x: parseFloat(size.x.toFixed(2)),
            y: parseFloat(size.y.toFixed(2)),
            z: parseFloat(size.z.toFixed(2))
        },
        matchedParts,
        matchedRatio: knownPartIds.length > 0 ? parseFloat(((matchedParts.length / knownPartIds.length) * 100).toFixed(1)) : 100,
        animationsCount: (gltf.animations || []).length
    };
}

/**
 * 模型归一化适配器：
 * 自动居中、自适应缩放到沙盘尺寸 (目标底盘直径约 targetSpan 左右)、配置 PBR 光影
 */
export function normalizeAndConfigureGLTF(gltf, {
    targetSpan = 18.0,
    meshesMap = null,
    currentStage = 5
} = {}) {
    const model = gltf.scene;

    // 1. 计算原始包围盒并自动居中、贴地
    const bbox = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    bbox.getCenter(center);
    bbox.getSize(size);

    // 最大跨度归一化
    const maxDim = Math.max(size.x, size.z, 0.1);
    const scale = targetSpan / maxDim;
    model.scale.set(scale, scale, scale);

    // 重新计算缩放后的底部，使其紧贴沙盘地面 y = 0
    const scaledBbox = new THREE.Box3().setFromObject(model);
    model.position.x = -center.x * scale;
    model.position.z = -center.z * scale;
    model.position.y = -scaledBbox.min.y;

    // 2. 深度遍历网格：开启阴影、记录材质原始 emissive、建立零件映射表
    model.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // 确保支持 Bloom 的 Standard 材质
            if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach(mat => {
                    if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                        mat.roughness = Math.min(1.0, Math.max(0.1, mat.roughness ?? 0.6));
                        mat.metalness = Math.min(1.0, Math.max(0.0, mat.metalness ?? 0.1));
                    }
                });
                if (node.material.isMeshStandardMaterial) {
                    node.userData.originalEmissive = node.material.emissive.clone();
                    node.userData.originalEmissiveIntensity = node.material.emissiveIntensity;
                }
            }

            // 注册到零件交互映射表
            const partId = node.userData.partId || node.name;
            if (partId && meshesMap) {
                meshesMap.set(partId, node);
            }

            // 阶段可见性管理 (如果节点标记了 stage)
            if (node.userData.stage !== undefined) {
                node.visible = node.userData.stage <= currentStage;
            }
        }
    });

    return model;
}

/**
 * 将场景对象导出为标准二进制 .glb 格式
 */
export function exportObjectToGLB(object3D) {
    return new Promise((resolve, reject) => {
        const exporter = new GLTFExporter();
        exporter.parse(
            object3D,
            (result) => {
                if (result instanceof ArrayBuffer) {
                    resolve(result);
                } else {
                    const output = JSON.stringify(result, null, 2);
                    resolve(new TextEncoder().encode(output).buffer);
                }
            },
            (error) => reject(error),
            { binary: true, embedImages: true }
        );
    });
}

/**
 * 触发浏览器本地下载 .glb 文件
 */
export function downloadGLBFile(arrayBuffer, filename = 'wonder_model.glb') {
    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
