import { useEffect, useRef } from 'react';
import { useMotionPaused } from './MotionPreferences';

/** Decorative WebGL light field. A CSS background is used if WebGL is unavailable. */
export function LuminousField({ variant = 'hero' }: { variant?: 'hero' | 'section' }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const paused = useMotionPaused();
  useEffect(() => {
    const el = canvas.current; if (!el) return;
    const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); if (!gl) return;
    const shader = (type: number, source: string) => { const s = gl.createShader(type); if (!s) return null; gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; } return s; };
    const vert = shader(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}');
    const frag = shader(gl.FRAGMENT_SHADER, `precision mediump float;
uniform vec2 resolution; uniform float time; uniform vec2 pointer;
void main(){
 vec2 uv=gl_FragCoord.xy/resolution;
 float t=time*.12;
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
 float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453); col+=(grain-.5)*.025;
 gl_FragColor=vec4(col,1.);
}`);
    if (!vert || !frag) return; const program = gl.createProgram(); if (!program) return; gl.attachShader(program, vert); gl.attachShader(program, frag); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return; gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW); const pos = gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const resolution = gl.getUniformLocation(program,'resolution'), time = gl.getUniformLocation(program,'time'), pointer = gl.getUniformLocation(program,'pointer');
    let frame = 0, visible = true, tab = !document.hidden, elapsed = 0, last = 0, x = .5, y = .5;
    const draw = (stamp = 0) => { frame = 0; if (!visible || !tab || gl.isContextLost()) return; const dpr = Math.min(window.devicePixelRatio || 1, 1.5); const width = Math.max(1, Math.floor(el.clientWidth*dpr)), height = Math.max(1, Math.floor(el.clientHeight*dpr)); if (el.width !== width || el.height !== height) { el.width=width; el.height=height; gl.viewport(0,0,width,height); } if (last && !paused) elapsed += Math.min(stamp-last, 50)/1000; last=stamp; gl.uniform2f(resolution,width,height); gl.uniform1f(time,elapsed); gl.uniform2f(pointer,x,y); gl.drawArrays(gl.TRIANGLES,0,6); if (!paused) frame=requestAnimationFrame(draw); };
    const start = () => { last=0; if (!frame && visible && tab) frame=requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame=0; } }); observer.observe(el);
    const visibility = () => { tab=!document.hidden; if (tab) start(); else { cancelAnimationFrame(frame); frame=0; } }; document.addEventListener('visibilitychange',visibility);
    const move = (e: PointerEvent) => { const r=el.getBoundingClientRect(); x=(e.clientX-r.left)/r.width; y=1-(e.clientY-r.top)/r.height; }; if (!paused) window.addEventListener('pointermove',move, { passive: true });
    const resize = () => start(); window.addEventListener('resize',resize); start();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange',visibility); window.removeEventListener('pointermove',move); window.removeEventListener('resize',resize); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vert); gl.deleteShader(frag); };
  }, [paused]);
  return <div className={`luminous-field luminous-field--${variant}`} aria-hidden="true"><canvas ref={canvas}/></div>;
}
