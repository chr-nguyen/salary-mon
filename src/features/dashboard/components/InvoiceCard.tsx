import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { WorkEntryRecord } from '../../time/useWorkHistory';
import type { BusinessProfile, TrackingClient } from '../../time/types';

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
`;

const Form = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
`;

const Row = styled.div`
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

const Select = styled.select`
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

const SummaryBox = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
`;

const Stat = styled.div`
  padding: 8px;
  border: 2px solid #dfe7ff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.08) 18%, transparent 42%),
    linear-gradient(90deg, rgba(78, 63, 22, 0.08) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #f5ebcd 0%, #d9c59a 56%, #b89f73 100%);
  background-size: auto, 12px 12px, auto;
`;

const StatLabel = styled.div`
  color: #5a4621;
  font-size: 10px;
  text-transform: uppercase;
`;

const StatValue = styled.div`
  margin-top: 4px;
  color: #30230f;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
`;

const ActionRow = styled.div`
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

const Empty = styled.div`
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

function startOfCurrentMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfCurrentMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string, endOfDay = false) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

function createDefaultInvoiceNumber(prefix: string) {
  const date = new Date();
  const stamp = `${date.getFullYear()}${`${date.getMonth() + 1}`.padStart(2, '0')}${`${date.getDate()}`.padStart(2, '0')}`;
  return `${prefix || 'INV'}-${stamp}`;
}

function currency(value: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(value);
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function InvoiceCard({
  businessProfile,
  clients,
  entries,
  loading,
}: {
  businessProfile: BusinessProfile;
  clients: TrackingClient[];
  entries: WorkEntryRecord[];
  loading: boolean;
}) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(createDefaultInvoiceNumber(businessProfile.invoicePrefix));
  const [hourlyRate, setHourlyRate] = useState('0');
  const [startDate, setStartDate] = useState(formatDateInput(startOfCurrentMonth()));
  const [endDate, setEndDate] = useState(formatDateInput(endOfCurrentMonth()));

  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  useEffect(() => {
    const selectedClient = clients.find((client) => client.id === selectedClientId);

    if (selectedClient) {
      setHourlyRate(String(selectedClient.hourlyRate || 0));
    }
  }, [clients, selectedClientId]);

  useEffect(() => {
    setInvoiceNumber((current) =>
      current ? current : createDefaultInvoiceNumber(businessProfile.invoicePrefix),
    );
  }, [businessProfile.invoicePrefix]);

  const selectedClient = clients.find((client) => client.id === selectedClientId) || null;
  const numericRate = Number(hourlyRate) || 0;
  const rangeStart = parseDateInput(startDate);
  const rangeEnd = parseDateInput(endDate, true);

  const filteredEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.endDate)
        .filter((entry) => entry.billable)
        .filter((entry) => (selectedClientId ? entry.clientId === selectedClientId : true))
        .filter((entry) => entry.startDate >= rangeStart && entry.startDate <= rangeEnd)
        .sort((left, right) => left.startDate.getTime() - right.startDate.getTime()),
    [entries, rangeEnd, rangeStart, selectedClientId],
  );

  const lineItems = useMemo(() => {
    const grouped = new Map<
      string,
      {
        date: string;
        label: string;
        minutes: number;
      }
    >();

    filteredEntries.forEach((entry) => {
      const dateLabel = formatDate(entry.startDate);
      const label = entry.label || 'General';
      const key = `${dateLabel}|${label}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.minutes += entry.durationMinutes;
        return;
      }

      grouped.set(key, {
        date: dateLabel,
        label,
        minutes: entry.durationMinutes,
      });
    });

    return Array.from(grouped.values());
  }, [filteredEntries]);

  const totalMinutes = filteredEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const totalHours = Number((totalMinutes / 60).toFixed(2));
  const totalAmount = Number(((totalMinutes / 60) * numericRate).toFixed(2));

  if (loading) {
    return (
      <Card>
        <Header>
          <div>
            <Title>Invoice Tool</Title>
            <Note>Loading billable work history...</Note>
          </div>
        </Header>
        <Empty>Reading saved sessions...</Empty>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card>
        <Header>
          <div>
            <Title>Invoice Tool</Title>
            <Note>Export billable sessions into an invoice by client and date range.</Note>
          </div>
        </Header>
        <Empty>Create a client first, then track billable sessions against it.</Empty>
      </Card>
    );
  }

  const createHtmlInvoice = () => {
    const rows = lineItems
      .map((item) => {
        const hours = (item.minutes / 60).toFixed(2);
        const amount = currency((item.minutes / 60) * numericRate, businessProfile.currency);

        return `<tr>
  <td>${item.date}</td>
  <td>${item.label}</td>
  <td>${hours}</td>
  <td>${amount}</td>
</tr>`;
      })
      .join('\n');

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${invoiceNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #111; }
      h1, h2 { margin-bottom: 0.2rem; }
      .meta { color: #444; margin-bottom: 10px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background: #f5f5f5; }
      .totals { margin-top: 24px; font-size: 18px; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Invoice ${invoiceNumber}</h1>
    <div class="meta">Generated: ${formatDate(new Date())}</div>
    <div class="meta">Period: ${formatDate(rangeStart)} - ${formatDate(rangeEnd)}</div>
    <div class="grid">
      <div>
        <h2>From</h2>
        <div>${businessProfile.businessName || 'Business Name'}</div>
        <div>${businessProfile.contactName || ''}</div>
        <div>${businessProfile.email || ''}</div>
        <div>${businessProfile.addressLine1 || ''}</div>
        <div>${businessProfile.addressLine2 || ''}</div>
        <div>${businessProfile.cityStatePostal || ''}</div>
      </div>
      <div>
        <h2>Bill To</h2>
        <div>${selectedClient?.name || 'Client'}</div>
        <div>Terms: ${businessProfile.paymentTerms || 'Due on receipt'}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Label</th>
          <th>Hours</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="totals">Total Hours: ${totalHours}</div>
    <div class="totals">Hourly Rate: ${currency(numericRate, businessProfile.currency)}</div>
    <div class="totals">Total Due: ${currency(totalAmount, businessProfile.currency)}</div>
  </body>
</html>`;

    downloadFile(`${invoiceNumber}.html`, html, 'text/html;charset=utf-8');
  };

  const createCsvInvoice = () => {
    const lines = [
      ['Invoice Number', invoiceNumber],
      ['Client', selectedClient?.name || ''],
      ['Period Start', formatDate(rangeStart)],
      ['Period End', formatDate(rangeEnd)],
      ['Hourly Rate', numericRate.toString()],
      ['Currency', businessProfile.currency],
      [''],
      ['Date', 'Label', 'Minutes', 'Hours', 'Amount'],
      ...lineItems.map((item) => [
        item.date,
        item.label,
        item.minutes.toString(),
        (item.minutes / 60).toFixed(2),
        ((item.minutes / 60) * numericRate).toFixed(2),
      ]),
      [''],
      ['Total Hours', totalHours.toString()],
      ['Total Due', totalAmount.toFixed(2)],
    ];

    const csv = lines.map((line) => line.map((item) => `"${item}"`).join(',')).join('\n');
    downloadFile(`${invoiceNumber}.csv`, csv, 'text/csv;charset=utf-8');
  };

  return (
    <Card>
      <Header>
        <div>
          <Title>Invoice Tool</Title>
          <Note>Use billable labeled sessions to export a simple invoice for one client.</Note>
        </div>
      </Header>

      {!businessProfile.businessName ? (
        <Empty>Save business details first so the invoice has a sender identity.</Empty>
      ) : null}

      <Form>
        <Row>
          <Field>
            Client
            <Select
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            Invoice Number
            <Input
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
            />
          </Field>
        </Row>

        <Row>
          <Field>
            Period Start
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </Field>

          <Field>
            Period End
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </Field>
        </Row>

        <Row>
          <Field>
            Hourly Rate
            <Input
              inputMode="decimal"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
            />
          </Field>
        </Row>
      </Form>

      {filteredEntries.length === 0 ? (
        <Empty>No billable sessions for this client in the selected date range yet.</Empty>
      ) : null}

      <SummaryBox>
        <Stat>
          <StatLabel>Billable Hours</StatLabel>
          <StatValue>{totalHours}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Rate</StatLabel>
          <StatValue>{currency(numericRate, businessProfile.currency)}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Total Due</StatLabel>
          <StatValue>{currency(totalAmount, businessProfile.currency)}</StatValue>
        </Stat>
      </SummaryBox>

      <ActionRow>
        <Button disabled={filteredEntries.length === 0} onClick={createHtmlInvoice} type="button">
          Download Invoice
        </Button>
        <SecondaryButton
          disabled={filteredEntries.length === 0}
          onClick={createCsvInvoice}
          type="button"
        >
          Export CSV
        </SecondaryButton>
      </ActionRow>
    </Card>
  );
}
