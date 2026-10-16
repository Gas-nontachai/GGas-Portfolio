import { Bot, Check, KeyRound, RotateCcw, ServerCog, ShieldCheck, UsersRound } from 'lucide-react'
import type { ReactNode } from 'react'
import react from '../../../assets/life-inventory/react-atom-buddy.png'
import typescript from '../../../assets/life-inventory/typescript-ts-block.png'
import tailwind from '../../../assets/life-inventory/tailwind-wind-wave.png'
import git from '../../../assets/life-inventory/git-branch-fork.png'
import flutter from '../../../assets/life-inventory/flutter-flutter-shard.png'

const existingIcons: Record<string, string> = {
  React: react,
  TypeScript: typescript,
  'Tailwind CSS': tailwind,
  Git: git,
  Flutter: flutter,
}

function DrawnIcon({ name }: { name: string }) {
  let drawing: ReactNode
  switch (name) {
    case 'Webpack':
      drawing = (
        <>
          <path fill="#8edbfa" d="m32 3 25 14v30L32 61 7 47V17Z" />
          <path fill="#268cd9" d="m32 14 15 9v18l-15 9-15-9V23Z" />
          <path d="m17 23 15 9 15-9M32 32v18" fill="none" />
        </>
      )
      break
    case 'npm':
      drawing = (
        <>
          <path fill="#e52d33" d="M3 16h58v32H3Z" />
          <path
            stroke="#fff"
            strokeWidth="5"
            fill="none"
            d="M12 38V25h11v13m9 5V25h11v13H32m20-13v13"
          />
        </>
      )
      break
    case 'Zustand':
      drawing = (
        <>
          <circle fill="#985f32" cx="16" cy="15" r="9" />
          <circle fill="#985f32" cx="48" cy="15" r="9" />
          <rect fill="#b7834a" x="9" y="14" width="46" height="43" rx="20" />
          <ellipse fill="#eecb8e" cx="32" cy="40" rx="13" ry="11" />
          <path fill="#171717" d="m28 35 8 0-4 6Z" />
          <circle cx="22" cy="29" r="2" />
          <circle cx="42" cy="29" r="2" />
          <path d="M32 40v5" />
        </>
      )
      break
    case 'TanStack Query':
      drawing = (
        <>
          <ellipse fill="#64cd75" cx="32" cy="20" rx="10" ry="16" />
          <ellipse fill="#ff8ab6" cx="21" cy="34" rx="16" ry="10" transform="rotate(30 21 34)" />
          <ellipse fill="#50cafa" cx="43" cy="34" rx="16" ry="10" transform="rotate(-30 43 34)" />
          <ellipse fill="#f5d54c" cx="32" cy="45" rx="10" ry="15" />
          <circle fill="#c5eb75" cx="32" cy="32" r="12" />
          <path fill="#fff8de" d="m28 24 10 7-7 10-6-6 5-3Z" />
        </>
      )
      break
    case 'Node.js':
      drawing = (
        <>
          <path fill="#76c959" d="m32 4 25 14v28L32 60 7 46V18Z" />
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontWeight="900"
            fontSize="25"
            stroke="none"
            fill="#172d1c"
          >
            JS
          </text>
        </>
      )
      break
    case 'Fastify':
      drawing = (
        <>
          <path fill="#ff693c" d="m4 42 21-29 19-7-4 13 17-5-9 14 12 2-26 24-6-10-13 9 4-14Z" />
          <path fill="#fff8de" d="m28 21 8-4-5 10-7 2Z" strokeWidth="2" />
        </>
      )
      break
    case 'Prisma':
      drawing = (
        <>
          <path fill="#d9e9f4" d="m34 4 25 46-35 11L6 43Z" />
          <path fill="#fff" d="m34 4-10 57 35-11Z" />
          <path fill="none" d="m34 4-10 57" />
        </>
      )
      break
    case 'Google Apps Script':
      drawing = (
        <>
          <path fill="#ffd34e" d="M15 6h24l11 12v39H15a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5Z" />
          <path fill="#fff0a8" d="M39 6v13h11" />
          <path fill="#34a853" d="m21 30 7-6 5 5-5 4 5 4-5 6-7-6 4-4Z" />
          <path fill="#4285f4" d="m35 29 5-5 7 6-4 4 4 4-7 6-5-6 5-4Z" />
          <path fill="#fbbc04" d="m28 33 7-8 6 5-7 8-6 6-6-5Z" />
        </>
      )
      break
    case 'React Router':
      drawing = (
        <>
          <path fill="none" stroke="#f08a62" strokeWidth="8" d="M18 16v30q0 7 8 7h15q7 0 7-7V34" />
          <circle fill="#f08a62" cx="18" cy="13" r="7" />
          <circle fill="#f08a62" cx="18" cy="50" r="7" />
          <circle fill="#f08a62" cx="48" cy="31" r="7" />
          <path fill="#fff3de" d="m39 29 10-8 10 8-10 8Z" />
        </>
      )
      break
    case 'PostgreSQL':
      drawing = (
        <>
          <path fill="#76a9d3" d="M10 18q0-10 22-10t22 10v27q0 10-22 10T10 45Z" />
          <ellipse fill="#b8d9f0" cx="32" cy="18" rx="22" ry="10" />
          <path fill="none" d="M10 31q0 10 22 10t22-10M10 43q0 9 22 9t22-9" />
          <path fill="#fff" stroke="none" d="M24 18h16v5H29v4h9v5h-9v9h-5Z" />
          <path fill="#fff" stroke="none" d="M38 18h5v23h-5Z" />
        </>
      )
      break
    case 'REST APIs':
      drawing = (
        <>
          <path
            fill="#70d7f8"
            d="m26 3 12 0 3 7 8 2 6 10 6 4v12l-7 4-3 9-10 3-4 7H25l-4-7-9-3-3-9-6-4V26l6-4 3-10 9-2Z"
          />
          <circle fill="#bdefff" cx="32" cy="32" r="20" />
          <text
            x="32"
            y="38"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontWeight="900"
            fontSize="16"
            stroke="none"
          >
            API
          </text>
        </>
      )
      break
    default:
      drawing = (
        <>
          <rect fill="#bdefff" x="8" y="8" width="48" height="48" rx="10" />
          <KeyRound x="14" y="14" width="36" height="36" strokeWidth="3" />
        </>
      )
  }
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="#171717"
      strokeWidth="3.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {drawing}
    </svg>
  )
}

export default function TechnologyBadge({ name }: { name: string }) {
  const src = existingIcons[name]
  const symbol =
    name === 'Authentication' ? (
      <ShieldCheck />
    ) : name === 'Authorization' ? (
      <UsersRound />
    ) : name === 'Unit testing' ? (
      <Check />
    ) : name === 'Agile Scrum' ? (
      <RotateCcw />
    ) : name === 'AI-assisted development' ? (
      <Bot />
    ) : name === 'Go' ? (
      <ServerCog />
    ) : null

  return (
    <li className="sustainability-tech-badge">
      <span
        className={`sustainability-tech-icon${symbol ? ' sustainability-tech-symbol' : ''}`}
        aria-hidden="true"
      >
        {src ? <img src={src} alt="" draggable={false} /> : (symbol ?? <DrawnIcon name={name} />)}
      </span>
      <span>{name}</span>
    </li>
  )
}
