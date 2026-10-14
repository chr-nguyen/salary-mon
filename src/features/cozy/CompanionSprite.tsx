import React from "react";
import styled from "styled-components";
export type CompanionId = "mugi" | "sumi" | "haku";
export const COMPANIONS: {
  id: CompanionId;
  name: string;
  tag: string;
  description: string;
}[] = [
  {
    id: "mugi",
    name: "むぎ",
    tag: "葉っぱのコレクター",
    description: "いい形の葉っぱを見つけると、そっと見せにくる。",
  },
  {
    id: "sumi",
    name: "すみ",
    tag: "ちいさなアイデア係",
    description: "考えごとの途中で、ノートにまるを描いている。",
  },
  {
    id: "haku",
    name: "はく",
    tag: "ひと息の達人",
    description: "あたたかい場所を見つけるのが、だれよりも上手。",
  },
];
const Sprite = styled.span<{ $size: number; $position: number }>`
  display: inline-block;
  flex-shrink: 0;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  background-image: url("/art/companions.png");
  background-size: 300% 100%;
  background-position: ${(p) => p.$position}%;
  background-repeat: no-repeat;
`;
export function CompanionSprite({
  companion = "mugi",
  size = 120,
  label,
}: {
  companion?: CompanionId;
  size?: number;
  label?: string;
}) {
  const position = { mugi: 0, sumi: 50, haku: 100 }[companion] ?? 0;
  return (
    <Sprite
      $size={size}
      $position={position}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
    />
  );
}
