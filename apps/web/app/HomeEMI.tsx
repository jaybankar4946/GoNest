'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { calcEMI, formatPrice } from '@/lib/format';

const display = { fontFamily: 'var(--font-manrope), var(--font-display)' } as const;
const CR = 10000000;

export function HomeEMI() {
  const [value, setValue] = useState(1.5 * CR);
  const [extraCosts, setExtraCosts] = useState(8);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(8.75);
  const [years, setYears] = useState(20);
  const loan = value * (1 - down / 100);
  const emi = calcEMI(loan, rate, years);
  const interest = emi * years * 12 - loan;
  const totalPaid = loan + interest;
  const upfront = value * down / 100 + value * extraCosts / 100;
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, n));
  const moneyShort = (n: number) => n >= 10000000 ? `₹${(n / CR).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(2)} L` : fmt(n);
  const slider = 'w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600';
  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0"><span className="text-sm text-gray-500">{k}</span><span className="text-sm font-semibold text-gray-900">{v}</span></div>
  );
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-3">GoNest home finance tools</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-950 mb-4" style={{ ...display, letterSpacing: '-0.035em' }}>Home loan EMI calculator</h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">Estimate your monthly payment, total interest and upfront budget before choosing a home.</p>
        </div>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-start">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ ...display, letterSpacing: '-0.025em' }}>Know your real monthly outgo.</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8">Estimate your home loan EMI before you start visiting properties.</p>
          <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 shadow-sm">
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm font-semibold text-gray-700">Property value</label><span className="text-sm font-bold text-blue-600">{formatPrice(value, 'sale')}</span></div>
              <input type="range" min={2500000} max={100000000} step={500000} value={value} onChange={e => setValue(Number(e.target.value))} className={slider} />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm font-semibold text-gray-700">Down payment ({down}%)</label><span className="text-sm font-bold text-blue-600">{formatPrice(value * down / 100, 'sale')}</span></div>
              <input type="range" min={10} max={90} step={5} value={down} onChange={e => setDown(Number(e.target.value))} className={slider} />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm font-semibold text-gray-700">Interest rate</label><span className="text-sm font-bold text-blue-600">{rate.toFixed(2)}% p.a.</span></div>
              <input type="range" min={6.5} max={12} step={0.05} value={rate} onChange={e => setRate(Number(e.target.value))} className={slider} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Loan tenure</label>
              <div className="flex gap-3">{[10, 15, 20, 25, 30].map(y => (
                <button key={y} onClick={() => setYears(y)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${years === y ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{y}yr</button>
              ))}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-200 shadow-xl lg:sticky lg:top-24">
          <p className="text-sm text-gray-500 text-center mb-2">Monthly EMI</p>
          <p className="text-5xl font-extrabold text-blue-600 text-center mb-1" style={display}>{formatPrice(emi, 'rent').replace('/mo', '')}</p>
          <p className="text-gray-400 text-sm text-center mb-6">per month · principal and interest only</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs text-gray-600">Loan amount</p><p className="mt-1 text-lg font-extrabold text-gray-950">{moneyShort(loan)}</p></div>
            <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-600">Total interest</p><p className="mt-1 text-lg font-extrabold text-gray-950">{moneyShort(interest)}</p></div>
          </div>
          <div className="mb-8">
            <Row k="Property value" v={formatPrice(value, 'sale')} /><Row k="Down payment" v={formatPrice(value * down / 100, 'sale')} />
            <Row k="Estimated purchase costs" v={formatPrice(value * extraCosts / 100, 'sale')} /><Row k="Estimated upfront budget" v={formatPrice(upfront, 'sale')} /><Row k="Total loan payments" v={formatPrice(totalPaid, 'sale')} /><Row k="Total loan cost incl. interest" v={formatPrice(totalPaid, 'sale')} />
          </div>
          <Link href={`/search?purpose=sale&max=${Math.round(value)}`} className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-colors shadow-lg shadow-blue-200">Browse homes up to {formatPrice(value, 'sale')}</Link>
          <p className="text-xs text-gray-500 leading-5 mt-4">Estimate only, not a loan offer. Actual rate, eligibility, taxes, stamp duty, registration, insurance and lender fees vary. Confirm current charges with your lender and relevant authorities.</p>
        </div>
      </div>
      </div>
    </section>
  );
}
