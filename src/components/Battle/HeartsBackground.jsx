import React, { useEffect, useRef } from 'react';

export const HeartsBackground = () => {
  const svgRef = useRef(null);
  const heartsRyRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Original solid colors
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
      use.setAttributeNS(null, 'fill-opacity', '0.5');
      use.setAttributeNS(null, 'stroke', '#ffffff');
      use.setAttributeNS(null, 'stroke-width', '2');
      use.setAttributeNS(null, 'stroke-opacity', '0.6');
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
      // Clear only the dynamically created hearts, not all children
      heartsRyRef.current.forEach(heart => {
        if (heart.parentNode === svg) {
          svg.removeChild(heart);
        }
      });
      heartsRyRef.current = [];
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none" style={{ zIndex: -1 }}>
      {/* Background gradient - TEMPORARILY TRANSPARENT FOR TESTING */}
      <div className="absolute inset-0 w-full h-full" style={{ background: 'transparent' }}></div>

      {/* SVG Hearts on top of gradient */}
      <svg
        ref={svgRef}
        id="hearts"
        viewBox="-600 -400 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <symbol id="heart" viewBox="0 0 100 100">
            <path d="M50,90 C20,70 10,50 10,35 C10,25 15,15 25,15 C35,15 45,25 50,35 C55,25 65,15 75,15 C85,15 90,25 90,35 C90,50 80,70 50,90 Z" />
          </symbol>
        </defs>
      </svg>
    </div>
  );
};
