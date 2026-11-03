import React from 'react';

export const SH: Record<string, string> = {
  tee: 'M28 12l22 8 22-8 22 20-12 16-8-6v60H26V42l-8 6L6 32z',
  hood: 'M30 14c6-12 34-12 40 0l22 18-12 16-8-6v64H28V42l-8 6L8 32z',
  leg: 'M30 8h40l6 124H56L50 56l-6 76H24z',
  short: 'M26 20h48l6 60H54L50 64l-4 16H20z',
  crop: 'M28 14l6 18c10 12 22 12 32 0l6-18 4 4-8 30c-12 10-24 10-36 0l-8-30z',
  dress: 'M38 8h24l4 32 18 96H16L34 40z',
  jacket: 'M30 10l20 8 20-8 16 24-10 14-8-8v86H32V40l-8 8-10-14z',
  kurta: 'M36 8h28l8 26 8 98H20l8-98z',
};

const SK = ['#f1c9a5', '#d9a066', '#b87a4b', '#8a5a36', '#fbdcc4'];
const HC = ['#1b1410', '#3a2418', '#6b3a1e', '#c79a52', '#0d0d0d'];

let UID = 0;

function hashKey(s: string): number {
  let h = 0;
  for (const c of s) {
    h = (h * 31 + c.charCodeAt(0)) >>> 0;
  }
  return h;
}

function resolveGender(slot: string, deptPrefix: string): string {
  if (deptPrefix === 'Women_') return 'f';
  if (deptPrefix === 'Men_') return 'm';
  if (deptPrefix === 'Kids_') return 'k';
  const n = +(slot.replace(/\D/g, '') || '1');
  const t = slot.replace(/\d/g, '');
  if (deptPrefix === 'Gym_') {
    if (t === 'p') return n <= 4 ? 'f' : n <= 8 ? 'm' : 'k';
    if (t === 'hero') return ['f', 'm', 'k'][n - 1] || 'f';
    if (t === 'look') return ['f', 'm', 'f', 'm', 'k'][n - 1] || 'f';
  }
  return n % 2 ? 'f' : 'm';
}

