import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  width: 100%;
  height: 500px;
  background: #1a1a1a;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  border: 2px solid #e63946;
  box-shadow: 0 0 20px rgba(230, 57, 70, 0.3);
`;

const GameCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const GameControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 10px;
  color: white;
  text-align: center;
  border: 1px solid #e63946;
`;

const WebSwingGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let spiderman = {
      x: 50,
      y: 250,
      width: 50,
      height: 50,
      velocityY: 0,
      isSwinging: false,
      webAnchor: null
    };

    const buildings = Array.from({ length: 5 }, (_, i) => ({
      x: 200 + i * 200,
      y: Math.random() * 200 + 100,
      width: 60,
      height: 300
    }));

    const keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      Space: false
    };

    const handleKeyDown = (e) => {
      if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
      }
    };

    const handleKeyUp = (e) => {
      if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const drawSpiderMan = () => {
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(spiderman.x, spiderman.y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw web line if swinging
      if (spiderman.isSwinging && spiderman.webAnchor) {
        ctx.beginPath();
        ctx.moveTo(spiderman.x, spiderman.y);
        ctx.lineTo(spiderman.webAnchor.x, spiderman.webAnchor.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const drawBuildings = () => {
      ctx.fillStyle = '#2c2c2c';
      buildings.forEach(building => {
        ctx.fillRect(building.x, building.y, building.width, building.height);
      });
    };

    const updateSpiderMan = () => {
      // Apply gravity
      if (!spiderman.isSwinging) {
        spiderman.velocityY += 0.5;
      }

      // Handle swinging physics
      if (spiderman.isSwinging && spiderman.webAnchor) {
        const dx = spiderman.webAnchor.x - spiderman.x;
        const dy = spiderman.webAnchor.y - spiderman.y;
        const angle = Math.atan2(dy, dx);
        const force = 0.2;
        
        spiderman.velocityY += Math.sin(angle) * force;
        spiderman.x += Math.cos(angle) * force * 10;
      }

      // Update position
      spiderman.y += spiderman.velocityY;
      spiderman.x += keys.ArrowRight ? 5 : keys.ArrowLeft ? -5 : 0;

      // Check for web attachment
      if (keys.Space && !spiderman.isSwinging) {
        const nearestBuilding = buildings.find(building => {
          const dx = building.x - spiderman.x;
          const dy = building.y - spiderman.y;
          return Math.sqrt(dx * dx + dy * dy) < 200;
        });

        if (nearestBuilding) {
          spiderman.isSwinging = true;
          spiderman.webAnchor = {
            x: nearestBuilding.x + nearestBuilding.width / 2,
            y: nearestBuilding.y
          };
        }
      }

      // Release web
      if (!keys.Space) {
        spiderman.isSwinging = false;
        spiderman.webAnchor = null;
      }

      // Boundary checks
      if (spiderman.y > canvas.height) {
        setGameOver(true);
      }
      if (spiderman.x < 0) spiderman.x = 0;
      if (spiderman.x > canvas.width) spiderman.x = canvas.width;
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawBuildings();
      updateSpiderMan();
      drawSpiderMan();
      
      setScore(prev => prev + 1);
      
      if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver]);

  return (
    <GameContainer>
      <GameCanvas ref={canvasRef} width={800} height={500} />
      <GameControls>
        <p>Score: {score}</p>
        <p>Controls: Arrow Keys to move, Space to web-swing</p>
        {gameOver && (
          <button
            onClick={() => {
              setGameOver(false);
              setScore(0);
            }}
            style={{
              background: '#e63946',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Play Again
          </button>
        )}
      </GameControls>
    </GameContainer>
  );
};

export default WebSwingGame; 