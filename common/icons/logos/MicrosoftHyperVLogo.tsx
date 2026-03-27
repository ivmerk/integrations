import * as React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

export const MicrosoftHyperVLogo = (props: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 900 540"
    {...props}
  >
    <rect width="100%" height="100%" fill="white"/>
    <g transform="translate(90,125)">
      <polygon points="0,35 105,25 105,125 0,120" fill="#11A0DB"/>
      <polygon points="122,23 260,8 260,122 122,122" fill="#11A0DB"/>
      <polygon points="0,138 105,143 105,244 0,232" fill="#11A0DB"/>
      <polygon points="122,142 260,142 260,260 122,246" fill="#11A0DB"/>
    </g>
    <g fill="#000000" fontFamily="Segoe UI, Arial, Helvetica, sans-serif">
      <text x="410" y="235" fontSize="74" fontWeight="600">Microsoft</text>
      <text x="410" y="320" fontSize="74" fontWeight="400">Hyper-V</text>
    </g>
  </svg>
);
