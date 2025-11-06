import React, { useEffect, useRef } from 'react';

export const HeartsBackground = () => {
  const svgRef = useRef(null);
  const heartsRyRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const colors = ["#e03776", "#8f3e98", "#4687bf", "#3bab6f", "#f9c25e", "#f47274"];
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SVG_XLINK = "http://www.w3.org/1999/xlink";

    const svg = svgRef.current;
    if (!svg) return;

    heartsRyRef.current = [];

    function useTheHeart(n) {
      const use = document.createElementNS(SVG_NS, 'use');
      use.n = n;
      use.setAttributeNS(SVG_XLINK, 'xlink:href', '#heart');
      use.setAttributeNS(null, 'transform', `scale(${use.n})`);
      use.setAttributeNS(null, 'fill', colors[n % colors.length]);
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
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    >
      <defs>
        <symbol id="heart" viewBox="-69 -16 138 138">
          <path d="M0,12
                   C 50,-30 110,50  0,120
                   C-110,50 -50,-30 0,12z"/>
        </symbol>
      </defs>
    </svg>
  );
};
