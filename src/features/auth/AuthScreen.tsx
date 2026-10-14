import React, { useState } from "react";
import styled from "styled-components";
import { Paper, PrimaryButton, SoftButton } from "../cozy/CozyShell";
const Screen = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 28px;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;
const Hero = styled.div`
  background: var(--cozy-soft);
  border-radius: 24px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  h2 {
    font-size: 30px;
    line-height: 1.6;
    margin: 0 0 10px;
  }
  p {
    font-size: 14px;
    color: var(--cozy-muted);
    max-width: 360px;
  }
  img {
    width: 100%;
    height: auto;
    margin-top: 20px;
  }
  small {
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--cozy-muted);
  }
`;
const Form = styled.form`
  display: grid;
  gap: 17px;
  margin-top: 22px;
  label {
    display: grid;
    gap: 6px;
    font-size: 13px;
  }
  input {
    border: 1px solid #9eaa90;
    border-radius: 10px;
    background: var(--cozy-paper);
    padding: 11px 12px;
    font-size: 16px;
    color: var(--cozy-ink);
    width: 100%;
  }
`;
const Switch = styled.div`
  display: flex;
  gap: 8px;
  button {
    flex: 1;
  }
  button[aria-pressed="true"] {
    background: var(--cozy-soft);
    border-color: #8b9d79;
  }
`;
const ErrorText = styled.p`
  color: var(--cozy-danger);
  background: #fff0e9;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
`;
export function AuthScreen({
  pendingAction,
  error,
  onGoogle,
  onCreateAccount,
  onSignIn,
}: {
  pendingAction: string | null;
  error: string | null;
  onGoogle: () => Promise<boolean>;
  onCreateAccount: (input: {
    displayName: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  onSignIn: (input: { email: string; password: string }) => Promise<boolean>;
}) {
  const [mode, setMode] = useState<"create" | "sign-in">("create"),
    [displayName, setDisplayName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const busy = pendingAction !== null;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (mode === "create")
      await onCreateAccount({ displayName, email, password });
    else await onSignIn({ email, password });
  }
  return (
    <Screen>
      <Hero>
        <small>A SMALL FRIEND FOR YOUR EVERYDAY</small>
        <h2>
          がんばる毎日に、
          <br />
          ほっとする居場所を。
        </h2>
        <p>
          作業を記録して、相棒と少しずつ育っていく。
          <br />
          きょうも、あなたのペースで。
        </p>
        <img
          src="/art/companions.png"
          width="2172"
          height="724"
          alt="葉っぱを持つむぎ、えんぴつを持つすみ、マフラーを巻いたはく"
        />
        <a href="/cozy-preview">まずは、おへやをのぞいてみる →</a>
      </Hero>
      <Paper>
        <Switch>
          <SoftButton
            type="button"
            aria-pressed={mode === "create"}
            onClick={() => setMode("create")}
          >
            はじめまして
          </SoftButton>
          <SoftButton
            type="button"
            aria-pressed={mode === "sign-in"}
            onClick={() => setMode("sign-in")}
          >
            おかえりなさい
          </SoftButton>
        </Switch>
        <Form onSubmit={submit}>
          {mode === "create" && (
            <label>
              呼んでほしい名前
              <input
                required
                autoComplete="nickname"
                maxLength={40}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="あなたのニックネーム"
              />
            </label>
          )}
          <label>
            メールアドレス
            <input
              required
              autoComplete="email"
              inputMode="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            パスワード
            <input
              required
              minLength={6}
              autoComplete={
                mode === "create" ? "new-password" : "current-password"
              }
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
            />
          </label>
          <PrimaryButton disabled={busy} type="submit">
            {busy
              ? "つないでいます…"
              : mode === "create"
                ? "相棒との毎日をはじめる"
                : "おへやにもどる"}
          </PrimaryButton>
        </Form>
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--cozy-muted)",
          }}
        >
          または
        </p>
        <SoftButton
          style={{ width: "100%" }}
          disabled={busy}
          type="button"
          onClick={() => void onGoogle()}
        >
          Google でつづける
        </SoftButton>
        {error && <ErrorText role="alert">{error}</ErrorText>}
      </Paper>
    </Screen>
  );
}
