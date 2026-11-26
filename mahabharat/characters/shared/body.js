/* The base body and the animations every character starts from. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL = new URL('./model/', import.meta.url).href, ANIMATIONS = new URL('./animations/', import.meta.url).href;
const loader = new GLTFLoader(), texLoader = new THREE.TextureLoader();
export const clips = {};

export async function loadClips(){
  for (const u of ['UAL1_Standard', 'UAL2_Standard']) (await loader.loadAsync(ANIMATIONS + u + '.glb')).animations.forEach(a => { clips[a.name] = a; });
}

/* a fresh copy of the base body with the light skin texture, optionally tinted */
export async function loadBody(tint){
  const root = (await loader.loadAsync(MODEL + 'Superhero_Male_FullBody.gltf')).scene;
  root.traverse(o => { if (!o.isMesh) return; o.frustumCulled = false; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
    if (m.name !== 'MI_Superhero_Male') return;
    const t = texLoader.load(MODEL + 'T_Superhero_Male_Light.png'); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; m.map = t;
    if (tint !== undefined) m.color = new THREE.Color(tint); }); });
  return root;
}
