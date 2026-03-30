import React from 'react';
import styled from 'styled-components';
import {
  ATTRIBUTE_DESCRIPTIONS,
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  type SalaryMon,
  type SalaryMonAttributeKey,
} from '../../game/types';
import { getLevelProgress, getUpgradeCost } from '../../game/gameplay';

const Card = styled.section`
  padding: 10px;
  border: 2px solid #c3ff6a;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 16%),
    linear-gradient(135deg, #17331e 0%, #0f2315 46%, #0a150c 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.08),
    inset -1px -1px 0 rgba(0, 0, 0, 0.56),
    0 0 0 2px rgba(116, 239, 255, 0.12);

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
  border: 2px solid rgba(195, 255, 106, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 16%),
    linear-gradient(180deg, #17331e 0%, #102715 52%, #0b1a0d 100%);
`;

const Title = styled.h2`
  margin: 0;
  color: #c3ff6a;
  font-size: 14px;
  text-transform: uppercase;
`;

const Note = styled.p`
  margin: 6px 0 0;
  color: #d6f5d7;
  font-size: 12px;
  line-height: 1.45;

  @media (min-width: 1280px) {
    font-size: 14px;
  }

  @media (min-width: 2200px) {
    font-size: 18px;
  }
`;

const Wallet = styled.div`
  text-align: right;
`;

const WalletLabel = styled.div`
  color: #98d39d;
  font-size: 10px;
  text-transform: uppercase;
`;

const WalletValue = styled.div`
  margin-top: 4px;
  color: #efffd5;
  font-size: 21px;
  font-weight: 700;

  @media (min-width: 1280px) {
    font-size: 28px;
  }

  @media (min-width: 2200px) {
    font-size: 38px;
  }
`;

const LevelPanel = styled.div`
  margin-top: 10px;
  padding: 8px;
  border: 2px solid rgba(195, 255, 106, 0.24);
  background:
    repeating-linear-gradient(90deg, rgba(195, 255, 106, 0.08) 0 2px, transparent 2px 10px),
    linear-gradient(180deg, #152409 0%, #101807 52%, #0a1006 100%);
  color: #d3ff98;
`;

const LevelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 10px;
  text-transform: uppercase;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  margin-top: 8px;
  border: 1px solid rgba(195, 255, 106, 0.24);
  background: rgba(1, 7, 1, 0.46);
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  width: ${(props) => props.$percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #d9ff8c 0%, #8ae66c 40%, #2f9b43 100%);
`;

const UpgradeList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`;

const UpgradeRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  padding: 8px;
  border: 2px solid rgba(195, 255, 106, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 16%),
    linear-gradient(180deg, #17331e 0%, #102715 52%, #0b1a0d 100%);

  &:nth-child(odd) {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 16%),
      linear-gradient(180deg, #1a3a22 0%, #112d18 52%, #0d1d10 100%);
  }
`;

const Cursor = styled.div<{ $active: boolean }>`
  align-self: center;
  color: ${(props) => (props.$active ? '#c3ff6a' : '#5f8f63')};
  font-size: 12px;
  line-height: 1;
  text-transform: uppercase;
`;

const AttributeName = styled.div`
  color: #efffd5;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const AttributeDescription = styled.div`
  margin-top: 4px;
  color: #b7d1b6;
  font-size: 11px;
  line-height: 1.4;
`;

const AttributeValue = styled.div`
  margin-top: 6px;
  color: #c3ff6a;
  font-size: 10px;
  text-transform: uppercase;
`;

const UpgradeButton = styled.button<{ $disabled: boolean }>`
  min-width: 90px;
  align-self: center;
  border: 1px solid #000;
  background: ${(props) =>
    props.$disabled
      ? 'linear-gradient(180deg, #4d5b49 0%, #2b3528 100%)'
      : 'linear-gradient(180deg, #86f5ff 0%, #2fb7e6 48%, #0f5f9d 100%)'};
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.12),
    inset -1px -1px 0 rgba(0, 0, 0, 0.35);
  color: ${(props) => (props.$disabled ? '#d3dfd1' : '#061827')};
  padding: 9px 8px;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
`;

function renderButtonLabel(isPending: boolean, cost: number) {
  if (isPending) {
    return 'Saving';
  }

  return `${cost} XP`;
}

export function ProgressCard({
  pet,
  upgradePending,
  onUpgrade,
}: {
  pet: SalaryMon;
  upgradePending: SalaryMonAttributeKey | null;
  onUpgrade: (attribute: SalaryMonAttributeKey) => void;
}) {
  const progress = getLevelProgress(pet.experience, pet.level);

  return (
    <Card>
      <Header>
        <div>
          <Title>Evolution Menu</Title>
          <Note>Level comes from total XP. Stored XP buys upgrades.</Note>
        </div>

        <Wallet>
          <WalletLabel>Stored XP</WalletLabel>
          <WalletValue>{pet.availableXp}</WalletValue>
        </Wallet>
      </Header>

      <LevelPanel>
        <LevelRow>
          <span>Level {pet.level}</span>
          <span>
            {progress.currentXp} / {progress.requiredXp}
          </span>
        </LevelRow>

        <ProgressBar>
          <ProgressFill $percentage={progress.percentage} />
        </ProgressBar>
      </LevelPanel>

      <UpgradeList>
        {ATTRIBUTE_KEYS.map((attribute) => {
          const cost = getUpgradeCost(pet.attributes[attribute]);
          const disabled = pet.availableXp < cost || upgradePending !== null;
          const isPending = upgradePending === attribute;

          return (
            <UpgradeRow key={attribute}>
              <Cursor $active={!disabled || isPending}>{isPending ? '>>' : '>'}</Cursor>
              <div>
                <AttributeName>{ATTRIBUTE_LABELS[attribute]}</AttributeName>
                <AttributeDescription>{ATTRIBUTE_DESCRIPTIONS[attribute]}</AttributeDescription>
                <AttributeValue>Rank {pet.attributes[attribute]}</AttributeValue>
              </div>

              <UpgradeButton
                $disabled={disabled && !isPending}
                disabled={disabled && !isPending}
                onClick={() => onUpgrade(attribute)}
              >
                {renderButtonLabel(isPending, cost)}
              </UpgradeButton>
            </UpgradeRow>
          );
        })}
      </UpgradeList>
    </Card>
  );
}
