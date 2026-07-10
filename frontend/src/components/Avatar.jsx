// Bộ 8 avatar vẽ bằng SVG (người đội mũ bảo hiểm với màu sắc khác nhau).
// Dùng: <Avatar name="avatar3" size={40} />
const VARIANTS = {
  avatar1: { helmet: '#0d6efd', skin: '#f4c095', bg: '#e7f1ff', visor: '#90e0ef' },
  avatar2: { helmet: '#e63946', skin: '#f4c095', bg: '#ffe3e3', visor: '#ffd166' },
  avatar3: { helmet: '#2a9d8f', skin: '#c68642', bg: '#dcf5f0', visor: '#bde0fe' },
  avatar4: { helmet: '#f4a261', skin: '#8d5524', bg: '#fff1e0', visor: '#e0fbfc' },
  avatar5: { helmet: '#6f42c1', skin: '#f4c095', bg: '#efe5ff', visor: '#ffc8dd' },
  avatar6: { helmet: '#1d3557', skin: '#c68642', bg: '#dbe4ff', visor: '#a8dadc' },
  avatar7: { helmet: '#ff6b6b', skin: '#8d5524', bg: '#ffe8e8', visor: '#caffbf' },
  avatar8: { helmet: '#20c997', skin: '#f4c095', bg: '#d9fbee', visor: '#fdffb6' },
};

export const AVATAR_NAMES = Object.keys(VARIANTS);

export default function Avatar({ name = 'avatar1', size = 40, className = '' }) {
  // Nếu là ảnh do người dùng upload (/uploads/...) hoặc URL thì hiện ảnh thật
  if (name && (name.startsWith('/uploads/') || name.startsWith('http'))) {
    return (
      <img
        src={name}
        alt="avatar"
        width={size}
        height={size}
        className={className}
        style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    );
  }

  const v = VARIANTS[name] || VARIANTS.avatar1;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ borderRadius: '50%', display: 'block' }}
    >
      <circle cx="50" cy="50" r="50" fill={v.bg} />
      {/* cổ áo */}
      <path d="M20 100 Q 50 72 80 100 Z" fill={v.helmet} opacity="0.85" />
      {/* mặt */}
      <circle cx="50" cy="52" r="24" fill={v.skin} />
      {/* mũ bảo hiểm */}
      <path d="M24 50 A 26 26 0 0 1 76 50 L 76 56 L 24 56 Z" fill={v.helmet} />
      <rect x="46" y="20" width="8" height="6" rx="3" fill={v.helmet} />
      {/* kính mũ */}
      <rect x="30" y="42" width="40" height="10" rx="5" fill={v.visor} opacity="0.95" />
      {/* mắt + miệng */}
      <circle cx="42" cy="60" r="2.6" fill="#33415c" />
      <circle cx="58" cy="60" r="2.6" fill="#33415c" />
      <path d="M44 69 Q 50 74 56 69" stroke="#33415c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
