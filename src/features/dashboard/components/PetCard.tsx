import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import type { SalaryMon, SalaryMonPalette } from "../../game/types";
import {
  COMPANIONS,
  CompanionSprite,
  type CompanionId,
} from "../../cozy/CompanionSprite";
import { SoftButton } from "../../cozy/CozyShell";

const delight = keyframes`0%,100%{transform:translateY(0) scale(1);} 35%{transform:translateY(-8px) scale(.97,1.03);}70%{transform:translateY(0) scale(1.03,.97);}`;
const accents: Record<SalaryMonPalette, string> = {
  classic: "#e9eedc", ocean: "#dfeced", forest: "#dfebd9",
  plasma: "#eae1ef", sunset: "#f5e5d8",
};
const Card = styled.section<{ $palette: SalaryMonPalette }>`
  --pet-accent: ${(p) => accents[p.$palette] || accents.classic};
  min-width: 0;
`;
const Room = styled.div`
  position: relative;
  aspect-ratio: 3/2;
  border-radius: 24px;
  overflow: hidden;
  background: #e5d2ad url("/art/reading-room.png") center/cover;
  border: 1px solid #dbceb7;
`;
const RoomLabel = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: var(--pet-accent);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  color: #4c593e;
`;
const Pet = styled.button<{ $reacting: boolean }>`
  position: absolute;
  left: 50%;
  bottom: 10%;
  width: 32%;
  aspect-ratio: 1;
  transform: translateX(-50%);
  padding: 0;
  border: 0;
  background: transparent;
  filter: drop-shadow(0 8px 4px #60452225);
  > span {
    width: 100%;
    height: 100%;
    animation: ${(p) => (p.$reacting ? delight : "none")} 600ms ease-out;
  }
  &:focus-visible {
    outline-offset: 6px;
    border-radius: 50%;
  }
`;
const Nameplate = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 19px 0 15px;
  > div { min-width: 0; }
  button { flex-shrink: 0; white-space: nowrap; }
  h2 {
    font-size: 23px;
    margin: 0;
    overflow-wrap: anywhere;
  }
  small {
    font-size: 12px;
    color: var(--cozy-muted);
    font-weight: 400;
    display: block;
    margin-top: 4px;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--cozy-muted);
  }
`;
const Speech = styled.div`
  min-height: 62px;
  border: 1px solid var(--cozy-line);
  border-radius: 4px 18px 18px;
  background: var(--cozy-paper);
  padding: 15px 20px;
  margin: 0 0 20px;
  font-size: 14px;
`;
const Friends = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;
const Friend = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  border: 1px solid ${(p) => (p.$selected ? "#83956d" : "var(--cozy-line)")};
  border-radius: 15px;
  background: ${(p) =>
    p.$selected ? "var(--pet-accent)" : "var(--cozy-paper)"};
  padding: 9px 10px;
  color: var(--cozy-ink);
  min-width: 0;
  strong {
    font-size: 13px;
  }
  small {
    display: block;
    font-size: 12px;
    color: var(--cozy-muted);
  }
  @media (max-width: 500px) {
    flex-direction: column;
    text-align: center;
    padding: 8px 3px;
    small {
      font-size: 12px;
    }
  }
`;
const CollectionLabel = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--cozy-muted);
`;
export function PetCard({
  pet,
  onCompanionChange,
  pending = false,
}: {
  pet: SalaryMon;
  onCompanionChange?: (id: CompanionId) => void;
  pending?: boolean;
}) {
  const [reacting, setReacting] = useState(false);
  const [message, setMessage] = useState("");
  const companion = pet.appearance.companion || "mugi";
  const friend = COMPANIONS.find((c) => c.id === companion) || COMPANIONS[0];
  useEffect(() => {
    if (!reacting) return;
    const timer = setTimeout(() => setReacting(false), 650);
    return () => clearTimeout(timer);
  }, [reacting]);
  useEffect(() => setMessage(""), [companion, pet.status]);
  const greet = () => {
    setReacting(true);
    setMessage(
      {
        mugi: "むぎは、お気に入りの葉っぱを見せてくれた。",
        sumi: "すみのノートに、あなたの似顔絵があった。",
        haku: "はくは、となりを少しあけてくれた。",
      }[companion],
    );
  };
  return (
    <Card aria-label="相棒のおへや" $palette={pet.appearance.palette}>
      <Room>
        <RoomLabel>
          {pet.status === "working"
            ? "いっしょに、こつこつ。"
            : "木もれびのおへや"}
        </RoomLabel>
        <Pet
          type="button"
          $reacting={reacting}
          onClick={greet}
          aria-label={`${friend.name}に声をかける`}
        >
          <CompanionSprite companion={companion} />
        </Pet>
      </Room>
      <Nameplate>
        <div>
          <h2>
            {pet.name}
            <small>
              Lv. {pet.level} · {friend.tag}
            </small>
          </h2>
          <p>{friend.description}</p>
        </div>
        <SoftButton type="button" onClick={greet}>
          声をかける
        </SoftButton>
      </Nameplate>
      <Speech role="status">
        {message ||
          (pet.status === "working"
            ? "「ここで待ってるね。あなたのペースで、どうぞ。」"
            : "「おかえり。きょうも、いっしょにいよう。」")}
      </Speech>
      <CollectionLabel>
        <span>相棒のすがた</span>
        <span>いつでも、着がえられるよ</span>
      </CollectionLabel>
      <Friends>
        {COMPANIONS.map((c) => (
          <Friend
            key={c.id}
            type="button"
            $selected={c.id === companion}
            aria-pressed={c.id === companion}
            disabled={!onCompanionChange || pending}
            onClick={() => onCompanionChange?.(c.id)}
          >
            <CompanionSprite companion={c.id} size={44} />
            <div>
              <strong>{c.name}</strong>
              <small>
                {c.id === "mugi"
                  ? "こつこつ"
                  : c.id === "sumi"
                    ? "ひらめき"
                    : "のんびり"}
              </small>
            </div>
          </Friend>
        ))}
      </Friends>
    </Card>
  );
}
