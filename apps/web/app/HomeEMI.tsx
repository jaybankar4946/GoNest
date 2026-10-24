'use client';
import { useState } from 'react';
import Link from 'next/link';
import { calcEMI, formatPrice } from '@/lib/format';

const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;
const CR = 10000000;

export function HomeEMI() {
  const [value, setValue] = useState(1.5 * CR);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(8.75);
  const [years, setYears] = useState(20);
  const [monthlyBudget, setMonthlyBudget] = useState(100000);
  const [showDetails, setShowDetails] = useState(false);
  const loan = value * (1 - down / 100);
  const emi = calcEMI(loan, rate, years);
  const interest = emi * years * 12 - loan;
  const monthlyRate = rate / 1200;
  const factor = monthlyRate === 0 ? 1 / (years * 12) : monthlyRate / (1 - Math.pow(1 + monthlyRate, -years * 12));
  const maxHomePrice = Math.max(0, (monthlyBudget / factor) / (1 - down / 100));
  const slider = 'w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600';
  const metrics = [
    { label: 'Target home price', value: formatPrice(value, 'sale') },
    { label: 'Max home price', value: formatPrice(maxHomePrice, 'sale') },
    { label: 'Target payment', value: `${formatPrice(monthlyBudget, 'rent').replace('/mo', '')}/mo` },
    { label: 'Your est. rate', value: `${rate.toFixed(2)}%` },
    { label: 'Est. APR*', value: `${rate.toFixed(2)}%` },
  ];
  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 shadow-sm">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.85fr_1.6fr] lg:items-center lg:gap-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold text-blue-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">⌂</span>
                GoNest <span className="text-blue-600">BuyAbility</span><sup>℠</sup>
              </div>
              <h2 className="max-w-sm text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl" style={{ ...display, letterSpacing: '-0.03em' }}>Find homes you can afford with GoNest BuyAbility</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">Answer a few questions. We’ll estimate a home price and monthly payment that fit your budget.</p>
              <p className="mt-3 text-xs text-slate-500">GoNest affordability estimate · Not a loan offer</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm sm:p-5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="min-w-0 border-b border-slate-100 pb-3 lg:border-b-0 lg:border-r lg:pr-2 lg:last:border-r-0">
                    <p className="min-h-8 text-xs font-semibold leading-4 text-slate-500">{metric.label}</p>
                    <p className="mt-1 truncate text-lg font-extrabold text-slate-900 sm:text-xl" style={display}>{metric.value}</p>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setShowDetails(v => !v)} className="mt-4 w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {showDetails ? 'Update my estimate' : 'Get your BuyAbility'}
              </button>
              {showDetails && (
                <div className="mt-5 space-y-5 rounded-xl bg-slate-50 p-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="gonest-target-price" className="text-sm font-semibold text-slate-700">Target home price</label><span className="text-sm font-bold text-blue-700">{formatPrice(value, 'sale')}</span></div>
                    <input id="gonest-target-price" aria-label="Target home price" type="range" min={2500000} max={100000000} step={500000} value={value} onChange={e => setValue(Number(e.target.value))} className={slider} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="gonest-budget" className="text-sm font-semibold text-slate-700">Comfortable monthly payment</label><span className="text-sm font-bold text-blue-700">{formatPrice(monthlyBudget, 'rent').replace('/mo', '')}/mo</span></div>
                    <input id="gonest-budget" aria-label="Comfortable monthly payment" type="range" min={15000} max={1000000} step={5000} value={monthlyBudget} onChange={e => setMonthlyBudget(Number(e.target.value))} className={slider} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="gonest-down-payment" className="text-sm font-semibold text-slate-700">Down payment</label><span className="text-sm font-bold text-blue-700">{down}% · {formatPrice(value * down / 100, 'sale')}</span></div>
                    <input id="gonest-down-payment" aria-label="Down payment percentage" type="range" min={10} max={90} step={5} value={down} onChange={e => setDown(Number(e.target.value))} className={slider} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="gonest-rate" className="text-sm font-semibold text-slate-700">Assumed annual interest rate</label><span className="text-sm font-bold text-blue-700">{rate.toFixed(2)}%</span></div>
                    <input id="gonest-rate" aria-label="Assumed annual interest rate" type="range" min={6.5} max={12} step={0.05} value={rate} onChange={e => setRate(Number(e.target.value))} className={slider} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">Loan tenure</p>
                    <div className="flex flex-wrap gap-2">{[10, 15, 20, 25, 30].map(y => <button type="button" key={y} onClick={() => setYears(y)} aria-pressed={years === y} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${years === y ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>{y} years</button>)}</div>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-white p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm text-slate-600">Estimated EMI for target home</span><strong className="text-xl font-extrabold text-blue-700" style={display}>{formatPrice(emi, 'rent').replace('/mo', '')}/mo</strong></div>
                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm"><span className="text-slate-500">Estimated loan amount</span><strong>{formatPrice(loan, 'sale')}</strong></div>
                    <div className="mt-1 flex flex-wrap justify-between gap-2 text-sm"><span className="text-slate-500">Estimated total interest</span><strong>{formatPrice(interest, 'sale')}</strong></div>
                    <Link href={`/search?purpose=sale&max=${Math.round(maxHomePrice)}`} className="mt-4 block rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800">Explore homes within estimated affordability</Link>
                  </div>
                </div>
              )}
              <p className="mt-3 text-center text-[11px] leading-4 text-slate-400">*APR is shown as the assumed rate because lender fees are not included. Estimates only; actual eligibility, rate and EMI depend on lender assessment, fees and your financial profile.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
