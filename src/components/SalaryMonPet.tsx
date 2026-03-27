import React from 'react';
import styled, { keyframes } from 'styled-components';
import type { SalaryMon } from '../hooks/useSalaryMon';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const PetVisual = styled.div<{ bgColor: string, isEating: boolean }>`
  width: 150px;
  height: 150px;
  background-color: ${props => props.bgColor};
  border-radius: 50%;
  border: 8px solid white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  animation: ${props => props.isEating ? bounce : 'none'} 1s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    background: #333;
    border-radius: 50%;
    top: 40px;
    left: 30px;
    box-shadow: 60px 0 0 #333;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 20px;
    border-bottom: 10px solid #333;
    border-radius: 0 0 40px 40px;
    top: 80px;
    transition: all 0.3s ease;
    ${props => props.isEating ? `
      height: 40px;
      border: 10px solid #333;
      border-radius: 50%;
    ` : ''}
  }
`;

const LevelBadge = styled.div`
  margin-top: -20px;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.2rem;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 2px solid white;
`;

const PetName = styled.h3`
  color: white;
  margin-top: 10px;
  font-size: 1.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

export const SalaryMonPet: React.FC<{
  pet: SalaryMon;
  isActive: boolean;
}> = ({ pet, isActive }) => {
  // Appearance changes based on level
  const colors = ['#a29bfe', '#74b9ff', '#81ecec', '#55efc4', '#ffeaa7'];
  const petColor = colors[(pet.level - 1) % colors.length];

  return (
    <Container>
      <PetVisual bgColor={petColor} isEating={isActive} />
      <LevelBadge>LVL {pet.level}</LevelBadge>
      <PetName>{pet.name}</PetName>
    </Container>
  );
};
