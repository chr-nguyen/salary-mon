import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { TrackingClient, TrackingClientInput } from '../../time/types';

const Card = styled.section`
  padding: 10px;
  border: 2px solid #e2e9ff;
  background: linear-gradient(180deg, #4462c0 0%, #253d94 42%, #111944 100%);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.26),
    inset -1px -1px 0 rgba(0, 0, 0, 0.52),
    0 0 0 2px #1b2e6a;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
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

const FormGrid = styled.div`
  display: grid;
  gap: 8px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d8e0fb;
  font-size: 11px;
  text-transform: uppercase;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
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

const SecondaryButton = styled(Button)`
  border: 1px solid #dfe7ff;
  background: linear-gradient(180deg, #536ecb 0%, #293f94 100%);
  color: #f5f8ff;
`;

const ClientList = styled.div`
  display: grid;
  gap: 8px;
`;

const ClientRow = styled.div`
  display: grid;
  gap: 8px;
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #2e4ba5 0%, #1d3074 42%, #132155 100%);
  background-size: auto, 12px 12px, auto;

  @media (min-width: 760px) {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
`;

const ClientName = styled.div`
  color: #f8fbff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const ClientMeta = styled.div`
  margin-top: 4px;
  color: #d8def7;
  font-size: 11px;
  line-height: 1.45;
`;

const Empty = styled.div`
  color: #d8def7;
  font-size: 12px;
  line-height: 1.45;
`;

type FormState = {
  name: string;
  label: string;
  weeklyGoalHours: string;
  weeklyLimitHours: string;
  hourlyRate: string;
  billableDefault: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  label: '',
  weeklyGoalHours: '',
  weeklyLimitHours: '',
  hourlyRate: '',
  billableDefault: true,
};

function clientToForm(client: TrackingClient): FormState {
  return {
    name: client.name,
    label: client.label,
    weeklyGoalHours: client.weeklyGoalHours ? String(client.weeklyGoalHours) : '',
    weeklyLimitHours:
      client.weeklyLimitHours === null ? '' : String(client.weeklyLimitHours),
    hourlyRate: client.hourlyRate ? String(client.hourlyRate) : '',
    billableDefault: client.billableDefault,
  };
}

export function ClientDeskCard({
  clients,
  loading,
  savingClientId,
  onSaveClient,
}: {
  clients: TrackingClient[];
  loading: boolean;
  savingClientId: string | null;
  onSaveClient: (input: TrackingClientInput, existingClientId?: string | null) => Promise<boolean>;
}) {
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!editingClientId) {
      return;
    }

    const client = clients.find((entry) => entry.id === editingClientId);

    if (!client) {
      setEditingClientId(null);
      setForm(EMPTY_FORM);
      return;
    }

    setForm(clientToForm(client));
  }, [clients, editingClientId]);

  const save = async () => {
    const ok = await onSaveClient(
      {
        name: form.name,
        label: form.label,
        weeklyGoalHours: Number(form.weeklyGoalHours) || 0,
        weeklyLimitHours: form.weeklyLimitHours ? Number(form.weeklyLimitHours) || 0 : null,
        hourlyRate: Number(form.hourlyRate) || 0,
        billableDefault: form.billableDefault,
      },
      editingClientId,
    );

    if (ok) {
      setEditingClientId(null);
      setForm(EMPTY_FORM);
    }
  };

  const activeSaveId = editingClientId || '__new__';

  return (
    <Card>
      <Header>
        <div>
          <Title>Client Desk</Title>
          <Note>Create clients, default labels, weekly goals, limits, and invoice rates.</Note>
        </div>
      </Header>

      <Section>
        <SectionLabel>{editingClientId ? 'Edit Client' : 'New Client'}</SectionLabel>
        <FormGrid>
          <Field>
            Client Name
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>

          <Field>
            Default Label
            <Input
              value={form.label}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
            />
          </Field>

          <Field>
            Weekly Goal Hours
            <Input
              inputMode="decimal"
              value={form.weeklyGoalHours}
              onChange={(event) =>
                setForm((current) => ({ ...current, weeklyGoalHours: event.target.value }))
              }
            />
          </Field>

          <Field>
            Weekly Limit Hours
            <Input
              inputMode="decimal"
              value={form.weeklyLimitHours}
              onChange={(event) =>
                setForm((current) => ({ ...current, weeklyLimitHours: event.target.value }))
              }
            />
          </Field>

          <Field>
            Hourly Rate
            <Input
              inputMode="decimal"
              value={form.hourlyRate}
              onChange={(event) =>
                setForm((current) => ({ ...current, hourlyRate: event.target.value }))
              }
            />
          </Field>
        </FormGrid>

        <ButtonRow>
          <CheckboxRow>
            <Checkbox
              checked={form.billableDefault}
              onChange={(event) =>
                setForm((current) => ({ ...current, billableDefault: event.target.checked }))
              }
              type="checkbox"
            />
            Billable By Default
          </CheckboxRow>
        </ButtonRow>

        <ButtonRow>
          <Button
            disabled={savingClientId === activeSaveId}
            onClick={() => void save()}
            type="button"
          >
            {savingClientId === activeSaveId ? 'Saving' : editingClientId ? 'Update Client' : 'Save Client'}
          </Button>
          {(editingClientId || form.name || form.label || form.weeklyGoalHours || form.weeklyLimitHours || form.hourlyRate) && (
            <SecondaryButton
              onClick={() => {
                setEditingClientId(null);
                setForm(EMPTY_FORM);
              }}
              type="button"
            >
              Reset
            </SecondaryButton>
          )}
        </ButtonRow>
      </Section>

      <Section>
        <SectionLabel>Saved Clients</SectionLabel>
        {loading ? (
          <Empty>Loading client records...</Empty>
        ) : clients.length === 0 ? (
          <Empty>Add a client to start tagging sessions and tracking obligations.</Empty>
        ) : (
          <ClientList>
            {clients.map((client) => (
              <ClientRow key={client.id}>
                <div>
                  <ClientName>{client.name}</ClientName>
                  <ClientMeta>
                    Label: {client.label || 'None'}
                    <br />
                    Goal: {client.weeklyGoalHours || 0}h / Limit:{' '}
                    {client.weeklyLimitHours === null ? 'Off' : `${client.weeklyLimitHours}h`}
                    <br />
                    Rate: ${client.hourlyRate || 0}/hr / Default:{' '}
                    {client.billableDefault ? 'Billable' : 'Non-billable'}
                  </ClientMeta>
                </div>

                <SecondaryButton
                  onClick={() => {
                    setEditingClientId(client.id);
                    setForm(clientToForm(client));
                  }}
                  type="button"
                >
                  Edit
                </SecondaryButton>
              </ClientRow>
            ))}
          </ClientList>
        )}
      </Section>
    </Card>
  );
}
