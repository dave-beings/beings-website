/**
 * StadiumInput — Morphing input bar (Workspace Studio pattern)
 * 
 * Matches the Google Workspace Studio stadium pill architecture:
 * Grey outer container → White pill (absolute, blue shadow) → Content
 * 
 * Compact: 576x56 stadium bar with placeholder + "Transcribe" pill
 * Expanded: 624x192 card with floating label, textarea, CTA — morphs in place
 * 
 * Layers (inside-out):
 *   .stadium-bar         — Grey outer container (#F0F4F9)
 *   .stadium-glow        — Animated radial gradients (expanded only)
 *   .stadium-shimmer     — Gradient sweep border ring (expanded only)
 *   .stadium-pill        — White pill with blue-tinted shadow
 *   .stadium-label       — Floating label (absolute, expanded only)
 *   content              — Compact or expanded content (crossfade)
 *   .stadium-cta-wrap    — CTA button (flex-end of outer container)
 */

import { useState, useRef, useEffect } from 'react';

interface Props {
  placeholder?: string;
  expandedPlaceholder?: string;
  label?: string;
  suggestions?: string[];
}

export default function StadiumInput({
  placeholder = 'Click to start speaking...',
  expandedPlaceholder = 'Start speaking and watch your words appear in real time',
  label = 'Live transcription',
  suggestions = ['Try reading a paragraph aloud', 'Describe your last research interview', 'Test with multiple speakers', 'See how fast it keeps up'],
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [hasText, setHasText] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!expanded) return;
    // Focus textarea after morph transition
    const timer = setTimeout(() => textareaRef.current?.focus(), 320);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [expanded]);

  return (
    <>
      {/* Scrim */}
      <div 
        className={`stadium-scrim ${expanded ? 'stadium-scrim--visible' : ''}`}
        onClick={() => setExpanded(false)}
        aria-hidden="true"
      />

      <div className="stadium-wrapper">
        {/* The morphing bar — grey outer container */}
        <div
          className={`stadium-bar ${expanded ? 'stadium-bar--expanded' : ''}`}
          onClick={() => !expanded && setExpanded(true)}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
        >
          {/* Glow layer — animated radial gradients behind pill (expanded only) */}
          <div className="stadium-glow" aria-hidden="true" />

          {/* Shimmer layer — gradient sweep border ring (expanded only) */}
          <div className="stadium-shimmer" aria-hidden="true" />

          {/* White pill — the elevated white surface with blue shadow */}
          <div className="stadium-pill" />

          {/* Floating label — absolute positioned, visible when expanded */}
          <span className={`stadium-label ${expanded ? 'stadium-label--visible' : ''}`}>
            {label}
          </span>

          {/* Compact content — fades out */}
          <div className={`stadium-compact-content ${expanded ? 'stadium-content--hidden' : ''}`}>
            <span className="stadium-compact-text">{placeholder}</span>
            <span className="stadium-compact-pill">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              Transcribe
            </span>
          </div>

          {/* Expanded content — fades in */}
          <div className={`stadium-expanded-content ${expanded ? '' : 'stadium-content--hidden'}`}>
            <textarea
              ref={textareaRef}
              className="stadium-textarea"
              placeholder={expandedPlaceholder}
              rows={3}
              tabIndex={expanded ? 0 : -1}
              onChange={(e) => setHasText(e.target.value.length > 0)}
            />
            <div className="stadium-expanded-footer">
              <button
                className={`stadium-create ${!hasText ? 'stadium-create--disabled' : ''}`}
                type="button"
                tabIndex={expanded ? 0 : -1}
                disabled={!hasText}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{marginRight: '0.25rem'}}>
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                Start
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions — separate card below, appears after morph */}
        <div className={`stadium-suggestions ${expanded ? 'stadium-suggestions--visible' : ''}`}>
          <span className="stadium-suggestions-label">Try example prompts</span>
          <div className="stadium-chips">
            {suggestions.map((s) => (
              <button key={s} className="stadium-chip" type="button" tabIndex={expanded ? 0 : -1}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* ===== SCRIM ===== */
        .stadium-scrim {
          position: fixed;
          inset: 0;
          background: rgba(240, 244, 249, 0.85);
          z-index: 10;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
        }
        .stadium-scrim--visible {
          opacity: 1;
          pointer-events: auto;
        }

        /* ===== WRAPPER ===== */
        .stadium-wrapper {
          position: relative;
          z-index: 11;
          margin-top: 1rem;
          width: 100%;
          height: 3.5rem;
        }

        /* ===== THE MORPHING BAR (grey outer container) ===== */
        .stadium-bar {
          width: 36rem;
          max-width: 100%;
          height: 3.5rem;
          background: #F0F4F9;
          border-radius: 1.875rem;
          cursor: pointer;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          transition:
            width 300ms cubic-bezier(0.2, 0, 0, 1),
            height 300ms cubic-bezier(0.2, 0, 0, 1),
            background 200ms cubic-bezier(0.2, 0, 0, 1),
            border-radius 300ms cubic-bezier(0.2, 0, 0, 1);
          z-index: 3;
        }

        .stadium-bar--expanded {
          width: 39rem;
          height: 12rem;
          cursor: default;
        }

        /* ===== WHITE PILL (elevated surface) ===== */
        .stadium-pill {
          position: absolute;
          inset: 0;
          background: white;
          border: 1px solid transparent;
          border-radius: 1.875rem;
          box-shadow:
            rgba(11, 87, 208, 0.34) 0px 2px 2px 0px,
            rgba(11, 87, 208, 0.12) 0px 4px 14px 0px;
          box-sizing: border-box;
          transition: box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);
          z-index: 0;
        }

        .stadium-bar--expanded .stadium-pill {
          box-shadow: rgba(165, 211, 250, 0.54) 0px 4px 24px 0px;
        }

        /* ===== GLOW LAYER (expanded only) ===== */
        .stadium-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          z-index: -1;
          /* Close: fast fade-out, no delay */
          transition: opacity 100ms cubic-bezier(0.2, 0, 0, 1);
        }

        .stadium-bar--expanded .stadium-glow {
          opacity: 1;
          /* Open: delayed fade-in after bar starts expanding */
          transition: opacity 200ms ease-out 100ms;
        }

        .stadium-glow::before,
        .stadium-glow::after {
          content: '';
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          filter: blur(10px);
          opacity: 0.7;
          transform: translate(-50%, -50%);
          top: 80px;
          left: 70px;
          z-index: -2;
        }

        .stadium-glow::before {
          background: radial-gradient(circle, rgba(141, 158, 232, 0.5) 0px, rgba(255, 255, 255, 0) 50%);
          animation: stadiumGlow 4s ease infinite 2s;
        }

        .stadium-glow::after {
          background: radial-gradient(circle, rgba(169, 203, 250, 0.5) 0px, rgba(255, 255, 255, 0) 50%);
          animation: stadiumGlow 4s ease infinite;
        }

        /* ===== SHIMMER BORDER (expanded only) ===== */
        .stadium-shimmer {
          position: absolute;
          inset: -3px;
          border-radius: calc(3px + 1.875rem);
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
          opacity: 0;
          /* Close: fast fade-out, no delay */
          transition: opacity 100ms cubic-bezier(0.2, 0, 0, 1);
        }

        .stadium-bar--expanded .stadium-shimmer {
          opacity: 1;
          /* Open: quick fade-in, slight delay */
          transition: opacity 150ms ease-out 50ms;
        }

        .stadium-shimmer::before {
          content: '';
          position: absolute;
          top: -300%;
          left: -100%;
          width: 100%;
          height: 600%;
          transform: rotate(45deg);
          transform-origin: right center;
          background-image: linear-gradient(90deg,
            #fff,
            rgba(141, 158, 232, 0.8),
            rgba(126, 87, 194, 0.6),
            rgba(169, 203, 250, 0.8),
            #fff
          );
          background-repeat: no-repeat;
          animation: stadiumShimmer 0.8s ease-out 100ms forwards;
        }

        /* ===== FLOATING LABEL ===== */
        .stadium-label {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          z-index: 4;
          font-size: 1rem;
          font-weight: 400;
          color: var(--color-primary, #5B6FCC);
          text-align: left;
          opacity: 0;
          pointer-events: none;
          /* Close: fast fade-out */
          transition: opacity 100ms cubic-bezier(0.2, 0, 0, 1);
        }

        .stadium-label--visible {
          opacity: 1;
          /* Open: delayed fade-in */
          transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1) 100ms;
        }

        /* ===== CONTENT CROSSFADE =====
         * Asymmetric timing: the BASE state transition runs on close,
         * the --hidden state transition runs on open.
         *
         * Compact:  close = delayed fade-in (wait for bar to shrink)
         *           open  = fast fade-out
         * Expanded: close = fast fade-out
         *           open  = delayed fade-in (wait for bar to expand)
         */
        .stadium-compact-content,
        .stadium-expanded-content {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        /* Compact: delayed fade-in on close (base state = after --hidden removed) */
        .stadium-compact-content {
          transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1) 150ms;
          display: flex;
          align-items: center;
          padding: 0;
        }

        /* Expanded: delayed fade-in on open (base state = after --hidden removed) */
        .stadium-expanded-content {
          transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1) 100ms;
        }

        /* Hidden = fast fade-out in both directions (applied state transition) */
        .stadium-content--hidden {
          opacity: 0;
          pointer-events: none;
          transition: opacity 100ms cubic-bezier(0.2, 0, 0, 1);
        }

        .stadium-compact-text {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          font-size: 1rem;
          color: var(--color-text-primary, #1A1D2E);
        }

        .stadium-compact-pill {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          height: 3rem;
          padding: 0 1.5rem 0 1rem;
          margin: 0.25rem;
          border-radius: 1.5rem;
          background: #0B57D0;
          color: white;
          font-size: 0.875rem;
          font-weight: 400;
          font-family: inherit;
          white-space: nowrap;
        }

        /* ===== EXPANDED CONTENT ===== */
        .stadium-expanded-content {
          display: flex;
          flex-direction: column;
          padding: 3rem 1.5rem 1.5rem;
          gap: 0.5rem;
        }

        .stadium-textarea {
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 1rem;
          color: var(--color-text-primary, #1A1D2E);
          resize: none;
          line-height: 1.5rem;
          background: transparent;
          flex: 1;
        }

        .stadium-textarea::placeholder {
          color: var(--color-text-secondary, #747775);
        }

        .stadium-expanded-footer {
          display: flex;
          justify-content: flex-end;
        }

        /* ===== CTA BUTTON ===== */
        .stadium-create {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 3rem;
          padding: 0 1.5rem 0 1rem;
          border-radius: 1.5rem;
          border: none;
          background: #0B57D0;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 200ms, color 200ms;
        }

        .stadium-create--disabled {
          background: rgba(31, 31, 31, 0.12);
          color: rgba(16, 16, 16, 0.3);
          cursor: default;
        }

        /* ===== SUGGESTIONS ===== */
        .stadium-suggestions {
          width: 39rem;
          max-width: calc(100vw - 2rem);
          background: white;
          border-radius: 1rem;
          box-shadow: rgba(165, 211, 250, 0.15) 0px 4px 16px 0px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: absolute;
          top: 13rem;
          left: 50%;
          /* Start slightly right-of-center and above — compound diagonal slide-in */
          transform: translateX(-46%) translateY(-0.5rem);
          opacity: 0;
          pointer-events: none;
          /* Close: fast exit, no delay — suggestions vanish first */
          transition:
            opacity 150ms cubic-bezier(0.2, 0, 0, 1),
            transform 150ms cubic-bezier(0.2, 0, 0, 1);
        }

        .stadium-suggestions--visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0);
          /* Open: slower entrance with delay — appear after bar expands */
          transition:
            opacity 200ms cubic-bezier(0.2, 0, 0, 1) 150ms,
            transform 200ms cubic-bezier(0.2, 0, 0, 1) 150ms;
        }

        .stadium-suggestions-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary, #1A1D2E);
          text-align: left;
        }

        .stadium-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .stadium-chip {
          height: 2rem;
          padding: 0 0.75rem;
          border-radius: var(--radius-full, 9999px);
          border: 1px solid var(--color-divider, #E2E8F0);
          background: white;
          color: var(--color-text-primary, #1A1D2E);
          font-size: 0.8125rem;
          font-weight: 400;
          cursor: pointer;
          font-family: inherit;
        }

        .stadium-chip:hover {
          background: #f5f5f5;
        }

        /* ===== KEYFRAMES ===== */
        @keyframes stadiumShimmer {
          from { transform: rotate(45deg) translateX(-100%); }
          to { transform: rotate(45deg) translateX(100%); }
        }

        @keyframes stadiumGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .stadium-bar,
          .stadium-scrim,
          .stadium-compact-content,
          .stadium-expanded-content,
          .stadium-content--hidden,
          .stadium-suggestions,
          .stadium-suggestions--visible,
          .stadium-pill,
          .stadium-create,
          .stadium-glow,
          .stadium-bar--expanded .stadium-glow,
          .stadium-shimmer,
          .stadium-bar--expanded .stadium-shimmer,
          .stadium-label,
          .stadium-label--visible {
            transition: none;
          }
          .stadium-glow::before,
          .stadium-glow::after,
          .stadium-shimmer::before {
            animation: none;
          }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 599px) {
          .stadium-bar {
            width: 100%;
          }
          .stadium-bar--expanded {
            width: 100%;
          }
          .stadium-suggestions {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
