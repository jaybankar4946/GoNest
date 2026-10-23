'use client';

import { useMemo, useState } from 'react';

type Props = {
  purpose: 'sale' | 'rent';
  price: number;
  cityName: string;
  brokerage?: string | null;
  securityDeposit?: number | null;
  maintenanceMonthly?: number | null;
};

const inr = (n: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(Math.max(0, Math.round(n)));

function parseBrokerage(value?: string | null, monthlyRent = 0) {
  if (!value || value.toLowerCase() === 'none') return 0;
  const match = value.match(/(\d+(?:\.\d+)?)\s*month/i);
  if (match) return Number(match[1]) * monthlyRent;
  const percent = value.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percent) return monthlyRent * Number(percent[1]) / 100;
  return null;
}

export function TransactionCostEstimate({ purpose, price, cityName, brokerage, securityDeposit, maintenanceMonthly }: Props) {
  const city = cityName.toLowerCase();
  const isMumbai = city.includes('mumbai') && !city.includes('navi mumbai');
  const [buyerType, setBuyerType] = useState<'standard' | 'women'>('standard');
  const [underConstruction, setUnderConstruction] = useState(false);
  const [loanAmount, setLoanAmount] = useState(Math.round(price * 0.8));
  const [legalHelp, setLegalHelp] = useState(15000);
  const [societyCharges, setSocietyCharges] = useState(0);
  const [termMonths, setTermMonths] = useState(11);
  const [rentLegalHelp, setRentLegalHelp] = useState(2500);
  const [rentMoveIn, setRentMoveIn] = useState(0);

  const data = useMemo(() => {
    if (purpose === 'sale') {
      // Indicative urban Maharashtra rates. Exact duty depends on the applicable local body,
      // buyer eligibility, instrument and the higher of agreement value / Ready Reckoner value.
      const dutyRate = isMumbai ? (buyerType === 'women' ? 0.05 : 0.06) : (buyerType === 'women' ? 0.06 : 0.07);
      const stampDuty = price * dutyRate;
      const registration = price > 3000000 ? 30000 : Math.min(30000, Math.max(100, price * 0.01));
      const gst = underConstruction ? price * 0.05 : 0;
      const subtotal = stampDuty + registration + legalHelp + societyCharges + gst;
      return { dutyRate, stampDuty, registration, gst, subtotal, loan: Math.max(0, loanAmount) };
    }
    const deposit = securityDeposit ?? 0;
    const monthlyBrokerage = parseBrokerage(brokerage, price);
    const monthlyContractAmount = price + (maintenanceMonthly ?? 0);
    const totalRent = monthlyContractAmount * termMonths;
    // Common Maharashtra leave-and-license approximation: 0.25% of total rent plus
    // 10% p.a. notional interest on refundable deposit for the agreement term.
    const rentAgreementDuty = Math.max(100, 0.0025 * (totalRent + deposit * 0.1 * termMonths / 12));
    const registration = 1000;
    const initialRent = price;
    const upfront = deposit + initialRent + rentAgreementDuty + registration + rentLegalHelp + rentMoveIn + (monthlyBrokerage ?? 0);
    return { deposit, monthlyBrokerage, totalRent, rentAgreementDuty, registration, initialRent, upfront };
  }, [purpose, isMumbai, buyerType, price, underConstruction, legalHelp, societyCharges, loanAmount, securityDeposit, brokerage, termMonths, rentLegalHelp, rentMoveIn]);

  const section = { border: '1px solid #E5E7EB', borderRadius: 18, padding: 18, margin: '24px 0', background: '#fff' } as const;
  const line = { display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 } as const;
  const field = { width: '100%', border: '1px solid #D1D5DB', borderRadius: 9, padding: '9px 10px', fontSize: 13, background: '#fff' } as const;

  return (
    <section aria-labelledby="transaction-cost-heading" style={section}>
      <div style={{ marginBottom: 14 }}>
        <p style={{ color: '#2563EB', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>GoNest cost transparency</p>
        <h2 id="transaction-cost-heading" style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginTop: 4 }}>
          {purpose === 'sale' ? 'Estimated purchase costs' : 'Estimated move-in costs'}
        </h2>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, marginTop: 6 }}>
          {purpose === 'sale' ? 'Plan for costs beyond the advertised price. Estimates are indicative, not a legal quote.' : 'See the likely cash needed before you move in, including deposit, agreement, and disclosed brokerage.'}
        </p>
      </div>

      {purpose === 'sale' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#374151' }}>Buyer category
              <select value={buyerType} onChange={e => setBuyerType(e.target.value as 'standard' | 'women')} style={{ ...field, marginTop: 6 }}>
                <option value="standard">Standard rate</option><option value="women">Eligible women-only buyers</option>
              </select>
            </label>
            <label style={{ fontSize: 12, color: '#374151' }}>Legal / documentation budget (₹)
              <input type="number" min="0" value={legalHelp} onChange={e => setLegalHelp(Number(e.target.value) || 0)} style={{ ...field, marginTop: 6 }}/>
            </label>
            <label style={{ fontSize: 12, color: '#374151' }}>Society / possession charges (₹)
              <input type="number" min="0" value={societyCharges} onChange={e => setSocietyCharges(Number(e.target.value) || 0)} style={{ ...field, marginTop: 6 }}/>
            </label>
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: '#374151', marginBottom: 12 }}>
            <input type="checkbox" checked={underConstruction} onChange={e => setUnderConstruction(e.target.checked)} style={{ marginTop: 3 }}/>
            Under-construction residential property (show indicative GST estimate)
          </label>
          <div style={line}><span>Stamp duty estimate ({(data.dutyRate * 100).toFixed(0)}%)</span><strong>{inr(data.stampDuty)}</strong></div>
          <div style={line}><span>Registration fee estimate</span><strong>{inr(data.registration)}</strong></div>
          {underConstruction && <div style={line}><span>Indicative GST (subject to eligibility and project status)</span><strong>{inr(data.gst)}</strong></div>}
          <div style={line}><span>Legal / documentation budget (editable)</span><strong>{inr(legalHelp)}</strong></div>
          <div style={line}><span>Society / possession charges (enter quoted amount)</span><strong>{inr(societyCharges)}</strong></div>
          <div style={{ ...line, borderBottom: 0, fontSize: 15, paddingTop: 14 }}><strong>Estimated total beyond property price</strong><strong style={{ color: '#1D4ED8' }}>{inr(data.subtotal)}</strong></div>
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 10 }}>Budget before home-loan costs, interiors, moving, property tax, maintenance/corpus, parking, utility deposits and any project-specific charges. Stamp duty is generally based on the higher of agreement value and applicable Ready Reckoner value. The displayed rate is a broad urban estimate; confirm the exact jurisdiction and eligibility before payment. Under-construction GST is shown at a broad 5% estimate only; eligible affordable housing may qualify for a different rate, and eligibility depends on statutory area/value criteria and project facts—not price alone.</p>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#374151' }}>Agreement term
              <select value={termMonths} onChange={e => setTermMonths(Number(e.target.value))} style={{ ...field, marginTop: 6 }}>
                <option value={11}>11 months</option><option value={12}>12 months</option><option value={24}>24 months</option>
              </select>
            </label>
            <label style={{ fontSize: 12, color: '#374151' }}>Legal / drafting help (₹)
              <input type="number" min="0" value={rentLegalHelp} onChange={e => setRentLegalHelp(Number(e.target.value) || 0)} style={{ ...field, marginTop: 6 }}/>
            </label>
            <label style={{ fontSize: 12, color: '#374151' }}>Society NOC / move-in charges (₹)
              <input type="number" min="0" value={rentMoveIn} onChange={e => setRentMoveIn(Number(e.target.value) || 0)} style={{ ...field, marginTop: 6 }}/>
            </label>
          </div>
          <div style={line}><span>First month rent</span><strong>{inr(data.initialRent)}</strong></div>
          {(maintenanceMonthly ?? 0) > 0 && <div style={line}><span>Monthly maintenance (recurring; verify if included in rent)</span><strong>{inr(maintenanceMonthly ?? 0)}</strong></div>}
          <div style={line}><span>Refundable security deposit (as listed)</span><strong>{inr(data.deposit)}</strong></div>
          <div style={line}><span>Brokerage {data.monthlyBrokerage === null ? '(confirm with agent)' : '(based on listing terms)'}</span><strong>{data.monthlyBrokerage === null ? 'Not calculable' : inr(data.monthlyBrokerage)}</strong></div>
          <div style={line}><span>Indicative agreement stamp duty</span><strong>{inr(data.rentAgreementDuty)}</strong></div>
          <div style={line}><span>Agreement registration (urban estimate)</span><strong>{inr(data.registration)}</strong></div>
          <div style={line}><span>Legal / drafting help (editable)</span><strong>{inr(rentLegalHelp)}</strong></div>
          <div style={line}><span>Society NOC / move-in charges (confirm with society)</span><strong>{inr(rentMoveIn)}</strong></div>
          <div style={{ ...line, borderBottom: 0, fontSize: 15, paddingTop: 14 }}><strong>Estimated cash needed to move in</strong><strong style={{ color: '#1D4ED8' }}>{inr(data.upfront)}</strong></div>
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 10 }}>Agreement duty is a simplified estimate for a Maharashtra leave-and-license agreement and can vary with the agreement wording, refundable/non-refundable deposit treatment and term. A refundable deposit is not a fee. Brokerage shown only when the listing specifies a calculable term. Society NOC/move-in charges are not universal statutory fees—confirm the written amount before paying.</p>
        </>
      )}
      <p style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.6, marginTop: 12 }}>City: {cityName || 'Not specified'} · Estimates can change with local rules and individual circumstances. Verify with IGR Maharashtra / the Sub-Registrar, project documents, society and a qualified property lawyer. No amount here is a demand for payment.</p>
    </section>
  );
}
