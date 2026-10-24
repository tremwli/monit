/* IndexedDB에 있는 사진을 id로 보여준다. 로드 전엔 tint 배경. */
import {useEffect,useState} from 'react';
import {getPhoto,cachedPhoto} from '../lib/photos.js';

export default function Photo({id,alt='',style,tint='#F2F4F6',className}){
 const [src,setSrc]=useState(()=>cachedPhoto(id));
 useEffect(()=>{let on=true;if(!id){setSrc(null);return}const c=cachedPhoto(id);if(c){setSrc(c);return}getPhoto(id).then(v=>{if(on)setSrc(v)});return()=>{on=false}},[id]);
 if(!src)return <div className={className} style={{background:tint,...style}} aria-hidden="true"/>;
 return <img className={className} src={src} alt={alt} style={{objectFit:'cover',display:'block',...style}}/>;
}
