import React, { useEffect, useRef } from 'react';

export const HeartsBackground = () => {
  const svgRef = useRef(null);
  const heartsRyRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Brighter colors that contrast well with purple background
    const colors = ["#ff1493", "#00ffff", "#00ff00", "#ffff00", "#ff6347", "#ff69b4"];
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SVG_XLINK = "http://www.w3.org/1999/xlink";

    const svg = svgRef.current;
    if (!svg) {
      console.log('HeartsBackground: SVG ref not found');
      return;
    }

    console.log('HeartsBackground: Initializing hearts animation');
    heartsRyRef.current = [];

    function useTheHeart(n) {
      const use = document.createElementNS(SVG_NS, 'use');
      use.n = n;
      use.setAttributeNS(SVG_XLINK, 'xlink:href', '#heart');
      use.setAttributeNS(null, 'transform', `scale(${use.n})`);
      use.setAttributeNS(null, 'fill', colors[n % colors.length]);
      use.setAttributeNS(null, 'stroke', '#ffffff');
      use.setAttributeNS(null, 'stroke-width', '2');
      use.setAttributeNS(null, 'x', -69);
      use.setAttributeNS(null, 'y', -69);
      use.setAttributeNS(null, 'width', 138);
      use.setAttributeNS(null, 'height', 138);

      heartsRyRef.current.push(use);
      svg.appendChild(use);
    }

    // Create hearts
    for (let n = 18; n >= 0; n--) {
      useTheHeart(n);
    }
    console.log(`HeartsBackground: Created ${heartsRyRef.current.length} hearts`);

    // Animation loop
    function Frame() {
      animationFrameRef.current = window.requestAnimationFrame(Frame);

      for (let i = 0; i < heartsRyRef.current.length; i++) {
        if (heartsRyRef.current[i].n < 18) {
          heartsRyRef.current[i].n += 0.01;
        } else {
          heartsRyRef.current[i].n = 0;
          svg.appendChild(heartsRyRef.current[i]);
        }
        heartsRyRef.current[i].setAttributeNS(null, 'transform', `scale(${heartsRyRef.current[i].n})`);
      }
    }

    Frame();
    console.log('HeartsBackground: Animation started');

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clear hearts
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      id="hearts"
      viewBox="-600 -400 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ zIndex: 0, opacity: 1, backgroundColor: 'rgba(255, 0, 0, 0.1)' }}
    >
      <defs>
        <symbol id="heart" viewBox="-69 -16 138 138">
          <path d="M0,12
                   C 50,-30 110,50  0,120
                   C-110,50 -50,-30 0,12z"/>
        </symbol>
      </defs>
      {/* Simple test elements that MUST be visible */}
      <circle cx="0" cy="0" r="100" fill="yellow" stroke="black" strokeWidth="5" />
      <rect x="-200" y="-200" width="400" height="400" fill="rgba(255, 0, 255, 0.5)" stroke="white" strokeWidth="10" />
      <text x="0" y="0" fontSize="48" fill="white" stroke="black" strokeWidth="2" textAnchor="middle">TEST</text>
    </svg>
  );
};
