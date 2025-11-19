import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';

// Game constants
const MOVE_AMOUNT = 12;
const BLOCK_HEIGHT = 2;

const Block = ({ block, isActive }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame(() => {
    if (isActive && block.state === 'active' && meshRef.current) {
      // Animate block movement
      const value = block.position[block.workingPlane];
      if (value > MOVE_AMOUNT || value < -MOVE_AMOUNT) {
        block.direction = block.direction > 0 ? block.speed : Math.abs(block.speed);
      }
      block.position[block.workingPlane] += block.direction;
      meshRef.current.position[block.workingPlane] = block.position[block.workingPlane];
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[block.position.x + block.dimension.width / 2, block.position.y + block.dimension.height / 2, block.position.z + block.dimension.depth / 2]}
    >
      <boxGeometry args={[block.dimension.width, block.dimension.height, block.dimension.depth]} />
      <meshToonMaterial ref={materialRef} color={block.color} />
    </mesh>
  );
};

const TowerGameScene = ({ blocks, placedBlocks, onCameraUpdate }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (onCameraUpdate && blocks.length > 0) {
      const targetY = blocks.length * 2 + 4;
      gsap.to(camera.position, {
        y: targetY,
        duration: 0.3,
        ease: 'power1.inOut'
      });
    }
  }, [blocks.length, camera, onCameraUpdate]);

  return (
    <>
      <directionalLight position={[0, 499, 0]} intensity={0.5} />
      <ambientLight intensity={0.4} />

      {/* Rendered placed blocks */}
      {placedBlocks.map((mesh, index) => (
        <primitive key={`placed-${index}`} object={mesh} />
      ))}

      {/* Active block */}
      {blocks.length > 0 && (
        <Block block={blocks[blocks.length - 1]} isActive={true} />
      )}
    </>
  );
};

