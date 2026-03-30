import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ATTRIBUTE_KEYS, ATTRIBUTE_LABELS, type SalaryMon } from '../../game/types';

const bob = keyframes`
  0%, 100% {
    transform: translate(-50%, -50%) scale(4);
  }

  50% {
    transform: translate(-50%, calc(-50% - 3px)) scale(4);
  }
`;

const Card = styled.section`
  padding: 10px;
  border: 2px solid #ff8d9f;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 18%),
    linear-gradient(135deg, #ff7b72 0%, #c13f82 34%, #4a2167 66%, #170d2d 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.16),
    inset -1px -1px 0 rgba(0, 0, 0, 0.48),
    0 0 0 2px rgba(116, 239, 255, 0.18);

  @media (min-width: 1280px) {
    padding: 14px;
  }

  @media (min-width: 2200px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.14) 0 22%, transparent 22% 100%),
    linear-gradient(180deg, rgba(18, 10, 38, 0.24) 0%, rgba(18, 10, 38, 0.52) 100%);
`;

const Eyebrow = styled.div`
  color: #74efff;
  font-size: 10px;
  text-transform: uppercase;
`;

const Name = styled.h2`
  margin: 6px 0 0;
  color: #f8fbff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 28px;
  line-height: 0.98;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-shadow: 0 0 18px rgba(255, 200, 94, 0.18);

  @media (min-width: 1280px) {
    font-size: 32px;
  }

  @media (min-width: 2200px) {
    font-size: 44px;
  }
`;

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(180deg, rgba(16, 10, 30, 0.55) 0%, rgba(10, 8, 21, 0.82) 100%);
  color: #f8fbff;
  font-size: 10px;
  text-transform: uppercase;
`;

const StatusDot = styled.span<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  background: ${(props) => (props.$active ? '#9fc28f' : '#ffab4a')};
  box-shadow: 0 0 0 1px #000;
`;

const Body = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 10px;

  @media (min-width: 560px) {
    grid-template-columns: 176px 1fr;
    align-items: center;
  }

  @media (min-width: 1280px) {
    grid-template-columns: 260px 1fr;
    gap: 14px;
  }

  @media (min-width: 2200px) {
    grid-template-columns: 360px 1fr;
    gap: 20px;
  }
`;

const Device = styled.div`
  padding: 10px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0 18%, transparent 18% 100%),
    linear-gradient(180deg, #211333 0%, #120e22 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.08),
    inset -1px -1px 0 rgba(0, 0, 0, 0.4);
`;

const Display = styled.div`
  position: relative;
  height: 160px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(circle at 50% 42%, rgba(255, 200, 94, 0.34) 0 18%, transparent 19%),
    radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.18) 0 1px, transparent 2px),
    radial-gradient(circle at 78% 28%, rgba(255, 255, 255, 0.12) 0 1px, transparent 2px),
    linear-gradient(180deg, transparent 0 66%, rgba(7, 8, 13, 0.46) 66% 100%),
    linear-gradient(135deg, #5c1972 0%, #2b1856 42%, #101021 100%);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        90deg,
        rgba(116, 239, 255, 0.12) 0 1px,
        transparent 1px 14px
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 28%);
    pointer-events: none;
  }

  @media (min-width: 1280px) {
    height: 220px;
  }

  @media (min-width: 2200px) {
    height: 320px;
  }
