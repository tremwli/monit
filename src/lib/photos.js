/* 사진 저장. localStorage는 용량이 작아서 IndexedDB에 넣는다.
   저장 전에 긴 변 1200px, JPEG 0.82로 줄여서 한 장에 100~250KB 정도로 맞춘다. */
const DB='monit-photos',STORE='photos';
let dbp=null;
function db(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return dbp}
function tx(mode,fn){return db().then(d=>new Promise((res,rej)=>{const t=d.transaction(STORE,mode);const req=fn(t.objectStore(STORE));t.oncomplete=()=>res(req&&req.result);t.onerror=()=>rej(t.error)}))}

const mem=new Map();
export function newPhotoId(){return 'ph'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

export function resizeImage(file,max=1200,quality=.82){return new Promise((res,rej)=>{
 const url=URL.createObjectURL(file);const img=new Image();
 img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height));const w=Math.round(img.width*s),h=Math.round(img.height*s);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',quality))};
 img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('이미지를 읽지 못했어요'))};img.src=url})}

export async function savePhoto(file){const dataUrl=await resizeImage(file);const id=newPhotoId();await tx('readwrite',s=>s.put(dataUrl,id));mem.set(id,dataUrl);return id}
export async function getPhoto(id){if(mem.has(id))return mem.get(id);const v=await tx('readonly',s=>s.get(id));if(v)mem.set(id,v);return v||null}
export async function deletePhotos(ids){await tx('readwrite',s=>{ids.forEach(id=>s.delete(id));return null});ids.forEach(id=>mem.delete(id))}
export function cachedPhoto(id){return mem.get(id)||null}
