import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { EMPTY_BUSINESS_PROFILE, type BusinessProfile } from '../../time/types';

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

export function BusinessProfileCard({
  profile,
  loading,
  saving,
  onSaveProfile,
}: {
  profile: BusinessProfile;
  loading: boolean;
  saving: boolean;
  onSaveProfile: (profile: BusinessProfile) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<BusinessProfile>(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  return (
    <Card>
      <Header>
        <div>
          <Title>Business File</Title>
          <Note>Store the identity and defaults that appear on generated invoices.</Note>
        </div>
      </Header>

      <Section>
        {loading ? (
          <Note>Loading business details...</Note>
        ) : (
          <>
            <FormGrid>
              <Field>
                Business Name
                <Input
                  value={draft.businessName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, businessName: event.target.value }))
                  }
                />
              </Field>

              <Field>
                Contact Name
                <Input
                  value={draft.contactName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, contactName: event.target.value }))
                  }
                />
              </Field>

              <Field>
                Email
                <Input
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </Field>

              <Field>
                Invoice Prefix
                <Input
                  value={draft.invoicePrefix}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, invoicePrefix: event.target.value }))
                  }
                />
              </Field>

              <Field>
                Address Line 1
                <Input
                  value={draft.addressLine1}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, addressLine1: event.target.value }))
                  }
                />
              </Field>

              <Field>
                Address Line 2
                <Input
                  value={draft.addressLine2}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, addressLine2: event.target.value }))
                  }
                />
              </Field>

              <Field>
                City / State / Postal
                <Input
                  value={draft.cityStatePostal}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, cityStatePostal: event.target.value }))
                  }
                />
              </Field>

              <Field>
                Payment Terms
                <Input
                  value={draft.paymentTerms}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, paymentTerms: event.target.value }))
                  }
                />
              </Field>

              <Field>
                Currency
                <Input
                  value={draft.currency}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, currency: event.target.value.toUpperCase() }))
                  }
                />
              </Field>
            </FormGrid>

            <ButtonRow>
              <Button
                disabled={saving}
                onClick={() => void onSaveProfile({ ...EMPTY_BUSINESS_PROFILE, ...draft })}
                type="button"
              >
                {saving ? 'Saving' : 'Save Business Info'}
              </Button>
            </ButtonRow>
          </>
        )}
      </Section>
    </Card>
  );
}
