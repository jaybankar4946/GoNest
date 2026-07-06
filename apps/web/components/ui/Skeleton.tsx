export function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ borderRadius: 'var(--radius-sm)', ...style }} />;
}

export function PropertyCardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton style={{ aspectRatio: '4/3', borderRadius: 'var(--radius-md)' }} />
      <Skeleton style={{ height: 18, width: '60%' }} />
      <Skeleton style={{ height: 14, width: '80%' }} />
      <Skeleton style={{ height: 14, width: '40%' }} />
    </div>
  );
}
