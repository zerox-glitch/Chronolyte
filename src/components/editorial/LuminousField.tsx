import { useEffect, useRef } from 'react';
import { useMotionPaused } from './MotionPreferences';

// Decorative, progressively enhanced artwork. The CSS background remains if WebGL is unavailable.
export function LuminousField() {
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
 vec2 uv=gl_FragCoord.xy/resolution; vec2 p=uv-.5; p.x*=resolution.x/resolution.y;
 float t=time*.12; vec2 q=p; q.x+=.12*sin(p.y*4.+t); q.y+=.12*sin(p.x*3.-t*.7);
 float shape=length(vec2(q.x*1.05,q.y*1.5));
 float wave=sin(q.x*16.+q.y*5.+2.*sin(q.y*7.-t)+t);
 float ribbon=exp(-abs(shape-.30-.035*wave)*18.);
 float glow=exp(-abs(shape-.30)*5.);
 vec3 ink=vec3(.035,.042,.047); vec3 ember=vec3(1.,.22,.055); vec3 pale=vec3(1.,.72,.43);
 vec3 col=ink+ember*glow*.24+mix(ember,pale,.5+.5*sin(q.y*8.+t))*ribbon*.85;
 col+=vec3(.12,.08,.055)*exp(-length(p-pointer*.18)*5.);
 col+=.025*sin((uv.x+uv.y)*400.); gl_FragColor=vec4(col,1.);
}`);
    if (!vert || !frag) return; const program = gl.createProgram(); if (!program) return; gl.attachShader(program, vert); gl.attachShader(program, frag); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return; gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW); const pos = gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const resolution = gl.getUniformLocation(program,'resolution'), time = gl.getUniformLocation(program,'time'), pointer = gl.getUniformLocation(program,'pointer');
    let frame = 0, visible = true, tab = !document.hidden, elapsed = 0, last = 0, x = 0, y = 0;
    const draw = (stamp = 0) => { frame = 0; if (!visible || !tab) return; const dpr = Math.min(window.devicePixelRatio || 1, 1.5); const width = Math.max(1, Math.floor(el.clientWidth*dpr)), height = Math.max(1, Math.floor(el.clientHeight*dpr)); if (el.width !== width || el.height !== height) { el.width=width; el.height=height; gl.viewport(0,0,width,height); } if (last && !paused) elapsed += Math.min(stamp-last, 50)/1000; last=stamp; gl.uniform2f(resolution,width,height); gl.uniform1f(time,elapsed); gl.uniform2f(pointer,x,y); gl.drawArrays(gl.TRIANGLES,0,6); if (!paused) frame=requestAnimationFrame(draw); };
    const start = () => { last=0; if (!frame && visible && tab) frame=requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame=0; } }); observer.observe(el);
    const visibility = () => { tab=!document.hidden; if (tab) start(); else { cancelAnimationFrame(frame); frame=0; } }; document.addEventListener('visibilitychange',visibility);
    const move = (e: PointerEvent) => { const r=el.getBoundingClientRect(); x=(e.clientX-r.left)/r.width-.5; y=.5-(e.clientY-r.top)/r.height; }; el.addEventListener('pointermove',move);
    const resize = () => start(); window.addEventListener('resize',resize); start();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange',visibility); el.removeEventListener('pointermove',move); window.removeEventListener('resize',resize); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vert); gl.deleteShader(frag); };
  }, [paused]);
  return <div className="luminous-field" aria-hidden="true"><canvas ref={canvas}/><div className="luminous-field__top"><span>CHRONOLYTE / DIGITAL STUDIO</span><span>EST. FOR WHAT'S NEXT</span></div><div className="luminous-field__bottom"><span>IDEAS<br/>IN MOTION<span className="luminous-dot">✳</span></span><span>DESIGN × TECHNOLOGY<br/>INDEPENDENT BY NATURE</span></div></div>;
}
