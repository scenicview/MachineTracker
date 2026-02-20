interface EquipmentPhotoProps {
  uri: string | null;
  size?: number;
}

export default function EquipmentPhoto({ uri, size = 200 }: EquipmentPhotoProps) {
  if (uri) {
    return (
      <img
        src={uri}
        alt="Equipment"
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.25,
      }}
    >
      🔧
    </div>
  );
}
