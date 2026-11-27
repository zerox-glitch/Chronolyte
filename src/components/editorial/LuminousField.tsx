import { useEffect, useRef, useState } from 'react';
import { useMotionPaused } from './MotionPreferences';

/** Decorative WebGL light field. A CSS background is used if WebGL is unavailable. */
export function LuminousField({ variant = 'hero', seed = 0 }: { variant?: 'hero' | 'section' | 'inner'; seed?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const paused = useMotionPaused();
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const el = canvas.current; if (!el) return;
    let gl: WebGLRenderingContext | null = null;
    try { gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch { return; }
    if (!gl) return;
    const shader = (type: number, source: string) => { const s = gl.createShader(type); if (!s) return null; gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; } return s; };
    const vert = shader(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}');
    const frag = shader(gl.FRAGMENT_SHADER, `precision mediump float;
uniform vec2 resolution; uniform float time; uniform vec2 pointer; uniform float scene; uniform float inner;
void main(){
 vec2 uv=gl_FragCoord.xy/resolution;
 float t=time*(inner > .5 ? .32 : .22);
 vec2 p=uv; p.x+=(pointer.x-.5)*.035; p.y+=(pointer.y-.5)*.035;
 float current = p.y - .51 + .20*sin(p.x*4.0 + t) + .09*sin(p.x*9.0 - t*.7);
 float current2 = p.y - .36 + .16*sin(p.x*3.2 - t*.65 + 1.6);
 float focus=smoothstep(.20,.8,p.x);
 float glow=exp(-abs(current)*6.0)*focus;
 float glow2=exp(-abs(current2)*8.0)*focus;
 float threads=0.0;
 for(int i=0;i<7;i++) { float n=float(i); float strand=current + .065*sin(p.x*(8.0+n*.9)+n*1.8+t*(.4+n*.08)) + (n-3.)*.018; threads += .004/(.008+abs(strand)); }
 vec3 ink=vec3(.035,.044,.045); vec3 rust=vec3(.80,.13,.035); vec3 gold=vec3(1.,.52,.19);
 vec3 col=ink+rust*glow*.42+gold*glow2*.15+mix(rust,gold,clamp(p.y,0.,1.))*threads*focus*.46;
 if(inner > .5) {
   vec2 u=uv; float pattern=mod(scene,4.); float identity=floor(scene/4.)/64.; float shift=pattern*.68+identity*2.0; float light=0.0;
   if(pattern < .5) {
     float w=u.y-.35-.16*sin(u.x*4.2+t+shift);
     light=exp(-abs(w)*12.)*(.55+.45*sin(u.x*15.-t)) + .20*exp(-abs(w+.035*sin(u.x*20.+t*3.))*75.);
   } else if(pattern < 1.5) {
     float w=u.y-.50-.20*sin(u.x*2.8-t*.65+shift);
     light=exp(-abs(w)*9.)*(.55+.45*cos(u.x*18.+u.y*6.+t)) + .17*exp(-abs(w+.05*sin(u.x*16.-t*2.))*65.);
   } else if(pattern < 2.5) {
     float w=u.y-.23-u.x*.35+.08*sin(u.x*7.+t+shift);
     light=exp(-abs(w)*10.)*(.6+.4*sin(u.x*24.-t)) + .18*exp(-abs(w+.05*sin(u.x*18.+t*2.))*70.);
   } else {
     float w=u.y-.62+.18*sin(u.x*5.-t*.8+shift);
     light=exp(-abs(w)*9.)*(.65+.35*cos((u.x-u.y)*15.+t)) + .18*exp(-abs(w+.045*cos(u.x*19.-t*2.))*75.);
   }
   float veil=smoothstep(.05,.90,u.x); light *= .8 + identity*.35;
   vec3 paper=vec3(.969,.969,.944);
   vec3 warm=vec3(.77,.39,.23);
   col=mix(paper,warm,clamp(light*veil*.36,0.,.32));
 }
 float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453); col+=(grain-.5)*(inner>.5?.008:.025);
 gl_FragColor=vec4(col,1.);
}`);
    if (!vert || !frag) return; const program = gl.createProgram(); if (!program) return; gl.attachShader(program, vert); gl.attachShader(program, frag); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return; gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW); const pos = gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const resolution = gl.getUniformLocation(program,'resolution'), time = gl.getUniformLocation(program,'time'), pointer = gl.getUniformLocation(program,'pointer'), scene = gl.getUniformLocation(program,'scene'), inner = gl.getUniformLocation(program,'inner');
    let frame = 0, visible = true, tab = !document.hidden, elapsed = 0, last = 0, x = .5, y = .5;
    const draw = (stamp = 0) => { frame = 0; if (!visible || !tab || gl.isContextLost()) return; const dpr = Math.min(window.devicePixelRatio || 1, 1.5); const width = Math.max(1, Math.floor(el.clientWidth*dpr)), height = Math.max(1, Math.floor(el.clientHeight*dpr)); if (el.width !== width || el.height !== height) { el.width=width; el.height=height; gl.viewport(0,0,width,height); } if (last && !paused) elapsed += Math.min(stamp-last, 50)/1000; last=stamp; gl.uniform2f(resolution,width,height); gl.uniform1f(time,elapsed); gl.uniform2f(pointer,x,y); gl.uniform1f(scene, seed % 256); gl.uniform1f(inner, variant === 'inner' ? 1 : 0); gl.drawArrays(gl.TRIANGLES,0,6); el.dataset.glReady = 'true'; if (!paused) frame=requestAnimationFrame(draw); };
    const start = () => { last=0; if (!frame && visible && tab) frame=requestAnimationFrame(draw); };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame=0; } }); observer?.observe(el);
    const lost = (event: Event) => { event.preventDefault(); delete el.dataset.glReady; cancelAnimationFrame(frame); frame=0; };
    const restored = () => setGeneration(value => value + 1);
    el.addEventListener('webglcontextlost', lost); el.addEventListener('webglcontextrestored', restored);
    const visibility = () => { tab=!document.hidden; if (tab) start(); else { cancelAnimationFrame(frame); frame=0; } }; document.addEventListener('visibilitychange',visibility);
    const move = (e: PointerEvent) => { const r=el.getBoundingClientRect(); x=(e.clientX-r.left)/r.width; y=1-(e.clientY-r.top)/r.height; }; if (!paused) window.addEventListener('pointermove',move, { passive: true });
    const resize = () => start(); window.addEventListener('resize',resize); start();
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); delete el.dataset.glReady; el.removeEventListener('webglcontextlost', lost); el.removeEventListener('webglcontextrestored', restored); document.removeEventListener('visibilitychange',visibility); window.removeEventListener('pointermove',move); window.removeEventListener('resize',resize); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vert); gl.deleteShader(frag); };
  }, [paused, seed, variant, generation]);
  return <div className={`luminous-field luminous-field--${variant}`} aria-hidden="true"><canvas ref={canvas}/></div>;
}
