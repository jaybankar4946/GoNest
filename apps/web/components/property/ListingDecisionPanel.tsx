'use client';

import { useMemo, useState } from 'react';
import { Calculator, BrainCircuit, ShieldCheck, Wallet, TrendingUp, Info } from 'lucide-react';

type Props = {
  kind: 'sale' | 'rent' | 'project';
  title: string;
  price: number | null;
  areaSqft?: number | null;
  bedrooms?: number | null;
  maintenance?: number | null;
  deposit?: number | null;
  brokerage?: string | null;
  verified?: boolean;
  availabilityVerified?: boolean;
  observedAt?: string | null;
  sourceUrl?: string | null;
  possessionDate?: string | null;
  projectStatus?: string | null;
  unitCount?: number;
  projectCharges?: number | null;
  comparables?: { price: number; areaSqft: number | null }[];
};
const inr = (n:number) => '₹' + Math.round(Number.isFinite(n) ? n : 0).toLocaleString('en-IN');
const val = (n:string) => Math.max(0, Number(n) || 0);
const emiFor = (principal:number, annual:number, years:number) => {
  const n=Math.max(1,years*12), r=annual/1200;
  return r===0 ? principal/n : principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
};
export function ListingDecisionPanel(p:Props) {
  const rent=p.kind==='rent', project=p.kind==='project';
  const [down,setDown]=useState(20), [rate,setRate]=useState(8.5), [years,setYears]=useState(20);
  const [priceAssumption,setPriceAssumption]=useState(p.price == null ? '' : String(p.price));
  const [income,setIncome]=useState('150000'), [commitments,setCommitments]=useState('15000');
  const [stamp,setStamp]=useState('0'), [registration,setRegistration]=useState('0'), [brokerage,setBrokerage]=useState('0'), [other,setOther]=useState('0');
  const [monthlyRent,setMonthlyRent]=useState(String(p.price ?? 0)), [deposit,setDeposit]=useState(String(p.deposit ?? 0)), [monthlyMaintenance,setMonthlyMaintenance]=useState(String(p.maintenance ?? 0));
  const [leaseMonths,setLeaseMonths]=useState(11);
  const [booking,setBooking]=useState('0'), [builderCharges,setBuilderCharges]=useState(String(p.projectCharges ?? 0)), [gst,setGst]=useState('0');
  const price=val(priceAssumption), area=p.areaSqft ?? 0;
  const comparableRates=(p.comparables ?? []).filter(x=>x.price>0 && (x.areaSqft ?? 0)>0).map(x=>x.price/(x.areaSqft as number)).sort((a,b)=>a-b);
  const medianRate=comparableRates.length ? (comparableRates.length%2 ? comparableRates[(comparableRates.length-1)/2] : (comparableRates[comparableRates.length/2-1]+comparableRates[comparableRates.length/2])/2) : null;
  const finance=useMemo(()=>{
    const principal=price*(1-down/100), emi=emiFor(principal,rate,years);
    const monthlyIncome=val(income), obligations=val(commitments);
    const ratio=monthlyIncome>0?(emi+obligations)/monthlyIncome*100:null;
    const totalCharges=val(stamp)+val(registration)+val(brokerage)+val(other);
    return {principal,emi,ratio,totalCharges,initialCash:price-principal+totalCharges,total:price+totalCharges,remaining:monthlyIncome?monthlyIncome-obligations-emi:null};
  },[price,down,rate,years,income,commitments,stamp,registration,brokerage,other]);
  const rentMath=useMemo(()=>{
    const m=val(monthlyRent), d=val(deposit), maint=val(monthlyMaintenance);
    const moveIn=m+maint+d+val(brokerage)+val(registration)+val(other);
    return {monthly:m+maint,moveIn,lease:moveIn+(m+maint)*Math.max(0,leaseMonths-1),rentRatio:val(income)>0?(m+maint)/val(income)*100:null};
  },[monthlyRent,deposit,monthlyMaintenance,brokerage,registration,other,leaseMonths,income]);
  const projectMath=useMemo(()=>{
    const charges=val(builderCharges)+val(gst)+val(stamp)+val(registration)+val(other);
    const total=price+charges;
    const paid=val(booking);
    const principal=total*(1-down/100);
    return {charges,total,paid,balance:Math.max(0,total-paid),emi:emiFor(principal,rate,years),initial:total*down/100+charges};
  },[price,builderCharges,gst,stamp,registration,other,booking,down,rate,years]);
  const signal=rent ? (rentMath.rentRatio===null?'Add household income to estimate budget fit':rentMath.rentRatio<=30?'Rent is within the common 30% income planning guide':rentMath.rentRatio<=40?'Rent may stretch the monthly budget':'Rent is a high share of stated household income')
    : finance.ratio===null?'Add household income to estimate affordability':finance.ratio<=35?'Estimated obligations are within a 35% planning range':finance.ratio<=45?'Review other commitments and lender eligibility':'Estimated monthly obligations may be stretched';
  const Field=({label,value,onChange,suffix='₹'}:{label:string;value:string;onChange:(v:string)=>void;suffix?:string})=><label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span><span className="flex items-center rounded-xl border border-slate-200 bg-white px-3"><input type="number" min="0" value={value} onChange={e=>onChange(e.target.value)} className="min-w-0 w-full py-2.5 text-sm outline-none"/><span className="text-xs text-slate-400">{suffix}</span></span></label>;
  return <section id="decision-intelligence" className="my-8 scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="bg-slate-950 px-5 py-5 text-white sm:px-7"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200"><BrainCircuit size={16}/> GoNest Home Finder Intelligence</div><h2 className="mt-2 text-xl font-extrabold sm:text-2xl">Make a confident decision about this {rent?'rental':project?'project':'home'}</h2><p className="mt-1 text-sm leading-6 text-slate-300">Calculations start with this listing's published price and recorded facts. Change assumptions to model your situation.</p></div>
    <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.15fr_.85fr]">
      <div>
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Calculator size={17} className="text-blue-700"/> {rent?'Rental affordability & move-in cost':project?'Project total-cost & loan planner':'Purchase affordability & loan planner'}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Monthly household take-home income" value={income} onChange={setIncome}/>
          {rent ? <><Field label="Monthly rent" value={monthlyRent} onChange={setMonthlyRent}/><Field label="Refundable security deposit" value={deposit} onChange={setDeposit}/><Field label="Monthly maintenance" value={monthlyMaintenance} onChange={setMonthlyMaintenance}/><Field label="Brokerage (confirm actual quote)" value={brokerage} onChange={setBrokerage}/><Field label="Agreement / registration estimate" value={registration} onChange={setRegistration}/><Field label="Moving & other one-time costs" value={other} onChange={setOther}/><label className="block text-xs font-semibold text-slate-600">Lease period <select value={leaseMonths} onChange={e=>setLeaseMonths(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900">{[6,11,12,24,36].map(n=><option key={n} value={n}>{n} months</option>)}</select></label></>
          : <><Field label={project ? "Selected unit / agreement price" : "Agreed property price"} value={priceAssumption} onChange={setPriceAssumption}/><Field label="Other monthly debt commitments" value={commitments} onChange={setCommitments}/>{project&&<><Field label="Builder / parking / amenity charges" value={builderCharges} onChange={setBuilderCharges}/><Field label="GST (only if applicable; confirm)" value={gst} onChange={setGst}/><Field label="Booking amount already planned" value={booking} onChange={setBooking}/></>}<Field label="Stamp duty (confirm current rules)" value={stamp} onChange={setStamp}/><Field label="Registration charges" value={registration} onChange={setRegistration}/><Field label="Brokerage" value={brokerage} onChange={setBrokerage}/><Field label="Legal / society / other charges" value={other} onChange={setOther}/></>}
        </div>
        {!rent&&<div className="mt-5 grid gap-4 sm:grid-cols-3"><label className="text-xs font-semibold text-slate-600">Down payment <b className="float-right">{down}%</b><input aria-label="Down payment percentage" type="range" min="10" max="90" step="5" value={down} onChange={e=>setDown(Number(e.target.value))} className="mt-3 w-full"/></label><label className="text-xs font-semibold text-slate-600">Interest rate <b className="float-right">{rate.toFixed(2)}%</b><input aria-label="Annual interest rate" type="range" min="6" max="16" step=".25" value={rate} onChange={e=>setRate(Number(e.target.value))} className="mt-3 w-full"/></label><label className="text-xs font-semibold text-slate-600">Loan tenure <b className="float-right">{years} years</b><input aria-label="Loan tenure" type="range" min="5" max="30" value={years} onChange={e=>setYears(Number(e.target.value))} className="mt-3 w-full"/></label></div>}
      </div>
      <aside className="h-fit rounded-2xl bg-slate-50 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{rent?'Move-in cash required':project?'Estimated project cost':'Estimated acquisition cost'}</p>
        <p className="mt-2 text-3xl font-extrabold text-blue-800">{!price?'Enter price to calculate':inr(rent?rentMath.moveIn:project?projectMath.total:finance.total)}</p>
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm">
          {rent?<><div className="flex justify-between gap-2"><span className="text-slate-500">Monthly rent + maintenance</span><b>{inr(rentMath.monthly)}</b></div><div className="flex justify-between gap-2"><span className="text-slate-500">Deposit (refundable subject to agreement)</span><b>{inr(val(deposit))}</b></div><div className="flex justify-between gap-2"><span className="text-slate-500">Total lease cash outlay</span><b>{inr(rentMath.lease)}</b></div><div className="flex justify-between gap-2"><span className="text-slate-500">Rent / income</span><b>{rentMath.rentRatio===null?'Add income':rentMath.rentRatio.toFixed(1)+'%'}</b></div></>
          :<><div className="flex justify-between gap-2"><span className="text-slate-500">Estimated monthly EMI</span><b>{price?inr(project?projectMath.emi:finance.emi):'Enter price'}</b></div><div className="flex justify-between gap-2"><span className="text-slate-500">Initial own contribution</span><b>{price?inr(project?projectMath.initial:finance.initialCash):'Enter price'}</b></div><div className="flex justify-between gap-2"><span className="text-slate-500">Loan principal</span><b>{price?inr(project?projectMath.total*(1-down/100):finance.principal):'Enter price'}</b></div>{project&&<div className="flex justify-between gap-2"><span className="text-slate-500">Balance after booking amount</span><b>{price?inr(projectMath.balance):'Enter price'}</b></div>}<div className="flex justify-between gap-2"><span className="text-slate-500">Debt obligations / income</span><b>{finance.ratio===null?'Add income':finance.ratio.toFixed(1)+'%'}</b></div></>}
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3"><p className="text-xs font-bold text-blue-900">Affordability signal</p><p className="mt-1 text-sm font-semibold text-slate-800">{signal}</p><p className="mt-1 text-xs leading-5 text-slate-500">Planning heuristic only, not a lender decision or financial advice. Lenders apply their own eligibility and underwriting.</p></div>
      </aside>
    </div>
    <div className="border-t border-slate-100 px-5 py-5 sm:px-7">
      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><ShieldCheck size={17} className="text-emerald-700"/> Home Finder decision signals</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Price per sq ft</p><p className="mt-1 font-extrabold">{price&&area?inr(price/area):'Area not recorded'}</p><p className="mt-1 text-xs text-slate-500">Uses listing area; confirm carpet vs built-up basis.</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Comparable asking rates</p><p className="mt-1 font-extrabold">{medianRate===null?'Not enough comparable data':inr(medianRate)+'/ sq ft'}</p><p className="mt-1 text-xs text-slate-500">{comparableRates.length ? comparableRates.length+' matching published listings; indicative, not a valuation.' : 'No comparable records with usable area and price.'}</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Listing verification</p><p className="mt-1 font-extrabold">{p.verified?'Verified record':'Verification not confirmed'}</p><p className="mt-1 text-xs text-slate-500">Does not guarantee title or legal due diligence.</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Availability</p><p className="mt-1 font-extrabold">{p.availabilityVerified?'Recently confirmed':'Ask poster to reconfirm'}</p><p className="mt-1 text-xs text-slate-500">Confirm price and possession / move-in date.</p></div>
        <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">{project?'Possession':'Home configuration'}</p><p className="mt-1 font-extrabold">{project?(p.possessionDate||'Not provided'):(p.bedrooms? p.bedrooms+' BHK':'Not recorded')}</p><p className="mt-1 text-xs text-slate-500">{project?(p.projectStatus||'Confirm current construction status'):'Check room sizes and actual usable area.'}</p></div>
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><Info size={14} className="mt-0.5 shrink-0"/> This is decision support, not a property valuation, legal opinion, credit approval or confirmation of availability. Charges and assumptions are editable; verify them with the owner, developer, lender and relevant authorities.</p>
    </div>
  </section>;
}
