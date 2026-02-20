interface FilterChipProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function FilterChip({ title, isSelected, onPress }: FilterChipProps) {
  return (
    <button
      onClick={onPress}
      style={{
        padding: '7px 14px',
        borderRadius: 20,
        border: 'none',
        backgroundColor: isSelected ? '#007AFF' : '#e8e8e8',
        color: isSelected ? '#fff' : '#333',
        fontSize: 14,
        fontWeight: isSelected ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {title}
    </button>
  );
}
