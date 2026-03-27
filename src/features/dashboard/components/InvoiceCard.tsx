import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import type { MonthlyWorkSummary } from '../../time/useWorkHistory';

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

  &::placeholder {
    color: #a7b5e6;
  }
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
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.18),
    inset -1px -1px 0 rgba(0, 0, 0, 0.42);
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

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function currency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function InvoiceCard({
  summary,
}: {
  summary: MonthlyWorkSummary | null;
}) {
  const [clientName, setClientName] = useState('Client Name');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [hourlyRate, setHourlyRate] = useState('60');

  const numericRate = Number(hourlyRate) || 0;
  const totalAmount = useMemo(
    () => ((summary?.totalMinutes || 0) / 60) * numericRate,
    [numericRate, summary?.totalMinutes],
  );

  if (!summary) {
    return (
      <Card>
        <Header>
          <div>
            <Title>Invoice Tool</Title>
            <Note>Create a downloadable invoice document from your tracked hours.</Note>
          </div>
        </Header>
        <Empty>Track some time this month first, then you can generate an invoice document.</Empty>
      </Card>
    );
  }

  const createHtmlInvoice = () => {
    const rows = summary.daily
      .map((day) => {
        const hours = (day.totalMinutes / 60).toFixed(2);
        const amount = currency((day.totalMinutes / 60) * numericRate);

        return `<tr>
  <td>${day.label}</td>
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
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background: #f5f5f5; }
      .totals { margin-top: 24px; font-size: 18px; font-weight: bold; }
      .meta { color: #444; margin-bottom: 16px; }
    </style>
  </head>
  <body>
    <h1>Invoice ${invoiceNumber}</h1>
    <div class="meta">Client: ${clientName}</div>
    <div class="meta">Month: ${summary.monthLabel}</div>
    <div class="meta">Generated: ${formatDate(new Date())}</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Hours</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="totals">Total Hours: ${summary.totalHours}</div>
    <div class="totals">Hourly Rate: ${currency(numericRate)}</div>
    <div class="totals">Total Due: ${currency(totalAmount)}</div>
  </body>
</html>`;

    downloadFile(`${invoiceNumber}.html`, html, 'text/html;charset=utf-8');
  };

  const createCsvInvoice = () => {
    const lines = [
      ['Invoice Number', invoiceNumber],
      ['Client', clientName],
      ['Month', summary.monthLabel],
      ['Hourly Rate', numericRate.toString()],
      [''],
      ['Date', 'Minutes', 'Hours', 'Amount'],
      ...summary.daily.map((day) => [
        day.label,
        day.totalMinutes.toString(),
        (day.totalMinutes / 60).toFixed(2),
        ((day.totalMinutes / 60) * numericRate).toFixed(2),
      ]),
      [''],
      ['Total Hours', summary.totalHours.toString()],
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
          <Note>Turn this month&apos;s tracked hours into a simple invoice document.</Note>
        </div>
      </Header>

      <Form>
        <Row>
          <Field>
            Client Name
            <Input value={clientName} onChange={(event) => setClientName(event.target.value)} />
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
            Hourly Rate (USD)
            <Input
              inputMode="decimal"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
            />
          </Field>
        </Row>
      </Form>

      <SummaryBox>
        <Stat>
          <StatLabel>Billable Hours</StatLabel>
          <StatValue>{summary.totalHours}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Rate</StatLabel>
          <StatValue>{currency(numericRate)}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Total Due</StatLabel>
          <StatValue>{currency(totalAmount)}</StatValue>
        </Stat>
      </SummaryBox>

      <ActionRow>
        <Button onClick={createHtmlInvoice} type="button">
          Download Invoice
        </Button>
        <SecondaryButton onClick={createCsvInvoice} type="button">
          Export CSV
        </SecondaryButton>
      </ActionRow>
    </Card>
  );
}
