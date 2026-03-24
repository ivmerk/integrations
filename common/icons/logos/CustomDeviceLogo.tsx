import * as React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

export const CustomDeviceLogo = (props: Props) => (
  <svg
    width={192}
    height={100}
    viewBox="0 0 192 100"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    {...props}
  >
    <g transform="translate(46, 10)" stroke="#4D83B2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {/* Monitor */}
      <rect x="10" y="5" width="80" height="50" rx="4" fill="#E8F0F8" />
      <rect x="16" y="11" width="68" height="34" rx="2" fill="#4D83B2" opacity="0.15" />
      {/* Stand */}
      <line x1="50" y1="55" x2="50" y2="65" />
      <line x1="35" y1="65" x2="65" y2="65" />
      {/* Gear on screen */}
      <g transform="translate(50, 28)" fill="#4D83B2" stroke="none">
        <circle r="5" opacity="0.4" />
        <circle r="2" fill="#E8F0F8" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect
            key={angle}
            x={-1.2}
            y={-9}
            width={2.4}
            height={4}
            rx={1}
            transform={`rotate(${angle})`}
            opacity="0.5"
          />
        ))}
      </g>
      {/* Plus sign */}
      <g transform="translate(78, 18)" stroke="#4D83B2" strokeWidth="2.5">
        <line x1="0" y1="-5" x2="0" y2="5" />
        <line x1="-5" y1="0" x2="5" y2="0" />
      </g>
    </g>
  </svg>
);
