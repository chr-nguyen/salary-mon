import React, { useState, useEffect, useRef } from 'react';
import { styled, keyframes, css } from 'styled-components';

const jumpAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-50px); }
  100% { transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  width: 100%;
  overflow: hidden;
  position: relative;
  ${props => props.$isJumping && css`
    animation: ${jumpAnimation} 0.5s ease-in-out;
  `}
`;

const DragonSvg = styled.svg`
  width: 400px;
  height: 400px;
  cursor: pointer;
  transition: transform 0.1s ease-out;

  /* Little bounce on hover */
  &:hover {
    transform: scale(1.02);
  }
`;

const DragonPuppet = ({ isJumping }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouthOpen, setMouthOpen] = useState(false);
  const containerRef = useRef(null);

  // Track mouse position relative to window for simplicity, or container
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate relative to the SVG center (approx)
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate eye pupil position
  // Constraint movement to keep pupils inside sclera
  const calculatePupilPos = (baseX, baseY) => {
    const maxOffset = 10;
    const angle = Math.atan2(mousePos.y, mousePos.x);
    const dist = Math.min(Math.sqrt(mousePos.x ** 2 + mousePos.y ** 2) / 20, maxOffset);

    return {
      cx: baseX + Math.cos(angle) * dist,
      cy: baseY + Math.sin(angle) * dist
    };
  };

  const leftPupil = calculatePupilPos(140, 130);
  const rightPupil = calculatePupilPos(260, 130);

  // Arm rotation based on mouse X
  const armRot = Math.min(Math.max(mousePos.x / 10, -30), 30);

  return (
    <Container ref={containerRef} $isJumping={isJumping}>
      <DragonSvg viewBox="0 0 400 400" onMouseDown={() => setMouthOpen(true)} onMouseUp={() => setMouthOpen(false)}>
        {/* --- BODY --- */}
        {/* Tail */}
        <path d="M 80 300 Q 20 280 40 350 Q 80 380 150 350" fill="#4ade80" stroke="#22c55e" strokeWidth="3" />

        {/* Main Body */}
        <ellipse cx="200" cy="280" rx="120" ry="100" fill="#4ade80" stroke="#22c55e" strokeWidth="3" />

        {/* Belly Patch */}
        <ellipse cx="200" cy="290" rx="70" ry="60" fill="#bbf7d0" />

        {/* --- HEAD --- */}
        <circle cx="200" cy="150" r="90" fill="#4ade80" stroke="#22c55e" strokeWidth="3" />

        {/* Horns */}
        <path d="M 140 90 Q 130 50 110 60" fill="none" stroke="#fcd34d" strokeWidth="6" strokeLinecap="round" />
        <path d="M 260 90 Q 270 50 290 60" fill="none" stroke="#fcd34d" strokeWidth="6" strokeLinecap="round" />

        {/* --- FACE --- */}
        {/* Left Eye */}
        <circle cx="140" cy="130" r="25" fill="#ffffff" stroke="#333" strokeWidth="2" />
        <circle cx={leftPupil.cx} cy={leftPupil.cy} r="10" fill="#000" />
        {/* Highlight */}
        <circle cx={leftPupil.cx - 3} cy={leftPupil.cy - 3} r="3" fill="#fff" />

        {/* Right Eye */}
        <circle cx="260" cy="130" r="25" fill="#ffffff" stroke="#333" strokeWidth="2" />
        <circle cx={rightPupil.cx} cy={rightPupil.cy} r="10" fill="#000" />
        {/* Highlight */}
        <circle cx={rightPupil.cx - 3} cy={rightPupil.cy - 3} r="3" fill="#fff" />

        {/* Mouth */}
        {mouthOpen ? (
          <path d="M 170 190 Q 200 220 230 190" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        ) : (
          <path d="M 180 190 Q 200 200 220 190" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        )}

        {/* Blush */}
        <ellipse cx="120" cy="170" rx="15" ry="8" fill="#fca5a5" opacity="0.6" />
        <ellipse cx="280" cy="170" rx="15" ry="8" fill="#fca5a5" opacity="0.6" />

        {/* --- TIE --- */}
        <path d="M 190 230 L 210 230 L 200 280 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
        <path d="M 195 230 L 205 230 L 200 220 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />

        {/* --- ARMS --- */}
        {/* Left Arm - Rotates */}
        <g transform={`rotate(${armRot}, 110, 260)`}>
          <ellipse cx="90" cy="270" rx="40" ry="20" fill="#4ade80" stroke="#22c55e" strokeWidth="3" transform="rotate(-20, 90, 270)" />
        </g>

        {/* Right Arm - Rotates */}
        <g transform={`rotate(${-armRot}, 290, 260)`}>
          <ellipse cx="310" cy="270" rx="40" ry="20" fill="#4ade80" stroke="#22c55e" strokeWidth="3" transform="rotate(20, 310, 270)" />
        </g>

      </DragonSvg>
    </Container>
  );
};

export default DragonPuppet;
