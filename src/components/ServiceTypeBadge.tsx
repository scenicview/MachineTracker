import type { ServiceType } from '../types';

interface ServiceTypeBadgeProps {
  type: ServiceType;
}

export default function ServiceTypeBadge({ type }: ServiceTypeBadgeProps) {
  const is250 = type === '250hr';
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: is250 ? 'rgba(0,122,255,0.12)' : 'rgba(255,149,0,0.12)',
        color: is250 ? '#007AFF' : '#FF9500',
      }}
    >
      {is250 ? '250 hr' : '1000 hr'}
    </span>
  );
}
