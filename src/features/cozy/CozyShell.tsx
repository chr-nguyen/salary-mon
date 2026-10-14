import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { CompanionSprite } from "./CompanionSprite";

export const CozyGlobalStyle = createGlobalStyle`
  :root { color-scheme: light; --cozy-paper: #fffdf7; --cozy-bg: #f6f3e9; --cozy-ink: #3e493b; --cozy-muted: #5f6859; --cozy-line: #dddccc; --cozy-green: #536c49; --cozy-soft: #e9eedc; --cozy-peach: #f5e5d8; --cozy-danger: #983f39; font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', system-ui, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; color: var(--cozy-ink); background: var(--cozy-bg); font-size: 15px; line-height: 1.65; }
  button, input, textarea, select { font: inherit; }
  button, a { -webkit-tap-highlight-color: transparent; }
  button { cursor: pointer; }
  button:disabled { cursor: wait; opacity: .6; }
  :focus-visible { outline: 3px solid #657eaa; outline-offset: 4px; }
  a { color: var(--cozy-green); }
  input, select, textarea { max-width: 100%; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
`;
const Frame = styled.div`
  max-width: 1180px;
  margin: auto;
  padding: 0 32px 32px;
  @media (max-width: 600px) {
    padding: 0 16px 24px;
  }
`;
const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 23px 0;
  border-bottom: 1px solid var(--cozy-line);
  flex-wrap: wrap;
`;
const Brand = styled.a`
  display: flex;
  gap: 10px;
  align-items: center;
  text-decoration: none;
  color: var(--cozy-ink);
  strong {
    font-family: Georgia, serif;
    font-size: 26px;
    letter-spacing: -1px;
  }
  small {
    display: block;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--cozy-muted);
  }
`;
const Nav = styled.nav`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  @media (max-width: 600px) {
    width: 100%;
    justify-content: space-between;
  }
`;
const NavButton = styled.button<{ $active: boolean }>`
  border: 0;
  border-radius: 999px;
  padding: 10px 17px;
  min-height: 44px;
  background: ${(p) => (p.$active ? "var(--cozy-soft)" : "transparent")};
  color: var(--cozy-ink);
  font-size: 13px;
  &:hover {
    background: var(--cozy-soft);
  }
  @media (max-width: 400px) {
    padding: 10px 12px;
  }
`;
const Intro = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 18px;
  margin: 30px 0 23px;
  h1 {
    font-size: clamp(23px, 3vw, 31px);
    font-weight: 600;
    letter-spacing: 0.025em;
    margin: 4px 0 6px;
  }
  p {
    margin: 0;
    color: var(--cozy-muted);
    font-size: 13px;
  }
  small {
    letter-spacing: 2px;
    font-size: 11px;
    color: var(--cozy-muted);
  }
  @media (max-width: 600px) {
    margin: 23px 0 18px;
  }
`;
const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid var(--cozy-line);
  font-size: 12px;
  color: var(--cozy-muted);
`;
export const SoftButton = styled.button`
  border: 1px solid var(--cozy-line);
  background: var(--cozy-paper);
  color: var(--cozy-ink);
  border-radius: 12px;
  min-height: 44px;
  padding: 9px 15px;
  font-size: 13px;
  &:hover {
    background: var(--cozy-soft);
  }
`;
export const PrimaryButton = styled(SoftButton)`
  background: var(--cozy-green);
  border-color: var(--cozy-green);
  color: #fffdf7;
  font-weight: 600;
  &:hover {
    background: #425c39;
  }
`;
export const Paper = styled.section`
  background: var(--cozy-paper);
  border: 1px solid var(--cozy-line);
  border-radius: 22px;
  padding: 23px;
`;
export const HomeGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(290px, 1fr);
  gap: 24px;
  align-items: start;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;
const titles = {
  home: [
    "YOUR LITTLE CORNER",
    "きょうも、あなたのペースで。",
    "いつもの作業に、ちいさな相棒を。",
  ],
  train: [
    "LITTLE BY LITTLE",
    "相棒の、育ちのきろく。",
    "積み重ねた時間を、少しずつ力に。",
  ],
  log: [
    "OUR EVERYDAY",
    "きょうまでの、足あと。",
    "あなたの時間を、ていねいに残そう。",
  ],
  tools: [
    "MAKE YOURSELF AT HOME",
    "あなたらしく、ととのえる。",
    "相棒のことも、お仕事のことも。",
  ],
};
export type CozyView = keyof typeof titles;
export function CozyShell({
  children,
  view = "home",
  onViewChange,
  onSignOut,
  preview = false,
}: {
  children: React.ReactNode;
  view?: CozyView;
  onViewChange?: (view: CozyView) => void;
  onSignOut?: () => void;
  preview?: boolean;
}) {
  const [eyebrow, title, description] = titles[view];
  return (
    <>
      <CozyGlobalStyle />
      <Frame>
        <Header>
          <Brand href="/">
            <CompanionSprite companion="mugi" size={45} />
            <div>
              <strong>salary-mon</strong>
              <small>LITTLE DAYS, TOGETHER</small>
            </div>
          </Brand>
          {onViewChange && (
            <Nav aria-label="メインメニュー">
              {(
                [
                  ["home", "おへや"],
                  ["train", "そだてる"],
                  ["log", "きろく"],
                  ["tools", "設定"],
                ] as const
              ).map(([id, label]) => (
                <NavButton
                  key={id}
                  type="button"
                  $active={view === id}
                  aria-current={view === id ? "page" : undefined}
                  onClick={() => onViewChange(id)}
                >
                  {label}
                </NavButton>
              ))}
            </Nav>
          )}
        </Header>
        <Intro>
          <div>
            <small>{eyebrow}</small>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {onSignOut && (
            <SoftButton onClick={onSignOut} type="button">
              ログアウト
            </SoftButton>
          )}
        </Intro>
        {children}
        <Footer>
          <span>ひと息つくのも、だいじな時間。</span>
          <span>
            {preview
              ? "体験モード · データは保存されません"
              : "salary-mon · きょうも、いっしょに。"}
          </span>
        </Footer>
      </Frame>
    </>
  );
}
