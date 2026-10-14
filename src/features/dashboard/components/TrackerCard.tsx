import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Timestamp } from "firebase/firestore";
import { XP_PER_MINUTE } from "../../game/gameplay";
import type { TimeEntry } from "../../time/useWorkSession";
import type { TrackingClient } from "../../time/types";
import { Paper, PrimaryButton } from "../../cozy/CozyShell";
const Card = styled(Paper)`
  h2 {
    font-size: 19px;
    margin: 6px 0;
  }
  p {
    font-size: 13px;
    color: var(--cozy-muted);
    margin: 7px 0;
  }
`;
const Eyebrow = styled.div`
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--cozy-muted);
`;
const Timer = styled.div`
  font-family: ui-monospace, monospace;
  font-size: clamp(32px, 4vw, 45px);
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
  text-align: center;
  margin: 22px 0 4px;
`;
const TimerNote = styled.div`
  font-size: 12px;
  text-align: center;
  color: var(--cozy-muted);
  margin-bottom: 22px;
`;
const Start = styled(PrimaryButton)`
  width: 100%;
  min-height: 51px;
`;
const Details = styled.details`
  border-top: 1px solid var(--cozy-line);
  margin-top: 22px;
  padding-top: 15px;
  summary {
    cursor: pointer;
    font-size: 12px;
    min-height: 32px;
    color: var(--cozy-muted);
  }
`;
const Field = styled.label`
  display: grid;
  gap: 5px;
  font-size: 12px;
  margin: 12px 0;
  input,
  select {
    width: 100%;
    padding: 9px 10px;
    border: 1px solid #9eaa90;
    border-radius: 9px;
    background: var(--cozy-paper);
    color: var(--cozy-ink);
    font-size: 16px;
  }
`;
const Check = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  min-height: 44px;
  input {
    width: 18px;
    height: 18px;
    accent-color: var(--cozy-green);
  }
`;
const Hint = styled.div`
  margin-top: 19px;
  border-radius: 18px;
  padding: 18px;
  background: var(--cozy-soft);
  h3 {
    font-size: 14px;
    margin: 0 0 7px;
  }
  p {
    font-size: 12px;
    margin: 0;
    line-height: 1.85;
    color: var(--cozy-muted);
  }
`;
function formatElapsed(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0")}:${Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export function TrackerCard({
  activeSession,
  clients,
  onCheckIn,
  onCheckOut,
}: {
  activeSession: TimeEntry | null;
  clients: TrackingClient[];
  onCheckIn: (metadata: {
    clientId: string | null;
    clientName: string | null;
    label: string | null;
    billable: boolean;
  }) => void | Promise<void>;
  onCheckOut: () => void | Promise<void>;
}) {
  const [elapsed, setElapsed] = useState(0),
    [selectedClientId, setSelectedClientId] = useState(""),
    [label, setLabel] = useState(""),
    [billable, setBillable] = useState(true),
    [pending, setPending] = useState(false);
  useEffect(() => {
    if (!activeSession) {
      setElapsed(0);
      return;
    }
    const tick = () =>
      setElapsed(
        Timestamp.now().toMillis() - activeSession.startTime.toMillis(),
      );
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;
  async function act() {
    if (pending) return;
    setPending(true);
    try {
      if (activeSession) await onCheckOut();
      else
        await onCheckIn({
          clientId: selectedClient?.id || null,
          clientName: selectedClient?.name || null,
          label: label.trim() || null,
          billable,
        });
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <Card aria-label="作業タイマー">
        <Eyebrow>A LITTLE FOCUS</Eyebrow>
        <h2>
          {activeSession
            ? "いっしょに、こつこつ。"
            : "ひとつずつ、はじめよう。"}
        </h2>
        <p>
          {activeSession
            ? "終わりたいときに、記録を残してね。"
            : "きょうの作業に、相棒がおともします。"}
        </p>
        <Timer aria-label={`経過時間 ${formatElapsed(elapsed)}`}>
          {formatElapsed(elapsed)}
        </Timer>
        <TimerNote>
          {activeSession
            ? `${Math.floor(elapsed / 60000) * XP_PER_MINUTE} XP · 記録中`
            : "準備ができたら、どうぞ。"}
        </TimerNote>
        <Start type="button" disabled={pending} onClick={() => void act()}>
          {pending
            ? "保存しています…"
            : activeSession
              ? "作業を終えて、記録する"
              : "作業をはじめる"}{" "}
          <span aria-hidden="true">{activeSession ? "✓" : "→"}</span>
        </Start>
        {activeSession ? (
          <p>
            {activeSession.clientName || "自分の作業"}
            {activeSession.label ? ` · ${activeSession.label}` : ""}
          </p>
        ) : (
          <Details>
            <summary>作業のメモ・クライアント（任意）</summary>
            <Field>
              クライアント
              <select
                value={selectedClientId}
                onChange={(e) => {
                  const id = e.target.value,
                    c = clients.find((c) => c.id === id);
                  setSelectedClientId(id);
                  setBillable(c?.billableDefault ?? true);
                  setLabel(c?.label || "");
                }}
              >
                <option value="">自分の作業</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              メモ
              <input
                maxLength={48}
                placeholder="資料づくり、調べもの…"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </Field>
            <Check>
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
              />
              請求する作業として記録
            </Check>
          </Details>
        )}
      </Card>
      <Hint>
        <h3>ひと息つくのも、だいじ。</h3>
        <p>
          相棒は、いつでもここにいるよ。
          <br />
          あなたのペースで、少しずつ。
        </p>
      </Hint>
    </div>
  );
}
