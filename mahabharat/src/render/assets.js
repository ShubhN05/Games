/* Loading the shared body model and animation clips. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ASSETS } from '../shared/yudh.js';

const loader = new GLTFLoader(), texLoader = new THREE.TextureLoader();
export const clips = {};

export async function loadClips(){
  for (const u of ['UAL1_Standard', 'UAL2_Standard']) (await loader.loadAsync(ASSETS + 'animations/' + u + '.glb')).animations.forEach(a => { clips[a.name] = a; });
}

/* a fresh copy of the base body with the light skin texture, optionally tinted */
export async function loadBody(tint){
  const root = (await loader.loadAsync(ASSETS + 'characters/Superhero_Male_FullBody.gltf')).scene;
  root.traverse(o => { if (!o.isMesh) return; o.frustumCulled = false; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
    if (m.name !== 'MI_Superhero_Male') return;
    const t = texLoader.load(ASSETS + 'characters/T_Superhero_Male_Light.png'); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; m.map = t;
    if (tint !== undefined) m.color = new THREE.Color(tint); }); });
  return root;
}
