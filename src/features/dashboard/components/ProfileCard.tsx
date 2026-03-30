import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  PALETTE_LABELS,
  type SalaryMon,
  type SalaryMonPalette,
} from '../../game/types';

const PALETTES = Object.keys(PALETTE_LABELS) as SalaryMonPalette[];

const Card = styled.section`
  padding: 10px;
  border: 2px solid #e2e9ff;
  background: linear-gradient(180deg, #4462c0 0%, #253d94 42%, #111944 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.26),
    inset -1px -1px 0 rgba(0, 0, 0, 0.52),
    0 0 0 2px #1b2e6a;

  @media (min-width: 1280px) {
    padding: 14px;
  }

  @media (min-width: 2200px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 18%, transparent 40%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #3453ae 0%, #223785 42%, #152357 100%);
  background-size: auto, 12px 12px, auto;
`;

const Title = styled.h2`
  margin: 0;
  color: #f2d38b;
  font-size: 14px;
  text-transform: uppercase;
`;

const Note = styled.p`
  margin: 6px 0 0;
  color: #d8def7;
  font-size: 12px;
  line-height: 1.45;

  @media (min-width: 1280px) {
    font-size: 14px;
  }

  @media (min-width: 2200px) {
    font-size: 18px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 8px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Section = styled.div`
  margin-top: 10px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #29457d 0%, #1b2c5f 42%, #101a3f 100%);
  background-size: auto, 12px 12px, auto;
`;

const SectionLabel = styled.div`
  margin-bottom: 8px;
  color: #f2d38b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Field = styled.label`
  display: grid;
  gap: 4px;
  color: #d8e0fb;
  font-size: 11px;
  text-transform: uppercase;
`;

const Input = styled.input`
  border: 2px solid #dfe7ff;
  background: linear-gradient(180deg, #203274 0%, #111941 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.12),
    inset -1px -1px 0 rgba(0, 0, 0, 0.35);
  color: #f8fbff;
  padding: 9px 8px;
  font: inherit;
  font-size: 13px;
  outline: none;

  &::placeholder {
    color: #a7b5e6;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Button = styled.button`
  border: 1px solid #f5d895;
  background: linear-gradient(180deg, #fff0c2 0%, #efc871 44%, #b78628 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.34),
    inset -1px -1px 0 rgba(73, 44, 5, 0.45);
  color: #3a2504;
  padding: 10px 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;

  @media (min-width: 1280px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;

const PaletteButton = styled.button<{ $active: boolean }>`
  border: 1px solid #000;
  background: ${(props) =>
    props.$active
      ? 'linear-gradient(180deg, #fff0c2 0%, #efc871 44%, #b78628 100%)'
      : 'linear-gradient(180deg, #536ecb 0%, #293f94 100%)'};
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.16),
    inset -1px -1px 0 rgba(0, 0, 0, 0.45);
  color: ${(props) => (props.$active ? '#3a2504' : '#f5f8ff')};
  padding: 10px 8px;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`;

const FutureBox = styled.div`
  margin-top: 10px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #2e4ba5 0%, #1d3074 42%, #132155 100%);
  background-size: auto, 12px 12px, auto;
  color: #d8def7;
  font-size: 12px;
  line-height: 1.45;
`;

export function ProfileCard({
  userName,
  pet,
  profilePending,
  onRenameUser,
  onRenamePet,
  onUpdatePalette,
}: {
  userName: string;
  pet: SalaryMon;
  profilePending: boolean;
  onRenameUser: (name: string) => Promise<boolean>;
  onRenamePet: (name: string) => Promise<boolean>;
  onUpdatePalette: (palette: SalaryMonPalette) => Promise<boolean>;
}) {
  const [trainerName, setTrainerName] = useState(userName);
  const [petName, setPetName] = useState(pet.name);

  useEffect(() => {
    setTrainerName(userName);
  }, [userName]);

  useEffect(() => {
    setPetName(pet.name);
  }, [pet.name]);

  return (
    <Card>
      <Header>
        <div>
          <Title>Profile + Tuning</Title>
          <Note>Rename the save slot, rename the partner, and swap palette.</Note>
        </div>
      </Header>

      <Section>
        <SectionLabel>Name Entry</SectionLabel>
        <FormGrid>
          <Field>
            Trainer Name
            <Input value={trainerName} onChange={(event) => setTrainerName(event.target.value)} />
          </Field>

          <Field>
            Pet Name
            <Input value={petName} onChange={(event) => setPetName(event.target.value)} />
          </Field>
        </FormGrid>

        <ButtonRow>
          <Button
            disabled={profilePending}
            onClick={() => void onRenameUser(trainerName)}
            type="button"
          >
            Save Trainer
          </Button>
          <Button disabled={profilePending} onClick={() => void onRenamePet(petName)} type="button">
            Save Pet
          </Button>
        </ButtonRow>
      </Section>

      <Section>
        <SectionLabel>Color Memory</SectionLabel>
        <PaletteGrid>
          {PALETTES.map((palette) => (
            <PaletteButton
              key={palette}
              $active={pet.appearance.palette === palette}
              disabled={profilePending}
              onClick={() => void onUpdatePalette(palette)}
              type="button"
            >
              {PALETTE_LABELS[palette]}
            </PaletteButton>
          ))}
        </PaletteGrid>

        <FutureBox>
          Palette is the first tuning pass. Future layers can add body parts, markings, and
          animation sets to the sprite save data.
        </FutureBox>
      </Section>
    </Card>
  );
}