export function generatePrototypeIllustrationSvg(
  slot: string,
  shape: string,
  deptName = 'Women'
): string {
  const deptPrefix = `${deptName}_`;
  const id = ++UID;
  const h = hashKey(deptPrefix + slot);
  const g = resolveGender(slot, deptPrefix);
  const kid = g === 'k';
  const sk = SK[h % 5];
  const hc = HC[(h >> 3) % 5];
  const pt = (h >> 6) % 3;
  const lg = g === 'f' || (kid && (h & 1) === 1);
  const bottomG = shape === 'leg' || shape === 'short';

  const G: Record<string, string> = {
    tee: 'M31 32l19-5 19 5 11 17-9 6-5-8v37H34V47l-5 8-9-6z',
    hood: 'M31 32l19-5 19 5 12 44-8 3-8-26v40H35V48l-8 26-8-3z',
    crop: 'M36 36q14 14 28 0l2 12q-16 12-32 0z',
    leg: 'M36 82h28l4 56H56l-6-44-6 44H32z',
    short: 'M35 82h30l5 28H53l-3-12-3 12H30z',
    dress: 'M37 32l13-3 13 3 4 24 8 52H25l8-52z',
    jacket: 'M29 32l21-5 21 5 9 44-8 3-6-24v33H34V51l-6 24-8-3z',
    kurta: 'M35 32h30l8 14 5 32-8 2-4-14 3 54H31l3-54-4 14-8-2 5-32z',
  };
  const garmentPath = G[shape] || G.tee;

  const DT: Record<string, string> = {
    tee: '<path d="M44 28q6 6 12 0" stroke="#0005" fill="none" stroke-width="1.2"/>',
    hood: '<path d="M40 26c4 8 16 8 20 0l-3-5H43z" fill="#0003"/><path d="M40 66h20l3 12H37z" fill="#0002"/>',
    leg: '<path d="M36 82h28v5H36z" fill="#0003"/>',
    short: '<path d="M35 82h30v5H35z" fill="#0003"/>',
    dress: '<path d="M34 58h32v4H34z" fill="#0003"/>',
    jacket:
      '<path d="M50 29l-9 20 9 14 9-14z" fill="#fff" opacity=".22"/><circle cx="50" cy="70" r="1.4" fill="#0006"/><circle cx="50" cy="76" r="1.4" fill="#0006"/>',
    kurta:
      '<path d="M44 32q6 9 12 0" stroke="#fff" opacity=".8" fill="none" stroke-width="1.5"/>',
    crop: '<path class="gm" d="M40 30l-4 8M60 30l4 8" style="stroke:var(--f, #d8f25a);stroke-width:3;fill:none"/>',
  };
  const details = DT[shape] || '';

  const ov = pt && 'tee,hood,dress,kurta'.includes(shape);
  const def = ov
    ? pt === 1
      ? `<pattern id="p${id}" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="3" height="7" fill="#fff" opacity=".3"/></pattern>`
      : `<pattern id="p${id}" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.6" fill="#fff" opacity=".35"/></pattern>`
    : '';

  const back = lg
    ? `<path d="M40 12c-7 10-6 34-3 46l9-6V20zM60 12c7 10 6 34 3 46l-9-6V20z" fill="${hc}"/>`
    : '';
  const legs = `<path d="M38 86h11l-1 54h-9zM51 86h11l1 54h-9z" fill="${sk}"/>`;
  const bot =
    shape === 'dress' || bottomG
      ? ''
      : shape === 'kurta'
      ? '<path d="M38 108h11l-1 32h-9zM51 108h11l1 32h-9z" fill="#efe3c8"/>'
      : '<path d="M36 80h28l4 60H57l-7-46-7 46H32z" fill="#241f2c"/>';
  const body = `<path d="M34 32h32l2 52H32z" fill="${sk}"/><path d="M30 34l-9 40 6 2 8-30zM70 34l9 40-6 2-8-30z" fill="${sk}"/>`;
  const tp =
    bottomG || shape === 'jacket'
      ? '<path d="M31 32l19-5 19 5 11 17-9 6-5-8v37H34V47l-5 8-9-6z" fill="#f4f1ea"/>'
      : '';
  const hr = kid ? 10.5 : 9;
  const hy = kid ? 17 : 16;
  const head = `<rect x="46" y="24" width="8" height="8" fill="${sk}"/><ellipse cx="50" cy="${hy}" rx="${hr}" ry="${
    hr + 1.4
  }" fill="${sk}"/><path d="${
    lg
      ? 'M40 12c0-10 20-10 20 0l-1 5c-5-6-13-6-18 0z'
      : 'M41 12c0-9 18-9 18 0l-1 3c-5-4-11-4-16 0z'
  }" fill="${hc}"/>`;
  const extra =
    g === 'f' && (h >> 5) % 2
      ? `<circle cx="50" cy="3" r="5" fill="${hc}"/>`
      : kid && lg
      ? `<circle cx="38" cy="14" r="4" fill="${hc}"/><circle cx="62" cy="14" r="4" fill="${hc}"/>`
      : '';
  const shoes =
    '<ellipse cx="43" cy="141" rx="7" ry="3" fill="#f4f1ea"/><ellipse cx="58" cy="141" rx="7" ry="3" fill="#f4f1ea"/>';

  return `<svg class="il" viewBox="0 0 100 150" aria-hidden="true" style="width:100%;height:100%;"><defs>${def}</defs><ellipse cx="50" cy="146" rx="26" ry="3" fill="#0003"/><circle cx="50" cy="62" r="40" fill="#fff" opacity=".16"/><g transform="${
    kid ? 'translate(10 29.2) scale(.8)' : ''
  }">${back}${legs}${bot}${body}${tp}<path class="gm" d="${garmentPath}"/>${
    ov ? `<path d="${garmentPath}" fill="url(#p${id})"/>` : ''
  }${details}${head}${extra}${shoes}</g></svg>`;
}

export const PrototypeIllustration: React.FC<{
  slot: string;
  shape: string;
  deptName?: string;
  gender?: string;
  style?: React.CSSProperties;
  className?: string;
}> = ({ slot, shape, deptName = 'Women', gender, style, className }) => {
  const effectiveDept = gender === 'm' ? 'Men' : gender === 'k' ? 'Kids' : deptName;
  const svgHtml = React.useMemo(
    () => generatePrototypeIllustrationSvg(slot, shape, effectiveDept),
    [slot, shape, effectiveDept]
  );

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        placeItems: 'end center',
        width: '100%',
        height: '100%',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};

