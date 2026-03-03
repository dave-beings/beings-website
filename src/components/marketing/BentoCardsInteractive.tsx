/**
 * BentoCardsInteractive — Hover-to-expand bento cards
 * 
 * Matches Workspace Studio's featured workflow card row:
 * - 3-card flex row: 1 featured (520×208) + 2 compact (168×208)
 * - Featured: white bg, blue-tinted shadow, label + title + icons + CTA
 * - Compact: lavender bg, centered title + icon
 * - Width transition on hover/click, compact overlay fades out
 * 
 * Key reference values extracted from studio.workspace.google.com:
 *   Featured: white, shadow rgba(11,87,208,0.34), padding 24px 32px
 *   Compact: #f7edff, padding 32px 24px, text rgb(40,2,85)
 *   Label: 14px/500, rgb(116,56,210)
 *   Title: 24px/400, rgba(0,0,0,0.87), line-height 32px
 *   CTA: rgb(116,56,210), 40px h, 20px radius
 *   Transition: 0.2s (200ms)
 */

import { useState, useEffect } from 'react';

interface BentoIcon {
  /** Material Symbols icon name (ignored if svg is provided) */
  icon: string;
  /** Background tint colour */
  tint: string;
  /** Icon foreground colour */
  color: string;
  /** Optional inline SVG path for brand logos */
  svg?: string;
  /** SVG viewBox (default '0 0 24 24') */
  viewBox?: string;
  /** Optional image URL for official brand logos */
  img?: string;
}

interface BentoCard {
  id: string;
  label: string;
  title: string;
  ctaLabel?: string;
  /** Material Symbols icon inside the CTA button */
  ctaIcon?: string;
  /** Material Symbols icon for collapsed state */
  compactIcon: string;
  /** Service icons shown in expanded footer (max 4, WS pattern) */
  icons?: BentoIcon[];
  /** Overflow count shown as "+N" badge after icons */
  overflow?: number;
}

const defaultCards: BentoCard[] = [
  {
    id: 'transcribe',
    label: 'Unlimited uploads',
    title: 'Get an analysis in your inbox — just upload a recording or document',
    ctaLabel: 'Upload',
    ctaIcon: 'upload',
    compactIcon: 'upload',
    icons: [
      { icon: 'mic', tint: '#dbeafe', color: '#1d4ed8' },             // Audio — blue
      { icon: 'videocam', tint: '#ede9fe', color: '#6d28d9' },        // Video — purple
      { icon: 'picture_as_pdf', tint: '#fee2e2', color: '#dc2626' },  // PDF — red
      { icon: 'description', tint: '#f3f4f6', color: '#4b5563' },     // Docs — grey
    ],
    overflow: 20,
  },
  {
    id: 'meetings',
    label: 'Unlimited recordings',
    title: 'Get an analysis in your inbox — just invite aida@beings.com',
    ctaLabel: 'Record',
    ctaIcon: 'radio_button_checked',
    compactIcon: 'radio_button_checked',
    icons: [
      { icon: 'zoom', tint: 'transparent', color: '#0b5cff', img: '/icons/zoom.svg' },
      { icon: 'teams', tint: 'transparent', color: '#5059c9', img: '/icons/teams.svg' },
      { icon: 'meet', tint: 'transparent', color: '#00897b', img: '/icons/meet.svg' },
    ],
  },
  {
    id: 'evidence',
    label: 'Traceable insights',
    title: 'Every insight linked to its evidence — across all your projects',
    ctaLabel: 'Ask Aida',
    ctaIcon: 'auto_awesome',
    compactIcon: 'auto_awesome',
    icons: [
      { icon: 'search', tint: '#dbeafe', color: '#1d4ed8' },          // Search
      { icon: 'format_quote', tint: '#fef9c3', color: '#ca8a04' },    // Evidence
      { icon: 'fact_check', tint: '#dcfce7', color: '#16a34a' },      // Verification
    ],
  },
];

const COMPACT_W = 168;
const EXPANDED_W = 520;
const GAP = 16;
const ROW_W = EXPANDED_W + COMPACT_W * 2 + GAP * 2; // 888px

