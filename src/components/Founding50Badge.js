import { useId } from "react";

// Small vector stencil; transparent chips let the existing brick show through.
// No image download, animation or expensive SVG turbulence filter.
export default function Founding50Badge() {
  const maskId = `founding-${useId().replace(/:/g, "")}`;
  return (
    <svg className="founding-stamp" viewBox="0 0 120 124" role="img" aria-label="Founding 50 supporter">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="124">
          <rect width="120" height="124" fill="white" />
          <path d="M11 32l7 2m-7 40l6-2m78-54l-4 4M96 94l9-2M30 103l4-4M44 14l2 4M16 52l5 1M81 107l-2-5" stroke="black" strokeWidth="2" />
          <path d="M24 62l8-1m10 19l4 1m28-13l5-1M57 95l6-1M79 48l5 1" stroke="black" strokeWidth="1" />
          <g fill="black"><circle cx="30" cy="28" r="1.5"/><circle cx="101" cy="57" r="1.3"/><circle cx="38" cy="93" r="1"/><circle cx="65" cy="22" r="1"/><circle cx="74" cy="84" r="1"/></g>
        </mask>
      </defs>
      <g fill="currentColor" opacity=".6" aria-hidden="true">
        <circle cx="13" cy="25" r="1.4"/><circle cx="8" cy="47" r="1"/><circle cx="105" cy="21" r="1.2"/><circle cx="111" cy="42" r="1.5"/><circle cx="110" cy="80" r="1"/><circle cx="92" cy="109" r="1.6"/><circle cx="25" cy="107" r="1"/><circle cx="9" cy="88" r="1.3"/><circle cx="77" cy="9" r="1"/>
      </g>
      <g mask={`url(#${maskId})`} aria-hidden="true">
        <path d="M61 13C87 12 106 34 106 59C108 84 86 107 60 106C34 109 13 86 14 60C12 35 35 13 61 13Z" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="91 3 72 4 100 2" />
        <path d="M58 10C83 10 111 34 109 61M12 62C11 88 36 110 60 109" fill="none" stroke="currentColor" strokeWidth="1" opacity=".5" />
        <path d="M47 38V24L60 34L73 23V38H68V32L60 39L52 32V38Z" fill="currentColor" />
        <text x="60" y="55" textAnchor="middle" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="900" letterSpacing=".3">FOUNDING</text>
        <text x="60" y="92" textAnchor="middle" fill="currentColor" fontFamily="'Wall Stencil', Impact, serif" fontSize="44" fontWeight="700">50</text>
        <path d="M91 97l-1 17m-2-13v6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".65" />
      </g>
    </svg>
  );
}
