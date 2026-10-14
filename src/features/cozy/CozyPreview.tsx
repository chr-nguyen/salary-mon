import React, { useState } from "react";
import { Timestamp } from "firebase/firestore";
import styled from "styled-components";
import {
  CozyShell,
  HomeGrid,
  Paper,
  SoftButton,
  type CozyView,
} from "./CozyShell";
import { PetCard } from "../dashboard/components/PetCard";
import { TrackerCard } from "../dashboard/components/TrackerCard";
import { ProgressCard } from "../dashboard/components/ProgressCard";
import { AuthScreen } from "../auth/AuthScreen";
import {
  awardSessionXp,
  buildAttributeUpgrade,
  createStarterSalaryMon,
} from "../game/gameplay";
import type { TimeEntry } from "../time/useWorkSession";
import type { TimeEntryMetadata } from "../time/types";
const Notice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background: #ebe9df;
  border-radius: 12px;
  padding: 11px 16px;
  margin-bottom: 21px;
  font-size: 12px;
  color: var(--cozy-muted);
  button {
    background: var(--cozy-paper);
  }
`;
export function CozyPreview() {
  const [view, setView] = useState<CozyView>("home");
  const [pet, setPet] = useState(() => ({
    ...createStarterSalaryMon("preview"),
    name: "むぎ",
  }));
  const [session, setSession] = useState<TimeEntry | null>(null),
    [history, setHistory] = useState<{ minutes: number; xp: number }[]>([]),
    [authError, setAuthError] = useState<string | null>(null);
  const checkIn = (metadata: Partial<TimeEntryMetadata>) => {
    setSession({
      id: "preview-session",
      userId: "preview",
      startTime: Timestamp.now(),
      endTime: null,
      durationMinutes: 0,
      xpEarned: 0,
      clientId: null,
      clientName: null,
      label: null,
      billable: false,
      ...metadata,
    });
    setPet((p) => ({ ...p, status: "working" }));
  };
  const checkOut = () => {
    if (!session) return;
    const minutes = Math.max(
      0,
      Math.floor((Date.now() - session.startTime.toMillis()) / 60000),
    );
    const reward = awardSessionXp(pet, minutes);
    setPet((p) => ({ ...p, ...reward.patch }));
    setHistory((h) => [...h, { minutes, xp: reward.xpEarned }]);
    setSession(null);
  };
  const noAuth = async () => {
    setAuthError(
      "ここは体験モードです。アカウントの作成・ログインは、クラウド保存を設定した本番画面で行えます。",
    );
    return false;
  };
  return (
    <CozyShell view={view} onViewChange={setView} preview>
      <Notice>
        <span>
          体験モード ·
          相棒の着がえやタイマーを試せます。再読み込みでリセットされます。
        </span>
        {session && (
          <SoftButton
            type="button"
            onClick={() =>
              setSession((s) =>
                s
                  ? {
                      ...s,
                      startTime: Timestamp.fromMillis(
                        s.startTime.toMillis() - 25 * 60000,
                      ),
                    }
                  : s,
              )
            }
          >
            25分進める（デモ）
          </SoftButton>
        )}
      </Notice>
      {view === "home" ? (
        <HomeGrid>
          <PetCard
            pet={pet}
            onCompanionChange={(companion) =>
              setPet((p) => ({
                ...p,
                name: { mugi: "むぎ", sumi: "すみ", haku: "はく" }[companion],
                appearance: { ...p.appearance, companion },
              }))
            }
          />
          <TrackerCard
            activeSession={session}
            clients={[]}
            onCheckIn={checkIn}
            onCheckOut={checkOut}
          />
        </HomeGrid>
      ) : view === "train" ? (
        <ProgressCard
          pet={pet}
          upgradePending={null}
          onUpgrade={(a) =>
            setPet((p) => {
              const patch = buildAttributeUpgrade(p, a);
              return patch ? { ...p, ...patch } : p;
            })
          }
        />
      ) : view === "log" ? (
        <Paper>
          <h2>きょうの、足あと。</h2>
          {history.length === 0 ? (
            <p>はじめての記録を、ここに。おへやでタイマーを試してみてね。</p>
          ) : (
            <ul>
              {history.map((entry, i) => (
                <li key={i}>
                  作業 {i + 1} · {entry.minutes}分 · {entry.xp} XP
                </li>
              ))}
            </ul>
          )}
          <p>相棒と過ごした時間を、少しずつ。</p>
        </Paper>
      ) : (
        <AuthScreen
          pendingAction={null}
          error={authError}
          onGoogle={noAuth}
          onCreateAccount={noAuth}
          onSignIn={noAuth}
        />
      )}
    </CozyShell>
  );
}
