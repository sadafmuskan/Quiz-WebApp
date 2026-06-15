export default function ThemeColors() {
  const palette = [
    { label: 'Primary Dark',   hex: '#134e4a', bg: '#134e4a', text: '#fff' },
    { label: 'Primary',        hex: '#0f766e', bg: '#0f766e', text: '#fff' },
    { label: 'Primary Hover',  hex: '#0d9488', bg: '#0d9488', text: '#fff' },
    { label: 'Primary Light',  hex: '#ccfbf1', bg: '#ccfbf1', text: '#0f766e' },
    { label: 'Light (Mint)',   hex: '#f0fdfa', bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
    { label: 'Sidebar',        hex: '#042f2e', bg: '#042f2e', text: '#5eead4' },
  ];

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {palette.map(c => (
        <div
          key={c.hex}
          title={c.hex}
          style={{
            width: 110,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(4,47,46,0.14)',
            border: c.border ? `1.5px solid ${c.border}` : '1.5px solid rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ height: 64, background: c.bg }} />
          <div style={{ padding: '8px 10px', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#134e4a' }}>{c.label}</div>
            <div style={{ fontSize: 11, color: '#5f8e8b', marginTop: 2, fontFamily: 'monospace' }}>{c.hex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}