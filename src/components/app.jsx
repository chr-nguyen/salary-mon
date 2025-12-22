import { styled } from 'styled-components';
import { useState } from 'react';

const Card = styled.div`
  padding: 2rem;
  background: #23262d;
  border-radius: 8px;
  border: 1px solid #444;
  color: white;
  text-align: center;
`;

const Button = styled.button`
  background: #7611a6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background: #9123c7;
  }
`;

import DragonPuppet from './DragonPuppet';

const InteractiveIsland = () => {
  const [count, setCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const handleJump = () => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500); // Reset after animation
  };

  return (
    <Card>
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handleJump}
          style={{
            padding: '0.5rem 1rem',
            background: '#4ade80',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#064e3b'
          }}
        >
          Jump!
        </button>
        <DragonPuppet isJumping={isJumping} />
      </div>
    </Card>
  );
}

export default InteractiveIsland;