`;

const PixelSprite = styled.div<{ $active: boolean; $palette: string }>`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 4px;
  background: #1b2918;
  transform: translate(-50%, -50%) scale(4);
  transform-origin: center;
  animation: ${bob} 1.2s steps(2, end) infinite;
  animation-play-state: ${(props) => (props.$active ? 'running' : 'paused')};
  box-shadow:
    4px 0 0 #1b2918,
    8px 0 0 #1b2918,
    12px 0 0 #1b2918,
    20px 0 0 #1b2918,
    24px 0 0 #1b2918,
    28px 0 0 #1b2918,
    0 4px 0 #1b2918,
    4px 4px 0 ${(props) => props.$palette},
    8px 4px 0 ${(props) => props.$palette},
    12px 4px 0 ${(props) => props.$palette},
    16px 4px 0 ${(props) => props.$palette},
    20px 4px 0 ${(props) => props.$palette},
    24px 4px 0 ${(props) => props.$palette},
    28px 4px 0 #1b2918,
    -4px 8px 0 #1b2918,
    0 8px 0 ${(props) => props.$palette},
    4px 8px 0 ${(props) => props.$palette},
    8px 8px 0 ${(props) => props.$palette},
    12px 8px 0 ${(props) => props.$palette},
    16px 8px 0 ${(props) => props.$palette},
    20px 8px 0 ${(props) => props.$palette},
    24px 8px 0 ${(props) => props.$palette},
    28px 8px 0 ${(props) => props.$palette},
    32px 8px 0 #1b2918,
    -4px 12px 0 #1b2918,
    0 12px 0 ${(props) => props.$palette},
    4px 12px 0 ${(props) => props.$palette},
    8px 12px 0 #1b2918,
    12px 12px 0 ${(props) => props.$palette},
    16px 12px 0 ${(props) => props.$palette},
    20px 12px 0 #1b2918,
    24px 12px 0 ${(props) => props.$palette},
    28px 12px 0 ${(props) => props.$palette},
    32px 12px 0 #1b2918,
    -4px 16px 0 #1b2918,
    0 16px 0 ${(props) => props.$palette},
    4px 16px 0 ${(props) => props.$palette},
    8px 16px 0 ${(props) => props.$palette},
    12px 16px 0 ${(props) => props.$palette},
    16px 16px 0 ${(props) => props.$palette},
    20px 16px 0 ${(props) => props.$palette},
    24px 16px 0 ${(props) => props.$palette},
    28px 16px 0 ${(props) => props.$palette},
    32px 16px 0 #1b2918,
    0 20px 0 #1b2918,
    4px 20px 0 ${(props) => props.$palette},
    8px 20px 0 ${(props) => props.$palette},
    12px 20px 0 #ff7d4f,
    16px 20px 0 #ff7d4f,
    20px 20px 0 ${(props) => props.$palette},
    24px 20px 0 ${(props) => props.$palette},
    28px 20px 0 #1b2918,
    4px 24px 0 #1b2918,
    8px 24px 0 ${(props) => props.$palette},
    12px 24px 0 ${(props) => props.$palette},
    16px 24px 0 ${(props) => props.$palette},
    20px 24px 0 ${(props) => props.$palette},
    24px 24px 0 #1b2918;

  @media (min-width: 1280px) {
    transform: translate(-50%, -50%) scale(5);
    animation: ${bob} 1.2s steps(2, end) infinite;
  }

  @media (min-width: 2200px) {
    transform: translate(-50%, -50%) scale(7);
    animation: ${bob} 1.2s steps(2, end) infinite;
  }
`;

const LevelBadge = styled.div`
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 3px 5px;
  border: 1px solid #f2d48c;
  background: rgba(16, 24, 63, 0.74);
  color: #f5d992;
  font-size: 10px;
  text-transform: uppercase;
`;

const Story = styled.div`
  display: grid;
  gap: 8px;
`;

const Lead = styled.p`
  margin: 0;
  padding: 8px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.12) 0 18%, transparent 18% 100%),
    linear-gradient(180deg, rgba(18, 10, 38, 0.2) 0%, rgba(18, 10, 38, 0.44) 100%);
  color: #ffeef2;
  font-size: 12px;
  line-height: 1.45;

  @media (min-width: 1280px) {
    font-size: 14px;
  }

  @media (min-width: 2200px) {
    font-size: 18px;
  }
`;

const HighlightRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const Highlight = styled.div`
  padding: 8px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, transparent 18%),
    linear-gradient(180deg, rgba(10, 9, 22, 0.28) 0%, rgba(10, 9, 22, 0.56) 100%);
`;

const HighlightLabel = styled.div`
  color: #74efff;
  font-size: 10px;
  text-transform: uppercase;
`;

const HighlightValue = styled.div`
  margin-top: 4px;
  color: #fff8ec;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;

  @media (min-width: 2200px) {
    font-size: 16px;
  }
`;

function pickSignatureAttributes(pet: SalaryMon) {
  return [...ATTRIBUTE_KEYS]
    .sort((left, right) => pet.attributes[right] - pet.attributes[left])
    .slice(0, 2);
}

function getStatusCopy(status: SalaryMon['status']) {
  if (status === 'working') {
    return 'Active';
  }

  if (status === 'resting') {
    return 'Idle';
  }

  return 'Ready';
}

function getPaletteColor(pet: SalaryMon) {
  return {
    classic: '#ffd05b',
    ocean: '#8ed6ff',
    forest: '#7ce8ba',
    plasma: '#d49cff',
    sunset: '#ffb666',
  }[pet.appearance.palette];
}

export function PetCard({ pet }: { pet: SalaryMon }) {
  const signature = pickSignatureAttributes(pet);

  return (
    <Card>
      <Header>
        <div>
          <Eyebrow>Partner Data</Eyebrow>
          <Name>{pet.name}</Name>
        </div>

        <Status>
          <StatusDot $active={pet.status === 'working'} />
          {getStatusCopy(pet.status)}
        </Status>
      </Header>

      <Body>
        <Device>
          <Display>
            <PixelSprite $active={pet.status === 'working'} $palette={getPaletteColor(pet)} />
            <LevelBadge>Lv {pet.level}</LevelBadge>
          </Display>
        </Device>

        <Story>
          <Lead>
            Work fuels growth. Stored XP changes the build.
          </Lead>

          <HighlightRow>
            <Highlight>
              <HighlightLabel>Stored XP</HighlightLabel>
              <HighlightValue>{pet.availableXp}</HighlightValue>
            </Highlight>

            <Highlight>
              <HighlightLabel>Core Build</HighlightLabel>
              <HighlightValue>
                {signature.map((key) => ATTRIBUTE_LABELS[key]).join(' / ')}
              </HighlightValue>
            </Highlight>
          </HighlightRow>
        </Story>
      </Body>
    </Card>
  );
}
