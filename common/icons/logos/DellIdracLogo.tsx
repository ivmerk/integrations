import * as React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

export const DellIdracLogo = (props: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 336"
    {...props}
  >
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g transform="translate(35,52)" fill="#0B86C8">
      <path d="M0 0 H66 C118 0 156 33 156 84 C156 135 118 168 66 168 H0 Z M48 44 V124 H66 C91 124 108 110 108 84 C108 58 91 44 66 44 Z"/>
      <g transform="translate(153,5) rotate(-34 55 79)">
        <rect x="0" y="18" width="114" height="26" rx="1"/>
        <rect x="0" y="64" width="92" height="26" rx="1"/>
        <rect x="0" y="110" width="114" height="26" rx="1"/>
      </g>
      <path d="M250 0 H298 V124 H384 V168 H250 Z"/>
      <path d="M396 0 H444 V124 H530 V168 H396 Z"/>
      <text x="546" y="25" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="700">™</text>
    </g>
    <g fill="#000000" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">
      <text x="618" y="224" fontSize="140">iDRAC</text>
    </g>
  </svg>
);
