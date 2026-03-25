import * as React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

export const MysqlLogo = (props: Props) => (
  <svg
    width={192}
    height={100}
    viewBox="0 0 192 100"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    {...props}
  >
    <rect x="16" y="10" width="160" height="80" rx="12" fill="#00758F" />
    <text
      x="96"
      y="58"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="22"
      fontWeight="bold"
      fill="#F29111"
    >
      MySQL
    </text>
  </svg>
);
