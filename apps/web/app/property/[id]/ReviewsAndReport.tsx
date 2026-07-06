'use client';
import { useState, useEffect } from 'react';
import { Star, Flag } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { getListingReviews, submitReview, getListingRatingSummary, reportListing } from '@/lib/api';
import { timeAgo } from '@/lib/format';

const REPORT_REASONS = ['Fake listing','Wrong price','Already sold/rented','Spam','Inappropriate content','Other'];

export function ReviewsAndReport({ listingId }: { listingId: string }) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [reported, setReported] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getListingReviews(listingId).then(setReviews);
    getListingRatingSummary(listingId).then(setSummary);
  }, [listingId]);

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    await submitReview({ listing_id: listingId, reviewer_id: user.id, reviewer_name: profile?.full_name ?? 'Anonymous', rating, comment: comment || undefined });
    const [r, s] = await Promise.all([getListingReviews(listingId), getListingRatingSummary(listingId)]);
    setReviews(r); setSummary(s); setComment('');
    setBusy(false);
  };

  const sendReport = async () => {
    if (!reason) return;
    setBusy(true);
    await reportListing({ listing_id: listingId, reporter_id: user?.id ?? null, reason, details: details || undefined });
    setReported(true);
    setBusy(false);
  };

  return (
    <div style={{marginTop:40,paddingTop:32,borderTop:'1px solid #E5E5E5'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <h2 style={{fontSize:18,fontWeight:600,color:'#111'}}>Reviews</h2>
          {summary.count > 0 && (
            <span style={{display:'flex',alignItems:'center',gap:4,fontSize:14,color:'#6B6B6B'}}>
              <Star size={14} fill="#111" stroke="none" /> {summary.avg.toFixed(1)} ({summary.count})
            </span>
          )}
        </div>
        <button onClick={()=>setShowReport(s=>!s)} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#6B6B6B'}}>
          <Flag size={13}/> Report listing
        </button>
      </div>

      {showReport && !reported && (
        <div style={{padding:16,border:'1px solid #E5E5E5',borderRadius:12,marginBottom:24}}>
          <p style={{fontSize:13,fontWeight:600,marginBottom:10}}>Why are you reporting this listing?</p>
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
            {REPORT_REASONS.map(r => (
              <label key={r} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer'}}>
                <input type="radio" name="reason" checked={reason===r} onChange={()=>setReason(r)} />
                {r}
              </label>
            ))}
          </div>
          <textarea placeholder="Additional details (optional)" rows={2} value={details} onChange={e=>setDetails(e.target.value)}
            style={{width:'100%',padding:'8px 10px',border:'1px solid #E5E5E5',borderRadius:8,fontSize:13,outline:'none',resize:'none',marginBottom:10}} />
          <button onClick={sendReport} disabled={!reason||busy}
            style={{padding:'8px 18px',borderRadius:9999,fontSize:12,fontWeight:600,color:'#fff',background:'#DC2626',border:'none',opacity:!reason?0.5:1}}>
            Submit report
          </button>
        </div>
      )}
      {reported && <p style={{fontSize:13,color:'#16A34A',marginBottom:24}}>Thanks — our team will review this listing.</p>}

      {user && (
        <div style={{padding:16,border:'1px solid #E5E5E5',borderRadius:12,marginBottom:24}}>
          <p style={{fontSize:13,fontWeight:600,marginBottom:8}}>Leave a review</p>
          <div style={{display:'flex',gap:4,marginBottom:10}}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={()=>setRating(n)}>
                <Star size={20} fill={n<=rating?'#111':'none'} stroke="#111" />
              </button>
            ))}
          </div>
          <textarea placeholder="Share your experience (optional)" rows={2} value={comment} onChange={e=>setComment(e.target.value)}
            style={{width:'100%',padding:'8px 10px',border:'1px solid #E5E5E5',borderRadius:8,fontSize:13,outline:'none',resize:'none',marginBottom:10}} />
          <button onClick={submit} disabled={busy}
            style={{padding:'8px 18px',borderRadius:9999,fontSize:12,fontWeight:600,color:'#fff',background:'#111',border:'none'}}>
            Submit review
          </button>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {reviews.length===0 && <p style={{fontSize:13,color:'#9B9B9B'}}>No reviews yet.</p>}
        {reviews.map((r:any) => (
          <div key={r.id} style={{paddingBottom:14,borderBottom:'1px solid #F0F0F0'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:600,color:'#111'}}>{r.reviewer_name}</span>
              <span style={{fontSize:11,color:'#9B9B9B'}}>{timeAgo(r.created_at)}</span>
            </div>
            <div style={{display:'flex',gap:2,marginBottom:4}}>
              {[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n<=r.rating?'#111':'none'} stroke="#111" />)}
            </div>
            {r.comment && <p style={{fontSize:13,color:'#3D3D3D'}}>{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
