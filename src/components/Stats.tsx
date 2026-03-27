import React from 'react';
import styled from 'styled-components';
import type { SalaryMon } from '../hooks/useSalaryMon';

const StatsContainer = styled.div`
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LevelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #fff;
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
  margin-bottom: 0.5rem;
`;

const ProgressBarFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%);
  transition: width 0.5s ease-out;
  border-radius: 10px;
`;

const XpText = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: #ccc;
  margin-bottom: 1.5rem;
`;

const AttributesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const AttributeBox = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 0.8rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const AttrName = styled.span`
  color: #aaa;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 0.2rem;
`;

const AttrValue = styled.span`
  color: #fff;
  font-weight: bold;
  font-size: 1.2rem;
`;

export const Stats: React.FC<{ pet: SalaryMon }> = ({ pet }) => {
  const currentLevelXpRequired = (pet.level - 1) * 1000;
  const nextLevelXpRequired = pet.level * 1000;
  
  const xpInCurrentLevel = pet.experience - currentLevelXpRequired;
  const xpNeededForNextLevel = nextLevelXpRequired - currentLevelXpRequired;
  
  const percentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return (
    <StatsContainer>
      <LevelHeader>
        <span>Level {pet.level}</span>
        <span>{pet.status.toUpperCase()}</span>
      </LevelHeader>
      
      <ProgressBarContainer>
        <ProgressBarFill percentage={percentage} />
      </ProgressBarContainer>
      
      <XpText>
        {pet.experience} / {nextLevelXpRequired} XP
      </XpText>

      {pet.attributes && (
        <AttributesContainer>
          <AttributeBox>
            <AttrName>Efficiency</AttrName>
            <AttrValue>{pet.attributes.efficiency}</AttrValue>
          </AttributeBox>
          <AttributeBox>
            <AttrName>Marketing</AttrName>
            <AttrValue>{pet.attributes.marketing}</AttrValue>
          </AttributeBox>
          <AttributeBox>
            <AttrName>Energy</AttrName>
            <AttrValue>{pet.attributes.energy}</AttrValue>
          </AttributeBox>
          <AttributeBox>
            <AttrName>Research</AttrName>
            <AttrValue>{pet.attributes.research}</AttrValue>
          </AttributeBox>
          <AttributeBox style={{ gridColumn: 'span 2' }}>
            <AttrName>Talent</AttrName>
            <AttrValue>{pet.attributes.talent}</AttrValue>
          </AttributeBox>
        </AttributesContainer>
      )}
    </StatsContainer>
  );
};
