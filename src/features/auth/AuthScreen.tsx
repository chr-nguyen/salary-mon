import React, { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const hop = keyframes`
  0%, 100% {
    transform: translate(-50%, -50%);
  }

  50% {
    transform: translate(-50%, calc(-50% - 4px));
  }
`;

const blink = keyframes`
  0%, 46%, 100% {
    transform: scaleY(1);
  }

  48%, 52% {
    transform: scaleY(0.2);
  }
`;

const Screen = styled.section`
  padding: 10px;
  border: 2px solid #7af0ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 18%),
    linear-gradient(145deg, #261846 0%, #12152a 52%, #090b13 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.12),
    inset -1px -1px 0 rgba(0, 0, 0, 0.58),
    0 0 0 2px rgba(255, 111, 125, 0.18),
    0 0 0 4px rgba(6, 9, 17, 0.95);

  @media (min-width: 800px) and (min-height: 560px) {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(320px, 440px);
    gap: 12px;
    align-items: stretch;
  }

  @media (min-width: 1280px) {
    grid-template-columns: minmax(420px, 1.15fr) minmax(360px, 0.85fr);
    gap: 16px;
    padding: 14px;
  }

  @media (min-width: 2200px) {
    grid-template-columns: minmax(540px, 1.2fr) minmax(420px, 0.8fr);
    gap: 22px;
    padding: 20px;
  }
`;

const Hero = styled.div`
  position: relative;
  padding: 10px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(circle at 74% 16%, rgba(255, 111, 125, 0.72) 0 12%, transparent 13%),
    radial-gradient(circle at 16% 22%, rgba(116, 239, 255, 0.28) 0 12%, transparent 13%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 48%),
    linear-gradient(135deg, #ff7e63 0%, #8c2f91 34%, #2e267f 66%, #11163a 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.18),
    inset -1px -1px 0 rgba(0, 0, 0, 0.32),
    0 0 0 2px rgba(6, 9, 17, 0.48);
  color: #f8fbff;

  &::before {
    content: '';
    position: absolute;
    inset: 12px;
    background:
      linear-gradient(120deg, transparent 0 38%, rgba(255, 255, 255, 0.12) 38% 42%, transparent 42% 100%),
      linear-gradient(0deg, transparent 0 62%, rgba(255, 255, 255, 0.08) 62% 64%, transparent 64% 100%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto 12px 12px 12px;
    height: 36px;
    border-top: 2px solid rgba(255, 255, 255, 0.12);
    background:
      linear-gradient(180deg, rgba(255, 228, 158, 0) 0%, rgba(255, 228, 158, 0.14) 100%),
      linear-gradient(180deg, rgba(4, 10, 24, 0.28) 0%, rgba(4, 10, 24, 0.82) 100%);
    pointer-events: none;
  }
`;

const Badge = styled.div`
  display: inline-block;
  padding: 3px 6px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(7, 11, 27, 0.4);
  color: #74efff;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Headline = styled.h2`
  margin: 10px 0 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 34px;
  line-height: 0.92;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-shadow:
    1px 1px 0 rgba(10, 16, 46, 0.95),
    2px 2px 0 rgba(10, 16, 46, 0.5),
    0 0 22px rgba(116, 239, 255, 0.16);

  @media (min-width: 1280px) {
    font-size: 40px;
  }

  @media (min-width: 2200px) {
    font-size: 48px;
  }
`;

const Copy = styled.p`
  margin: 10px 0 0;
  color: #f6edf8;
  font-size: 12px;
  line-height: 1.45;

  @media (min-width: 1280px) {
    font-size: 14px;
  }

  @media (min-width: 2200px) {
    font-size: 18px;
  }
`;

const MascotStage = styled.div`
  position: relative;
  margin-top: 12px;
  height: 146px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(circle at 22% 22%, rgba(255, 255, 255, 0.18) 0 1px, transparent 2px),
    radial-gradient(circle at 78% 28%, rgba(255, 255, 255, 0.14) 0 1px, transparent 2px),
    linear-gradient(180deg, transparent 0 58%, rgba(0, 0, 0, 0.28) 58% 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, transparent 22%),
    linear-gradient(135deg, #ff8660 0%, #722d8f 35%, #2c2572 66%, #11163a 100%);
  background-size: auto, auto, auto, auto;
  overflow: hidden;

  @media (min-width: 1280px) {
    height: 220px;
  }

  @media (min-width: 2200px) {
    height: 300px;
  }
`;

const PixelSprite = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 4px;
  background: #1b2918;
  transform: translate(-50%, -50%) scale(4);
  transform-origin: center;
  animation: ${hop} 1.2s steps(2, end) infinite;
  box-shadow:
    4px 0 0 #1b2918,
    8px 0 0 #1b2918,
    12px 0 0 #1b2918,
    20px 0 0 #1b2918,
    24px 0 0 #1b2918,
    28px 0 0 #1b2918,
    0 4px 0 #1b2918,
    4px 4px 0 #ffd05b,
    8px 4px 0 #ffd05b,
    12px 4px 0 #ffd05b,
    16px 4px 0 #ffd05b,
    20px 4px 0 #ffd05b,
    24px 4px 0 #ffd05b,
    28px 4px 0 #1b2918,
    -4px 8px 0 #1b2918,
    0 8px 0 #ffd05b,
    4px 8px 0 #ffd05b,
    8px 8px 0 #ffd05b,
    12px 8px 0 #ffd05b,
    16px 8px 0 #ffd05b,
    20px 8px 0 #ffd05b,
    24px 8px 0 #ffd05b,
    28px 8px 0 #ffd05b,
    32px 8px 0 #1b2918,
    -4px 12px 0 #1b2918,
    0 12px 0 #ffd05b,
    4px 12px 0 #ffd05b,
    8px 12px 0 #1b2918,
    12px 12px 0 #ffd05b,
    16px 12px 0 #ffd05b,
    20px 12px 0 #1b2918,
    24px 12px 0 #ffd05b,
    28px 12px 0 #ffd05b,
    32px 12px 0 #1b2918,
    -4px 16px 0 #1b2918,
    0 16px 0 #ffd05b,
    4px 16px 0 #ffd05b,
    8px 16px 0 #ffd05b,
    12px 16px 0 #ffd05b,
    16px 16px 0 #ffd05b,
    20px 16px 0 #ffd05b,
    24px 16px 0 #ffd05b,
    28px 16px 0 #ffd05b,
    32px 16px 0 #1b2918,
    0 20px 0 #1b2918,
    4px 20px 0 #ffd05b,
    8px 20px 0 #ffd05b,
    12px 20px 0 #ff7d4f,
    16px 20px 0 #ff7d4f,
    20px 20px 0 #ffd05b,
    24px 20px 0 #ffd05b,
    28px 20px 0 #1b2918,
    4px 24px 0 #1b2918,
    8px 24px 0 #ffd05b,
    12px 24px 0 #ffd05b,
    16px 24px 0 #ffd05b,
    20px 24px 0 #ffd05b,
    24px 24px 0 #1b2918;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 12px;
    width: 4px;
    height: 8px;
    background: #1b2918;
    animation: ${blink} 2s steps(2, end) infinite;
  }

  &::before {
    left: 8px;
  }

  &::after {
    left: 20px;
  }
`;

const Panel = styled.div`
  margin-top: 10px;
  padding: 10px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 18%),
    linear-gradient(180deg, #211437 0%, #12182d 52%, #090c15 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.1),
    inset -1px -1px 0 rgba(0, 0, 0, 0.48),
    0 0 0 2px rgba(6, 9, 17, 0.48);

  @media (min-width: 800px) and (min-height: 560px) {
    margin-top: 0;
  }
`;

const Switcher = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const SwitchButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${(props) => (props.$active ? '#ffc85e' : 'rgba(255, 255, 255, 0.14)')};
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(180deg, #ffe795 0%, #ff9a5e 48%, #f3576c 100%)'
      : 'linear-gradient(180deg, #2f2458 0%, #13182d 100%)'};
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.1),
    inset -1px -1px 0 rgba(0, 0, 0, 0.45);
  color: ${(props) => (props.$active ? '#3b2805' : '#f4f7ff')};
  padding: 8px 6px;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`;

const Form = styled.form`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`;

const Label = styled.label`
  display: grid;
  gap: 4px;
  color: #dde4f7;
  font-size: 11px;
  text-transform: uppercase;
`;

const Input = styled.input`
  border: 2px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(180deg, #171b31 0%, #0c101b 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.06),
    inset -1px -1px 0 rgba(0, 0, 0, 0.35);
  color: #f8fbff;
  padding: 9px 8px;
  font: inherit;
  font-size: 13px;
  outline: none;

  &::placeholder {
    color: #939bd0;
  }
`;

const PrimaryButton = styled.button`
  border: 1px solid #ffc85e;
  background: linear-gradient(180deg, #ffe795 0%, #ff9a5e 48%, #f3576c 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.24),
    inset -1px -1px 0 rgba(109, 33, 47, 0.48);
  color: #3a130c;
  padding: 10px 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`;

const GoogleButton = styled.button`
  width: 100%;
  margin-top: 10px;
  border: 1px solid #7af0ff;
  background: linear-gradient(180deg, #86f5ff 0%, #2fb7e6 48%, #0f5f9d 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.24),
    inset -1px -1px 0 rgba(3, 38, 74, 0.42);
  color: #061827;
  padding: 10px 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`;

const Divider = styled.div`
  margin-top: 10px;
  color: #aeb7da;
  font-size: 10px;
  text-transform: uppercase;
`;

const ErrorText = styled.div`
  margin-top: 10px;
  padding: 8px;
  border: 1px solid rgba(255, 143, 163, 0.5);
  background: linear-gradient(180deg, #6a1f35 0%, #34111c 100%);
  color: #ffd5d5;
  font-size: 11px;
  line-height: 1.45;
`;

type Mode = 'create' | 'sign-in';

function buttonCopy(mode: Mode, pendingAction: string | null) {
  if (pendingAction === 'create' || pendingAction === 'sign-in') {
    return 'Linking';
  }

  return mode === 'create' ? 'Create Save' : 'Continue Save';
}

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
  const [mode, setMode] = useState<Mode>('create');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isBusy = pendingAction !== null;

  const helperCopy = useMemo(() => {
    if (mode === 'create') {
      return 'Create a local trainer profile or jump in with Google.';
    }

    return 'Resume the same Salary-mon and keep training.';
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'create') {
      await onCreateAccount({ displayName, email, password });
      return;
    }

    await onSignIn({ email, password });
  };

  return (
    <Screen>
      <Hero>
        <Badge>Login Screen</Badge>
        <Headline>Sync creature data.</Headline>
        <Copy>
          Old-school handheld interface. Create a save file, log in, and continue training your
          monster through real work sessions.
        </Copy>

        <MascotStage>
          <PixelSprite />
        </MascotStage>
      </Hero>

      <Panel>
        <Switcher>
          <SwitchButton
            type="button"
            $active={mode === 'create'}
            onClick={() => setMode('create')}
          >
            New Save
          </SwitchButton>
          <SwitchButton
            type="button"
            $active={mode === 'sign-in'}
            onClick={() => setMode('sign-in')}
          >
            Login
          </SwitchButton>
        </Switcher>

        <Form onSubmit={handleSubmit}>
          {mode === 'create' && (
            <Label>
              Trainer name
              <Input
                autoComplete="nickname"
                placeholder="Your trainer name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </Label>
          )}

          <Label>
            Email
            <Input
              autoComplete="email"
              inputMode="email"
              placeholder="trainer@email.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Label>

          <Label>
            Password
            <Input
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              placeholder="At least 6 characters"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Label>

          <PrimaryButton disabled={isBusy} type="submit">
            {buttonCopy(mode, pendingAction)}
          </PrimaryButton>
        </Form>

        <Divider>{helperCopy}</Divider>

        <GoogleButton disabled={isBusy} onClick={() => void onGoogle()} type="button">
          {pendingAction === 'google' ? 'Opening Google' : 'Continue with Google'}
        </GoogleButton>

        {error && <ErrorText>{error}</ErrorText>}
      </Panel>
    </Screen>
  );
}