export default function BentoCardsInteractive({ cards = defaultCards }: { cards?: BentoCard[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Load Material Symbols font if not already present
  useEffect(() => {
    const id = 'material-symbols-rounded';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="bento-row" style={{ width: ROW_W, gap: GAP }}>
      {cards.map((card, i) => {
        const isActive = i === activeIndex;
        const w = isActive ? EXPANDED_W : COMPACT_W;
        return (
          <div
            key={card.id}
            className={`bento-card ${isActive ? 'bento-card--active' : ''}`}
            style={{ width: w }}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => setActiveIndex(i)}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
          >
            {/* Expanded content — always rendered, clipped by card width */}
            <div className="bento-expanded">
              <span className="bento-label">{card.label}</span>
              <p className="bento-title">{card.title}</p>
              <div className="bento-footer">
                <div className="bento-icons">
                  {card.icons?.map((ic) => (
                    <span
                      key={ic.icon}
                      className="bento-icon-box"
                      style={{ background: ic.tint, color: ic.color }}
                    >
                      {ic.img ? (
                        <img src={ic.img} alt={ic.icon} width="18" height="18" className="bento-icon-img" />
                      ) : ic.svg ? (
                        <svg viewBox={ic.viewBox || '0 0 24 24'} fill="currentColor" width="14" height="14">
                          <path d={ic.svg} />
                        </svg>
                      ) : (
                        <span className="material-symbols-rounded bento-icon-glyph">
                          {ic.icon}
                        </span>
                      )}
                    </span>
                  ))}
                  {card.overflow && (
                    <span className="bento-overflow">+{card.overflow}</span>
                  )}
                </div>
                <span className="bento-cta">
                  {card.ctaIcon && (
                    <span className="material-symbols-rounded bento-cta-icon">{card.ctaIcon}</span>
                  )}
                  {card.ctaLabel}
                </span>
              </div>
            </div>

            {/* Compact content — fades out when active */}
            <div className={`bento-compact ${isActive ? 'hidden' : ''}`}>
              <span className="bento-compact-label">{card.label}</span>
              <span className="bento-compact-icon">
                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>
                  {card.compactIcon}
                </span>
              </span>
            </div>
          </div>
        );
      })}

      <style>{`
        .bento-row {
          display: flex;
          height: 13rem;
          margin-inline: auto;
        }

        .bento-card {
          position: relative;
          height: 100%;
          border-radius: 3rem;
          overflow: hidden;
          cursor: pointer;
          /* Base state: lavender (compact cards show this) */
          background: #f7edff;
          /* Width + shadow transition — 200ms to match WS */
          transition:
            width 200ms cubic-bezier(0.2, 0, 0, 1),
            background 200ms cubic-bezier(0.2, 0, 0, 1),
            box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        /* Active card: white bg + blue-tinted shadow */
        .bento-card--active {
          background: white;
          box-shadow:
            rgba(11, 87, 208, 0.34) 0px 2px 2px 0px,
            rgba(11, 87, 208, 0.12) 0px 4px 14px 0px;
        }

        .bento-card:focus-visible {
          outline: 2px solid var(--color-primary, #5B6FCC);
          outline-offset: 2px;
        }

        /* Expanded content: fixed at expanded width, always rendered */
        .bento-expanded {
          position: absolute;
          inset: 0;
          width: ${EXPANDED_W}px;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
        }

        .bento-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #7438d2; /* accentPurple — decorative label */
          margin-bottom: 0.5rem;
          white-space: nowrap;
        }

        .bento-title {
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--color-text-primary, #1A1D2E);
          line-height: 2rem;
          margin: 0;
          flex: 1;
        }

        .bento-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .bento-icons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .bento-icon-box {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bento-icon-glyph {
          font-size: 1rem;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .bento-icon-img {
          border-radius: 0.25rem;
        }

        .bento-overflow {
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-text-secondary, #4A5568);
          background: rgba(0, 0, 0, 0.04);
        }

        .bento-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          height: 2.5rem;
          padding: 0 1.5rem 0 1rem;
          border-radius: 1.25rem;
          background: #7438d2; /* accentPurple — secondary to hero's blue */
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .bento-cta-icon {
          font-size: 1.125rem;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        /* Compact content: on top, covers expanded text when card is narrow */
        .bento-compact {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: #f7edff;
          border-radius: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: center;
          padding: 2rem 1.5rem;
          transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        .bento-compact.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .bento-compact-label {
          font-size: 1.375rem;
          font-weight: 400;
          color: #280255; /* darkPurple — compact card text */
          line-height: 1.75rem;
        }

        .bento-compact-icon {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 14px; /* squircle — matches product iconBoxRadius */
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5629A4; /* iconPurple — compact card icon */
        }

        .bento-compact-icon .material-symbols-rounded {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        @media (prefers-reduced-motion: reduce) {
          .bento-card, .bento-compact { transition: none; }
        }

        @media (max-width: 599px) {
          .bento-row {
            flex-direction: column;
            width: 100% !important;
            height: auto;
            gap: 0.75rem;
          }
          .bento-card {
            width: 100% !important;
            height: auto;
            min-height: 12rem;
          }
          /* Show all cards expanded on mobile (no hover) */
          .bento-compact {
            display: none;
          }
          .bento-expanded {
            position: relative;
            width: 100%;
          }
          .bento-title {
            font-size: 1.25rem;
            line-height: 1.75rem;
          }
          .bento-label {
            font-size: 0.8125rem;
          }
          .bento-card {
            background: white;
            box-shadow:
              rgba(11, 87, 208, 0.34) 0px 2px 2px 0px,
              rgba(11, 87, 208, 0.12) 0px 4px 14px 0px;
          }
        }
      `}</style>
    </div>
  );
}
