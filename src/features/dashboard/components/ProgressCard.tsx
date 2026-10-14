import React from "react";
import styled from "styled-components";
import {
  ATTRIBUTE_KEYS,
  type SalaryMon,
  type SalaryMonAttributeKey,
} from "../../game/types";
import { getLevelProgress, getUpgradeCost } from "../../game/gameplay";
import { Paper, PrimaryButton } from "../../cozy/CozyShell";
import { CompanionSprite } from "../../cozy/CompanionSprite";
const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  h2 {
    margin: 0;
    font-size: 22px;
  }
  p {
    margin: 5px 0;
    color: var(--cozy-muted);
    font-size: 13px;
  }
`;
const Meter = styled.div`
  height: 9px;
  background: var(--cozy-soft);
  border-radius: 10px;
  overflow: hidden;
  margin: 18px 0 10px;
  span {
    display: block;
    height: 100%;
    background: #829a66;
    border-radius: 10px;
  }
`;
const List = styled.div`
  margin-top: 20px;
  display: grid;
  gap: 10px;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 17px 0;
  border-top: 1px solid var(--cozy-line);
  p {
    margin: 3px 0 0;
    font-size: 13px;
    color: var(--cozy-muted);
  }
  button {
    flex-shrink: 0;
  }
  @media (max-width: 460px) {
    flex-wrap: wrap;
  }
`;
const names: Record<SalaryMonAttributeKey, string> = {
  efficiency: "こつこつ力",
  marketing: "つながる力",
  energy: "げんき",
  research: "たんきゅう心",
  talent: "ひらめき",
};
export function ProgressCard({
  pet,
  upgradePending,
  onUpgrade,
}: {
  pet: SalaryMon;
  upgradePending: SalaryMonAttributeKey | null;
  onUpgrade: (attribute: SalaryMonAttributeKey) => void;
}) {
  const p = getLevelProgress(pet.experience, pet.level);
  return (
    <Paper>
      <Header>
        <CompanionSprite companion={pet.appearance.companion} size={90} />
        <div>
          <h2>
            {pet.name} · Lv. {pet.level}
          </h2>
          <p>つかえる経験値 {pet.availableXp} XP</p>
          <p>積み重ねた時間を、相棒の力に。</p>
        </div>
      </Header>
      <Meter
        role="progressbar"
        aria-label="次のレベルまで"
        aria-valuenow={Math.round(p.percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${p.percentage}%` }} />
      </Meter>
      <small>
        {p.currentXp} / {p.requiredXp} XP · 次のレベルまで
      </small>
      <List>
        {ATTRIBUTE_KEYS.map((a) => {
          const cost = getUpgradeCost(pet.attributes[a]);
          return (
            <Row key={a}>
              <div>
                <strong>{names[a]}</strong>
                <p>いまの育ち {pet.attributes[a]} · ひとつ育てる</p>
              </div>
              <PrimaryButton
                type="button"
                disabled={pet.availableXp < cost || upgradePending !== null}
                onClick={() => onUpgrade(a)}
                aria-label={`${names[a]}を育てる ${cost} XP`}
              >
                {upgradePending === a ? "保存中…" : `${cost} XP`}
              </PrimaryButton>
            </Row>
          );
        })}
      </List>
    </Paper>
  );
}