const TowerGame = ({ onComplete, difficulty = 'medium', gameMode = 'score' }) => {
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'ended'
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [placedBlocks, setPlacedBlocks] = useState([]);
  const [choppedBlocks, setChoppedBlocks] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [combo, setCombo] = useState(0);
  const [perfectPlacements, setPerfectPlacements] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [targetScore, setTargetScore] = useState(20);

  const timerRef = useRef(null);
  const blocksRef = useRef(blocks);
  const placedBlocksRef = useRef(placedBlocks);

  // Update refs when state changes
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    placedBlocksRef.current = placedBlocks;
  }, [placedBlocks]);

  // Difficulty settings
  const difficultySettings = {
    easy: { timeLimit: 90, scoreTarget: 15, speedMultiplier: 0.7 },
    medium: { timeLimit: 60, scoreTarget: 20, speedMultiplier: 1.0 },
    hard: { timeLimit: 45, scoreTarget: 30, speedMultiplier: 1.3 }
  };

  const settings = difficultySettings[difficulty];

  // Create a new block
  const createBlock = useCallback((targetBlock) => {
    const index = (targetBlock ? targetBlock.index : 0) + 1;
    const workingPlane = index % 2 ? 'x' : 'z';
    const workingDimension = index % 2 ? 'width' : 'depth';

    const dimension = {
      width: targetBlock ? targetBlock.dimension.width : 10,
      height: targetBlock ? targetBlock.dimension.height : BLOCK_HEIGHT,
      depth: targetBlock ? targetBlock.dimension.depth : 10
    };

    const position = {
      x: targetBlock ? targetBlock.position.x : 0,
      y: BLOCK_HEIGHT * index,
      z: targetBlock ? targetBlock.position.z : 0
    };

    // Set initial position on working plane
    if (index > 1) {
      position[workingPlane] = Math.random() > 0.5 ? -MOVE_AMOUNT : MOVE_AMOUNT;
    }

    const colorOffset = targetBlock ? targetBlock.colorOffset : Math.round(Math.random() * 100);

    let color;
    if (!targetBlock) {
      color = new THREE.Color(0x333344);
    } else {
      const offset = index + colorOffset;
      const r = Math.sin(0.3 * offset) * 55 + 200;
      const g = Math.sin(0.3 * offset + 2) * 55 + 200;
      const b = Math.sin(0.3 * offset + 4) * 55 + 200;
      color = new THREE.Color(r / 255, g / 255, b / 255);
    }

    const speed = (-0.1 - (index * 0.005)) * settings.speedMultiplier;
    const clampedSpeed = Math.max(speed, -4);

    return {
      index,
      workingPlane,
      workingDimension,
      dimension,
      position,
      colorOffset,
      color,
      state: index > 1 ? 'active' : 'stopped',
      speed: clampedSpeed,
      direction: clampedSpeed
    };
  }, [settings.speedMultiplier]);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setPerfectPlacements(0);
    setTimeLeft(settings.timeLimit);
    setTargetScore(settings.scoreTarget);

    // Create base block
    const baseBlock = createBlock(null);
    setBlocks([baseBlock]);
    setPlacedBlocks([]);
    setChoppedBlocks([]);

    // Add first active block
    setTimeout(() => {
      const newBlock = createBlock(baseBlock);
      setBlocks(prev => [...prev, newBlock]);
    }, 100);
  }, [createBlock, settings]);

  // Place block
  const placeBlock = useCallback(() => {
    if (blocks.length === 0) return;

    const currentBlock = blocks[blocks.length - 1];
    if (!currentBlock || currentBlock.state !== 'active') return;

    const targetBlock = blocks[blocks.length - 2];
    if (!targetBlock) return;

    // Calculate overlap
    const overlap = targetBlock.dimension[currentBlock.workingDimension] -
      Math.abs(currentBlock.position[currentBlock.workingPlane] - targetBlock.position[currentBlock.workingPlane]);

    if (overlap > 0) {
      // Perfect placement bonus
      let isPerfect = false;
      if (targetBlock.dimension[currentBlock.workingDimension] - overlap < 0.3) {
        isPerfect = true;
        setPerfectPlacements(prev => prev + 1);
        setCombo(prev => prev + 1);
      }

      // Update current block
      const updatedBlock = { ...currentBlock };
      updatedBlock.state = 'stopped';

      if (isPerfect) {
        // Perfect placement - keep full size
        updatedBlock.position.x = targetBlock.position.x;
        updatedBlock.position.z = targetBlock.position.z;
        updatedBlock.dimension.width = targetBlock.dimension.width;
        updatedBlock.dimension.depth = targetBlock.dimension.depth;
      } else {
        // Partial placement - trim excess
        updatedBlock.dimension[currentBlock.workingDimension] = overlap;
        if (updatedBlock.position[currentBlock.workingPlane] < targetBlock.position[currentBlock.workingPlane]) {
          updatedBlock.position[currentBlock.workingPlane] = targetBlock.position[currentBlock.workingPlane];
        }
      }

      // Create placed mesh
      const geometry = new THREE.BoxGeometry(
        updatedBlock.dimension.width,
        updatedBlock.dimension.height,
        updatedBlock.dimension.depth
      );
      geometry.translate(
        updatedBlock.dimension.width / 2,
        updatedBlock.dimension.height / 2,
        updatedBlock.dimension.depth / 2
      );
      const material = new THREE.MeshToonMaterial({ color: updatedBlock.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(updatedBlock.position.x, updatedBlock.position.y, updatedBlock.position.z);

      setPlacedBlocks(prev => [...prev, mesh]);
      setScore(prev => prev + 1);

      // Add next block
      const nextBlock = createBlock(updatedBlock);
      setBlocks(prev => [...prev.slice(0, -1), updatedBlock, nextBlock]);
    } else {
      // Missed placement - end game
      setGameState('ended');
    }
  }, [blocks, createBlock]);

  // Handle space bar / click
  useEffect(() => {
    const handleAction = (e) => {
      if (e.type === 'keydown' && e.code !== 'Space') return;

      if (gameState === 'ready') {
        startGame();
      } else if (gameState === 'playing') {
        placeBlock();
      } else if (gameState === 'ended') {
        // Will be handled by the end screen button
      }
    };

    window.addEventListener('keydown', handleAction);
    window.addEventListener('click', handleAction);

    return () => {
      window.removeEventListener('keydown', handleAction);
      window.removeEventListener('click', handleAction);
    };
  }, [gameState, startGame, placeBlock]);

  // Timer countdown (for time-based mode)
  useEffect(() => {
    if (gameState !== 'playing' || gameMode !== 'time') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('ended');
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, gameMode]);

  // Check win condition for score mode
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'score' && score >= targetScore) {
      setGameState('ended');
    }
  }, [score, targetScore, gameState, gameMode]);

  // Calculate rewards
  const getRewards = () => {
    const baseGold = score * 5;
    const perfectBonus = perfectPlacements * 10;
    const comboBonus = combo > 5 ? combo * 5 : 0;

    const baseXP = score * 2;
    const perfectXPBonus = perfectPlacements * 5;

    const tier = score >= targetScore ? 'gold' : score >= targetScore * 0.7 ? 'silver' : 'bronze';

    return {
      gold: baseGold + perfectBonus + comboBonus,
      xp: baseXP + perfectXPBonus,
      tier
    };
  };

  const endGame = () => {
    const rewards = getRewards();
    onComplete?.(rewards);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.2) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255,255,255,0.2) 2px, transparent 2px)
          `,
          backgroundSize: '40px 40px',
          animation: 'gridSlide 20s linear infinite'
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="bg-white nb-border px-6 py-3">
            <span className="text-2xl font-black">SCORE: {score}</span>
          </div>

          {gameMode === 'time' && (
            <div className="bg-white nb-border px-6 py-3">
              <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : ''}`}>
                TIME: {timeLeft}s
              </span>
            </div>
          )}

          {gameMode === 'score' && (
            <div className="bg-white nb-border px-6 py-3">
              <span className="text-2xl font-black">
                TARGET: {score}/{targetScore}
              </span>
            </div>
          )}

          {combo > 2 && (
            <div className="bg-yellow-400 nb-border px-6 py-3 animate-bounce">
              <span className="text-2xl font-black">🔥 x{combo} COMBO!</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 bg-white nb-border hover:translate-y-1 transition-transform"
        >
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas>
          <OrthographicCamera
            makeDefault
            position={[2, 6, 2]}
            zoom={30}
            near={-100}
            far={1000}
          />
          <TowerGameScene
            blocks={blocks}
            placedBlocks={placedBlocks}
            onCameraUpdate={true}
          />
        </Canvas>

        {/* Instructions overlay */}
        {gameState === 'playing' && score < 5 && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-white nb-border p-6 text-center animate-fadeIn">
            <p className="text-2xl font-black">
              Click or press SPACE to place the block!
            </p>
          </div>
        )}
      </div>

      {/* Ready screen overlay */}
      {gameState === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white nb-border p-12 text-center max-w-2xl animate-fadeIn">
            <h1 className="text-6xl font-black mb-6">TOWER STACK</h1>
            <p className="text-2xl mb-6">
              Stack blocks perfectly to build the tallest tower!
            </p>

            <div className="bg-gray-100 nb-border p-6 mb-8">
              <h3 className="text-xl font-black mb-4">GOAL</h3>
              {gameMode === 'time' ? (
                <p className="text-lg">Stack as many blocks as you can in <span className="font-black text-blue-600">{settings.timeLimit} seconds</span>!</p>
              ) : (
                <p className="text-lg">Reach <span className="font-black text-green-600">{settings.scoreTarget} blocks</span> to win!</p>
              )}
            </div>

            <p className="text-lg mb-8 text-gray-600">
              💎 Perfect placements earn bonus rewards!<br />
              🔥 Build combos for extra gold!
            </p>

            <button
              onClick={startGame}
              className="px-12 py-6 bg-green-500 text-white text-3xl font-black nb-border hover:translate-y-1 transition-transform"
            >
              START BUILDING!
            </button>
          </div>
        </div>
      )}

      {/* Game over screen */}
      {gameState === 'ended' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white nb-border p-12 text-center max-w-2xl animate-fadeIn">
            <h2 className="text-5xl font-black mb-6">
              {score >= targetScore ? '🏆 VICTORY!' :
               score >= targetScore * 0.7 ? '🥈 GREAT JOB!' :
               '🥉 NICE TRY!'}
            </h2>

            <div className="text-7xl font-black text-blue-600 mb-8">
              {score} BLOCKS
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-yellow-100 nb-border p-6">
                <p className="text-lg font-bold text-gray-600">GOLD EARNED</p>
                <p className="text-4xl font-black text-yellow-600">
                  +{getRewards().gold}
                </p>
              </div>
              <div className="bg-blue-100 nb-border p-6">
                <p className="text-lg font-bold text-gray-600">XP EARNED</p>
                <p className="text-4xl font-black text-blue-600">
                  +{getRewards().xp}
                </p>
              </div>
            </div>

            {perfectPlacements > 0 && (
              <div className="bg-purple-100 nb-border p-4 mb-6">
                <p className="text-xl font-black">
                  💎 {perfectPlacements} PERFECT {perfectPlacements === 1 ? 'PLACEMENT' : 'PLACEMENTS'}!
                </p>
              </div>
            )}

            <button
              onClick={endGame}
              className="px-12 py-6 bg-green-500 text-white text-3xl font-black nb-border hover:translate-y-1 transition-transform"
            >
              COLLECT REWARDS
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gridSlide {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(40px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TowerGame;
