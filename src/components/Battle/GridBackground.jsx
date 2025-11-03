import React from 'react';

export const GridBackground = ({ enemyType = 'normal' }) => {
  // Get colors based on enemy type
  const getColors = () => {
    switch (enemyType) {
      case 'elite':
        return {
          top: '#ff9500',
          mid: '#ffa520',
          bot: '#ffb740',
          grid: '#ffd580'
        };
      case 'boss':
        return {
          top: '#4d0000',
          mid: '#660000',
          bot: '#8b0000',
          grid: '#a00000'
        };
      default: // normal
        return {
          top: '#a2cef4',
          mid: '#ff6b6b',
          bot: '#6084d7',
          grid: '#ff8787'
        };
    }
  };

  const colors = getColors();

  return (
    <>
      <style>{`
        @keyframes planeMoveTop {
          from {
            background-position: 0px -100px, 0px 0px;
          }
          to {
            background-position: 0px 0px, 100px 0px;
          }
        }

        @keyframes planeMoveBot {
          from {
            background-position: 0px 0px, 0px 0px;
          }
          to {
            background-position: 0px -100px, 100px 0px;
          }
        }

        .grid-wrap {
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
          margin: 0 auto;
          perspective: 360px;
          perspective-origin: 50% 50%;
          pointer-events: none;
          z-index: -10;
        }

        .grid-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(${colors.top} 25%, ${colors.mid} 50%, ${colors.mid} 50%, ${colors.bot} 100%);
          z-index: -20;
        }

        .top-plane {
          width: 200%;
          height: 130%;
          position: absolute;
          bottom: -30%;
          left: -50%;
          background-image:
            linear-gradient(${colors.grid} 2px, transparent 2px),
            linear-gradient(90deg, ${colors.grid} 2px, transparent 2px);
          background-size: 100px 100px, 100px 100px;
          background-position: -1px -1px, -1px -1px;
          transform: rotateX(85deg);
          animation: planeMoveTop 2s infinite linear;
        }

        .bottom-plane {
          width: 200%;
          height: 130%;
          position: absolute;
          top: -30%;
          left: -50%;
          background-image:
            linear-gradient(${colors.grid} 2px, transparent 2px),
            linear-gradient(90deg, ${colors.grid} 2px, transparent 2px);
          background-size: 100px 100px, 100px 100px;
          background-position: -1px -1px, -1px -1px;
          transform: rotateX(-85deg);
          animation: planeMoveBot 2s infinite linear;
        }

        @media (max-height: 350px) {
          .grid-wrap {
            perspective: 210px;
          }
        }
      `}</style>

      <div className="grid-background" />
      <div className="grid-wrap">
        <div className="top-plane" />
        <div className="bottom-plane" />
      </div>
    </>
  );
};
