interface EmptyStateProps {
  icon: string;
  message: string;
}

export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, flex: 1 }}>
      <span style={{ fontSize: 56 }}>{icon}</span>
      <p style={{ marginTop: 16, fontSize: 17, color: '#999', textAlign: 'center' }}>{message}</p>
    </div>
  );
}
