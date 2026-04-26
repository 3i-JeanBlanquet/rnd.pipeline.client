import type { CSSProperties, ReactNode } from 'react';

const base: CSSProperties = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  color: '#868e96',
  textAlign: 'center',
  padding: 4,
  boxSizing: 'border-box',
};

/** Plain markup helper (not a separate React component module in /images). */
export function previewPlaceholder(imageType: string, size: string): ReactNode {
  const fill = size === '100%';
  return (
    <div
      style={{
        ...base,
        width: fill ? '100%' : size,
        height: fill ? '100px' : size,
      }}
    >
      {imageType}
      <br />
      Not available
    </div>
  );
}
