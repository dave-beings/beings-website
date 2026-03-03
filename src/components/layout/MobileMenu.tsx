import { useState, useEffect } from 'react';

interface NavLink {
  label: string;
  href: string;
}

interface MobileMenuProps {
  links: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

export default function MobileMenu({ 
  links, 
  ctaLabel = 'Get Started',
  ctaHref = '/contact'
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-sm 
                   text-[var(--color-text-primary)] hover:bg-black/[0.04]
                   transition-colors focus:outline-none focus-visible:ring-2 
                   focus-visible:ring-[var(--color-primary)]"
        style={{ transitionDuration: 'var(--duration-fast)' }}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
        
        {/* Animated hamburger icon */}
        <div className="relative h-5 w-6">
          <span 
            className={`absolute left-0 block h-0.5 w-6 bg-current transition-all
                       ${isOpen ? 'top-2.5 rotate-45' : 'top-0.5'}`}
            style={{ transitionDuration: 'var(--duration-fast)' }}
          />
          <span 
            className={`absolute left-0 top-2.5 block h-0.5 w-6 bg-current transition-all
                       ${isOpen ? 'opacity-0' : 'opacity-100'}`}
            style={{ transitionDuration: 'var(--duration-fast)' }}
          />
          <span 
            className={`absolute left-0 block h-0.5 w-6 bg-current transition-all
                       ${isOpen ? 'top-2.5 -rotate-45' : 'top-[18px]'}`}
            style={{ transitionDuration: 'var(--duration-fast)' }}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay - NO blur per architectural guidance */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ transitionDuration: 'var(--duration-medium)' }}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <nav
        className={`fixed right-0 top-0 z-40 h-full w-[280px] max-w-[80vw]
                   bg-[var(--color-surface)] border-l border-[var(--color-divider)]
                   transform transition-transform
                   ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ 
          transitionDuration: 'var(--duration-medium)',
          transitionTimingFunction: 'var(--ease-emphasized)',
          boxShadow: isOpen ? 'var(--elevation-3)' : 'none'
        }}
        aria-label="Mobile navigation"
      >
        <div className="flex h-full flex-col pt-20 px-6 pb-8">
          {/* Navigation Links */}
          <ul className="space-y-1 flex-1">
            {links.map((link, index) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 rounded-sm text-base font-medium
                           text-[var(--color-text-primary)] 
                           hover:bg-[var(--color-primary)]/[0.08] hover:text-[var(--color-primary)]
                           active:bg-[var(--color-primary)]/[0.12]
                           transition-colors"
                  style={{ 
                    transitionDuration: 'var(--duration-fast)',
                    animationDelay: `${index * 50}ms`,
                    animation: isOpen ? 'slideIn 300ms ease-out forwards' : 'none'
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA Button - M3 compliant (8px radius, no uppercase) */}
          <a
            href={ctaHref}
            onClick={() => setIsOpen(false)}
            className="mt-6 block w-full py-3 px-6 text-center font-semibold
                     bg-[var(--color-primary)] text-white rounded-sm
                     hover:bg-[var(--color-primary-light)] 
                     active:scale-[0.98]
                     transition-all"
            style={{ 
              transitionDuration: 'var(--duration-fast)',
              borderRadius: 'var(--radius-sm)' 
            }}
          >
            {ctaLabel}
          </a>
        </div>
      </nav>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
