import React, { useRef, useEffect } from 'react';

export const AnimatedTitle = ({ text = "MYTHIC CAFE" }) => {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, hovering: false, hoverValue: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseRef.current.hovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.hovering = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    function compileShader(src, type) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vertexShaderSource = `
      attribute vec2 a_pos;
      attribute vec2 a_uv;
      varying vec2 v_uv;
      void main(){
        v_uv = a_uv;
        gl_Position = vec4(a_pos,0.0,1.0);
      }`;

    const fragmentShaderSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_text;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_hover;

      float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}  
      float noise(vec2 st){
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i+vec2(1.0,0.0));
        float c = random(i+vec2(0.0,1.0));
        float d = random(i+vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
      }

      void main(){
        vec2 correctedUV = vec2(v_uv.x, 1.0 - v_uv.y);
        
        float strength = smoothstep(0.2,1.0,correctedUV.y);
        float n = noise(vec2(correctedUV.x*5.0,(correctedUV.y*2.0 - u_time*0.6)*2.0));
        float melt = n*0.4*(correctedUV.y);
        
        float dist = distance(correctedUV, u_mouse);
        float hoverWave1 = sin(dist * 12.0 - u_time * 6.0) * 0.08 * u_hover * exp(-dist * 3.5);
        float hoverWave2 = sin(dist * 20.0 - u_time * 10.0) * 0.04 * u_hover * exp(-dist * 5.0);
        float hoverWave = hoverWave1 + hoverWave2;
        
        vec2 hoverDistort = normalize(correctedUV - u_mouse) * hoverWave * (1.0 + sin(u_time * 2.0) * 0.1);
        
        vec2 finalUV = vec2(
          correctedUV.x + melt*0.3 + hoverDistort.x, 
          correctedUV.y - melt*0.8 + hoverDistort.y
        );

        vec4 col = texture2D(u_text, finalUV);
        
        if(col.a > 0.1){
          float glow = smoothstep(0.5,1.0,col.a);
          vec3 spectrumColor = vec3(
            correctedUV.y, 
            abs(sin(u_time + correctedUV.x * 5.0)), 
            1.0 - correctedUV.y
          );

          if(u_hover > 0.1){
            float hoverIntensity = 1.0 - smoothstep(0.0, 0.3, dist);
            float pulseEffect = 0.7 + 0.3 * sin(u_time * 4.0 + dist * 8.0);

            vec3 goldColor = vec3(
              0.9, 
              0.6 + 0.3 * pulseEffect,
              0.2 + 0.2 * sin(u_time * 3.0)
            );

            vec3 blueColor = vec3(
              0.3 + 0.4 * sin(u_time * 2.0 + dist * 6.0),
              0.6 + 0.3 * pulseEffect,
              0.9
            );

            spectrumColor = mix(spectrumColor, mix(goldColor, blueColor, 0.5), hoverIntensity * u_hover * 0.8);
            glow += hoverIntensity * u_hover * 0.8;
          }

          col.rgb = mix(col.rgb, spectrumColor, 0.6 * glow);

          if(u_hover > 0.1){
            float particles = noise(correctedUV * 15.0 + u_time * 2.0);
            if(particles > 0.85 && dist < 0.2){
              col.rgb += vec3(1.0, 0.8, 0.4) * (particles - 0.85) * 8.0 * u_hover;
            }

            float sparkles = noise(correctedUV * 30.0 + u_time * 4.0);
            if(sparkles > 0.92 && dist < 0.15){
              col.rgb += vec3(0.9, 0.9, 1.0) * (sparkles - 0.92) * 6.0 * u_hover;
            }
          }
        }

        if(u_hover > 0.1){
          float ambientGlow = 1.0 - smoothstep(0.0, 0.4, dist);
          float auraEffect = sin(dist * 6.0 - u_time * 3.0) * 0.2 + 0.8;

          vec3 auraColor = vec3(
            0.15 + 0.1 * sin(u_time * 1.5),
            0.1 + 0.1 * sin(u_time * 2.0 + 1.0),
            0.2 + 0.15 * sin(u_time * 1.2 + 2.0)
          );

          col.rgb += auraColor * ambientGlow * u_hover * auraEffect;

          float outerHalo = 1.0 - smoothstep(0.2, 0.5, dist);
          col.rgb += vec3(0.08, 0.04, 0.12) * outerHalo * u_hover * 0.3;
        }

        gl_FragColor = col;
      }`;

    const vs = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    
    if (!vs || !fs) {
      console.error('Failed to compile shaders');
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    const quad = new Float32Array([
      -1, -1, 0, 0,
      1, -1, 1, 0,
      -1, 1, 0, 1,
      1, 1, 1, 1
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const a_pos = gl.getAttribLocation(program, 'a_pos');
    const a_uv = gl.getAttribLocation(program, 'a_uv');

    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(a_uv);
    gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 16, 8);

    const u_time = gl.getUniformLocation(program, 'u_time');
    const u_text = gl.getUniformLocation(program, 'u_text');
    const u_mouse = gl.getUniformLocation(program, 'u_mouse');
    const u_hover = gl.getUniformLocation(program, 'u_hover');

    const textCanvas = document.createElement('canvas');
    const tctx = textCanvas.getContext('2d');
    textCanvas.width = 1200;
    textCanvas.height = 400;
    tctx.fillStyle = '#fff';
    tctx.font = 'bold 140px Arial';
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';
    tctx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);

    const textTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.uniform1i(u_text, 0);

    const hoverSpeed = 0.05;

    function draw(t) {
      const mouse = mouseRef.current;
      
      if (mouse.hovering && mouse.hoverValue < 1.0) {
        mouse.hoverValue = Math.min(1.0, mouse.hoverValue + hoverSpeed);
      } else if (!mouse.hovering && mouse.hoverValue > 0.0) {
        mouse.hoverValue = Math.max(0.0, mouse.hoverValue - hoverSpeed);
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.uniform1f(u_time, t * 0.001);
      gl.uniform2f(u_mouse, mouse.x, mouse.y);
      gl.uniform1f(u_hover, mouse.hoverValue);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(draw);
    }

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={400}
      className="max-w-full h-auto block cursor-pointer transition-transform duration-300 hover:scale-105"
      style={{ background: 'transparent' }}
    />
  );
};