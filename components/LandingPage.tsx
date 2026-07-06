import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { hexToRgba } from '../lib/utils';
import { useAuth } from './AuthProvider';

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
  .reveal.show, .show .reveal { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }
  .reveal-delay-5 { transition-delay: 0.5s; }
  .reveal-delay-6 { transition-delay: 0.6s; }
`;
document.head.appendChild(style);

function useInView<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ─────────────────────────── helpers ─────────────────────────── */
const COLORS = {
  bg: '#e8e4dc',
  card: '#f0ece3',
  fg: '#1a1916',
  muted: '#6b6560',
  border: '#d4d0c8',
  terracotta: '#c97b4b',
  terraDark: '#8a4e2a',
  teal: '#3a6b60',
  olive: '#5c6b4a',
};
const ACCENT = [COLORS.terracotta, COLORS.teal, COLORS.olive];
const a = (i: number) => ACCENT[i % 3];

/* ─────────────────────────── NavBar ──────────────────────────── */
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { currentUser } = useAuth();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'slideDown 0.5s ease both',
        zIndex: 100,
        width: 'min(860px, 90vw)',
        background: scrolled ? 'rgba(232,228,220,0.82)' : 'rgba(232,228,220,0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 9999,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        transition: 'background 0.3s',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/stampee.svg" alt="Stampee" style={{ height: 40, width: 'auto' }} />
      </Link>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {['Features', 'How It Works', 'Plans', 'FAQ'].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = COLORS.fg)}
            onMouseLeave={e => (e.currentTarget.style.color = COLORS.muted)}
          >
            {link}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link
          to="/contact"
          style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, textDecoration: 'none', padding: '6px 14px', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = COLORS.fg)}
          onMouseLeave={e => (e.currentTarget.style.color = COLORS.muted)}
        >
          Contact
        </Link>
        {!currentUser && (
          <Link
            to="/login"
            style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, textDecoration: 'none', padding: '6px 14px' }}
          >
            Log in
          </Link>
        )}
        <Link
          to={currentUser ? "/dashboard" : "/login"}
          style={{
            fontSize: 13, fontWeight: 600, color: '#fff',
            background: COLORS.terracotta, border: 'none', borderRadius: 9999,
            padding: '8px 20px', textDecoration: 'none', transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#b56a3a')}
          onMouseLeave={e => (e.currentTarget.style.background = COLORS.terracotta)}
        >
          {currentUser ? "Dashboard" : "Get Started — Free"}
        </Link>
      </div>
    </nav>
  );
};

/* ─────────────────────────── Hero ───────────────────────────── */
const Hero: React.FC = () => {
  const [ref, inView] = useInView();
  return (
  <section
    ref={ref}
    className={inView ? 'show' : ''}
    style={{
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      paddingTop: 120,
      paddingBottom: 80,
      background: COLORS.bg,
    }}
  >
    {/* Vertical grid lines */}
    <div
      aria-hidden
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: Array.from({ length: 13 }).map((_, i) =>
          `linear-gradient(to bottom, rgba(26,25,22,0.04) 1px, transparent 1px)`
        ).join(','),
        backgroundSize: `calc(100% / 13) 100%`,
        backgroundPosition: Array.from({ length: 13 }).map((_, i) => `calc(${i} * 100% / 12) 0`).join(','),
      }}
    >
      {/* simple grid via repeated divs */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-around' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ width: 1, background: 'rgba(26,25,22,0.04)', height: '100%' }} />
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-center w-full max-w-[1200px] mx-auto px-6 relative z-10">
      {/* Left: text */}
      <div>

        <h1 className="reveal reveal-delay-1" style={{ fontSize: 'clamp(44px,6vw,74px)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.03em', color: COLORS.fg, margin: '0 0 24px' }}>
          Digital Loyalty<br />Cards for Your<br /><span style={{ color: COLORS.terracotta }}>Small Business</span>
        </h1>
        <p className="reveal reveal-delay-2" style={{ fontSize: 17, lineHeight: 1.7, color: COLORS.muted, maxWidth: 480, marginBottom: 40 }}>
          Launch a beautiful, mobile-first loyalty stamp card program in minutes — no app download required for your customers. Fully free, forever.
        </p>
        <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link
            to="/login"
            style={{
              background: COLORS.terracotta, color: '#fff', borderRadius: 9999,
              padding: '14px 32px', fontWeight: 600, fontSize: 15, textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#b56a3a')}
            onMouseLeave={e => (e.currentTarget.style.background = COLORS.terracotta)}
          >
            Start for Free →
          </Link>
        </div>
      </div>

      <div className="reveal reveal-delay-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img
          src="/image_2.png"
          alt="Dima loyalty card preview"
          style={{ width: '100%', maxWidth: 480, borderRadius: 24, display: 'block' }}
        />
      </div>
    </div>
  </section>
  );
};

/* ─────────────────────────── Stats ──────────────────────────── */
const Stats: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const items = [
    { num: '100', suffix: '%', label: 'Free Forever', color: COLORS.terracotta },
    { num: '∞', suffix: '', label: 'Campaigns & Cards', color: COLORS.teal },
    { num: '0', suffix: 'ms', label: 'App Download Needed', color: COLORS.olive },
    { num: '∞', suffix: '', label: 'Unlimited Everything', color: COLORS.terracotta },
  ];
  return (
    <section ref={ref} className={inView ? 'show' : ''} style={{ borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 w-full max-w-[1200px] mx-auto px-6">
        {items.map((item, i) => (
          <div key={i} className={`reveal reveal-delay-${(i % 4) + 1}`} style={{
            padding: '48px 16px', textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${COLORS.border}` : 'none',
          }}>
            <div style={{ fontSize: 'clamp(48px,5vw,72px)', fontWeight: 700, letterSpacing: '-0.04em', color: item.color, lineHeight: 1 }}>
              {item.num}<span style={{ fontSize: '0.45em', verticalAlign: 'super', marginLeft: 2 }}>{item.suffix}</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.muted, marginTop: 12 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────── How It Works ──────────────────────── */
const HowItWorks: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const steps = [
    { num: '01', title: 'Setup in Seconds', desc: 'Pick a template, set your stamp goal, and customize your colors. No coding or complex menus. You\'re ready to go before your coffee gets cold.' },
    { num: '02', title: 'Customers Scan & Join', desc: 'Put your unique QR code on the counter. Customers scan it with their camera and instantly save the card to their phone. Zero friction.' },
    { num: '03', title: 'Issue Stamps', desc: 'Your staff uses a secure PIN to scan a customer\'s card and issue stamps. Once they hit the goal, the reward is automatically unlocked.' },
  ];
  return (
    <section id="how-it-works" ref={ref} className={inView ? 'show' : ''} style={{ padding: '120px 24px', background: COLORS.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 className="reveal reveal-delay-1" style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, letterSpacing: '-0.04em', color: COLORS.fg, margin: 0, lineHeight: 1.1 }}>
            How it works
          </h2>
          <p className="reveal reveal-delay-2" style={{ fontSize: 18, color: COLORS.muted, maxWidth: 500, margin: '20px auto 0' }}>
            A radically simple workflow for both you and your customers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className={`reveal reveal-delay-${(i % 3) + 3}`} style={{
              position: 'relative',
              background: COLORS.card,
              borderRadius: 32,
              padding: '48px 40px',
              border: `1px solid ${COLORS.border}`,
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', top: -20, right: -10, 
                fontSize: 160, fontWeight: 900, color: a(i), 
                opacity: 0.04, lineHeight: 1, letterSpacing: '-0.05em',
                pointerEvents: 'none'
              }}>
                {step.num}
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: hexToRgba(a(i), 0.1), color: a(i), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: COLORS.fg, marginBottom: 16, letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.muted, margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── Features ───────────────────────── */
const Features: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section id="features" ref={ref} className={inView ? 'show' : ''} style={{ padding: '96px 24px', background: COLORS.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 className="reveal reveal-delay-1" style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, letterSpacing: '-0.04em', color: COLORS.fg, margin: 0, lineHeight: 1.1 }}>
            Everything you need. <br/><span style={{ color: COLORS.terracotta }}>Nothing you don't.</span>
          </h2>
        </div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Large Item 1 */}
          <div className="reveal reveal-delay-2 md:col-span-2" style={{ background: COLORS.card, borderRadius: 32, padding: '56px 48px', border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: COLORS.fg, marginBottom: 16, letterSpacing: '-0.03em' }}>Visual Card Studio</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: COLORS.muted, maxWidth: 480, margin: 0 }}>
              Drag, drop, and design. Customize your loyalty card to match your exact brand identity with gradients, custom logos, and dynamic icons. Make it uniquely yours.
            </p>
          </div>

          {/* Square Item 1 */}
          <div className="reveal reveal-delay-3 md:col-span-1" style={{ background: COLORS.card, borderRadius: 32, padding: '48px 40px', border: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: hexToRgba(COLORS.teal, 0.1), color: COLORS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: COLORS.fg, marginBottom: 12, letterSpacing: '-0.02em' }}>Staff PINs</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: COLORS.muted, margin: 0 }}>
              Keep your data safe. Issue staff-specific PIN codes so they can stamp cards without accessing your owner dashboard.
            </p>
          </div>

          {/* Square Item 2 */}
          <div className="reveal reveal-delay-4 md:col-span-1" style={{ background: COLORS.card, borderRadius: 32, padding: '48px 40px', border: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: hexToRgba(COLORS.olive, 0.1), color: COLORS.olive, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: COLORS.fg, marginBottom: 12, letterSpacing: '-0.02em' }}>No App Required</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: COLORS.muted, margin: 0 }}>
              Friction kills loyalty. Customers access their cards directly via a simple web link. No downloads or passwords.
            </p>
          </div>

          {/* Large Item 2 */}
          <div className="reveal reveal-delay-5 md:col-span-2" style={{ background: COLORS.card, borderRadius: 32, padding: '56px 48px', border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: COLORS.fg, marginBottom: 16, letterSpacing: '-0.03em' }}>Real-time Analytics</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: COLORS.muted, maxWidth: 480, margin: 0 }}>
              Stop guessing. Track exactly how many cards are issued, stamps are given, and rewards are redeemed every single day from your owner dashboard.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── Demos ──────────────────────────── */
const DemoShowcase: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const images = Array.from({ length: 9 }, (_, i) => ({
    src: `/demo_${i + 1}.png`,
    label: `Template ${i + 1}`,
  }));
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const max = images.length - 4;

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev >= max ? 0 : prev + 1));
    }, 3000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const goTo = (i: number) => {
    setCurrent(i);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  };

  const visible = images.slice(current, current + 4);

  return (
    <section ref={ref} className={inView ? 'show' : ''} style={{ padding: '96px 24px', background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="reveal reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: COLORS.olive }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.olive }}>Templates</span>
            <div style={{ height: 1, width: 32, background: COLORS.olive }} />
          </div>
          <h2 className="reveal reveal-delay-2" style={{ fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', color: COLORS.fg, margin: 0 }}>
            Ready-Made Templates
          </h2>
        </div>
        <div className="reveal reveal-delay-3" style={{ overflow: 'hidden', borderRadius: 20, border: `1px solid ${COLORS.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.10)' }}>
          <div style={{ display: 'flex', gap: 20, transition: 'transform 0.5s', transform: `translateX(0px)` }}>
            {visible.map((img, i) => (
              <div key={current + i} style={{
                width: `calc(25% - 15px)`, flexShrink: 0, background: COLORS.card,
                borderRadius: 16, overflow: 'hidden',
              }}>
                <img src={img.src} alt={img.label} style={{ width: '100%', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
        <div className="reveal reveal-delay-4" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: i === current ? COLORS.terracotta : COLORS.border,
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── Plans ──────────────────────────── */
const Plans: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const plans = [
    {
      name: 'Standard', price: '$29', period: '/month', accent: COLORS.teal,
      desc: 'Everything you need to launch a digital loyalty program.',
      features: [
        'Up to 3 loyalty campaigns',
        'Unlimited issued cards',
        'Up to 1,000 customers',
        'QR code-based stamp & redemption',
        'Basic Analytics',
        'Public card & campaign pages',
      ],
      cta: 'Request Access',
      ctaLink: '/contact',
    },
    {
      name: 'Popular', price: '$79', period: '/month', accent: COLORS.terracotta,
      desc: 'Advanced tools to grow your customer base.',
      features: [
        'Unlimited loyalty campaigns',
        'Unlimited customers',
        'Staff accounts with PIN access',
        'Advanced Analytics & history',
        'Full card design editor',
        'No app required for customers',
      ],
      cta: 'Request Access',
      ctaLink: '/contact',
    },
    {
      name: 'Premium', price: '$199', period: '/month', accent: COLORS.fg,
      desc: 'Enterprise-grade features and custom branding.',
      features: [
        'Everything in Popular plan',
        'White-label — remove Stampee branding',
        'Custom domain support',
        'Dedicated account manager',
        'Priority support',
        'Custom integrations',
      ],
      cta: 'Request Access',
      ctaLink: '/contact',
      external: false,
    },
  ];
  return (
    <section id="plans" ref={ref} className={inView ? 'show' : ''} style={{ padding: '96px 24px', background: COLORS.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="reveal reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: COLORS.terracotta }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.terracotta }}>Plans</span>
            <div style={{ height: 1, width: 32, background: COLORS.terracotta }} />
          </div>
          <h2 className="reveal reveal-delay-2" style={{ fontSize: 'clamp(36px,4vw,56px)', fontWeight: 700, letterSpacing: '-0.03em', color: COLORS.fg, margin: '0 0 16px' }}>Simple, Transparent Options</h2>
          <p className="reveal reveal-delay-3" style={{ fontSize: 16, color: COLORS.muted, maxWidth: 480, margin: '0 auto' }}>No hidden costs, no usage tiers. Dima is free because loyalty shouldn't cost you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className={`reveal reveal-delay-${(i % 3) + 3}`} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderTop: `2px solid ${plan.accent}`, borderRadius: 22, padding: '40px 40px 36px',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: plan.accent, marginBottom: 12 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', color: COLORS.fg, lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: COLORS.muted }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.muted, marginBottom: 28 }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: COLORS.fg }}>
                    <span style={{ color: plan.accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 36 }}>
                {plan.external ? (
                  <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer" style={{
                    display: 'block', textAlign: 'center', background: plan.accent, color: '#fff',
                    borderRadius: 9999, padding: '14px', fontWeight: 600, fontSize: 15, textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >{plan.cta}</a>
                ) : (
                  <Link to={plan.ctaLink} style={{
                    display: 'block', textAlign: 'center', background: plan.accent, color: '#fff',
                    borderRadius: 9999, padding: '14px', fontWeight: 600, fontSize: 15, textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >{plan.cta}</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────── FAQ ───────────────────────────── */
const FAQ: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const items = [
    { q: 'Is Dima really free?', a: 'Yes. Dima is 100% free to use. There are no usage caps, no feature restrictions behind paywalls, and no credit card required to sign up.' },
    { q: 'Do my customers need to download an app?', a: 'No. Customers access their loyalty card through a regular browser link or by scanning a QR code. No app install, no account creation needed on their end.' },
    { q: 'Can I use my own branding?', a: 'Absolutely. The card designer lets you set your business name, logo, brand colors, background images, icons, and more. Every card looks uniquely yours.' },
    { q: 'What happens if a customer loses their phone?', a: 'Each card is tied to a URL, not a device. Customers can bookmark it or it can be retrieved by your staff by searching in the Issued Cards panel.' },
    { q: 'Can I have multiple staff members?', a: 'Yes. You can create multiple staff accounts with secure PINs. Staff can issue stamps and redeem rewards — they don\'t have access to your owner dashboard or settings.' },
    { q: 'Can I self-host Dima?', a: 'Yes. You can deploy Dima on your own Supabase project and Vercel account. Full control, total ownership of your data.' },
    { q: 'How do stamps work?', a: 'Staff scan a customer\'s card QR code using any phone camera. The stamp is added instantly. When the stamp goal is reached, the reward is unlocked automatically.' },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" ref={ref} className={inView ? 'show' : ''} style={{ padding: '96px 24px', background: COLORS.bg }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="reveal reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: COLORS.olive }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.olive }}>FAQ</span>
            <div style={{ height: 1, width: 32, background: COLORS.olive }} />
          </div>
          <h2 className="reveal reveal-delay-2" style={{ fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', color: COLORS.fg, margin: 0 }}>Common Questions</h2>
        </div>
        {items.map((item, i) => (
          <div key={i} className={`reveal reveal-delay-${(i % 5) + 2}`} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '22px 0', textAlign: 'left', gap: 16,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: open === i ? COLORS.terracotta : COLORS.fg, transition: 'color 0.2s' }}>{item.q}</span>
              <span style={{ fontSize: 22, color: COLORS.muted, flexShrink: 0, transition: 'transform 0.25s', transform: open === i ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
            </button>
            {open === i && (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: COLORS.muted, margin: '0 0 22px', paddingRight: 32 }}>{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

/* ──────────────────────────── CTA ───────────────────────────── */
const CtaBanner: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  return (
  <section ref={ref} className={inView ? 'show' : ''} style={{ padding: '80px 24px', background: COLORS.fg, textAlign: 'center' }}>
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2 className="reveal reveal-delay-1" style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 20px' }}>
        Start Your Loyalty Program Today
      </h2>
      <p className="reveal reveal-delay-2" style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: 36 }}>
        Join small businesses using Dima to build real customer loyalty — in minutes, for free.
      </p>
      <Link
        to="/login"
        className="reveal reveal-delay-3"
        style={{
          display: 'inline-block', background: COLORS.terracotta, color: '#fff',
          borderRadius: 9999, padding: '16px 44px', fontWeight: 600, fontSize: 16,
          textDecoration: 'none', transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#b56a3a')}
        onMouseLeave={e => (e.currentTarget.style.background = COLORS.terracotta)}
      >
        Get Started — It's Free
      </Link>
    </div>
  </section>
  );
};

/* ─────────────────────────── Footer ─────────────────────────── */
const Footer: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  return (
  <footer ref={ref} className={inView ? 'show' : ''} style={{ background: '#fff', borderTop: `1px solid ${COLORS.border}` }}>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 w-full max-w-[1200px] mx-auto px-6 py-16">
      <div className="reveal reveal-delay-1 lg:col-span-1 md:col-span-2">
        <img src="/stampee.svg" alt="Dima" style={{ height: 40, width: 'auto', marginBottom: 14 }} />
        <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.muted, maxWidth: 260 }}>
          A digital loyalty card platform built for small businesses worldwide.
        </p>
      </div>
      {[
        { heading: 'Product', links: [{ label: 'Features', to: '#features' }, { label: 'Campaigns', to: '#how-it-works' }, { label: 'Analytics', to: '#features' }] },
        { heading: 'Company', links: [{ label: 'About', to: '#' }, { label: 'Blog', to: '#' }, { label: 'Contact', to: '/contact' }, { label: 'Privacy Policy', to: '#' }, { label: 'Terms of Service', to: '#' }] },
        { heading: 'Community', links: [{ label: 'Discord', to: '#' }, { label: 'Twitter', to: '#' }] },
      ].map((col, i) => (
        <div key={i} className={`reveal reveal-delay-${(i % 3) + 2}`}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.fg, marginBottom: 18 }}>{col.heading}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {col.links.map((l, j) => {
              if (l.to.startsWith('/')) {
                return (
                  <Link key={j} to={l.to} style={{ fontSize: 14, color: COLORS.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = COLORS.fg)}
                    onMouseLeave={e => (e.currentTarget.style.color = COLORS.muted)}
                  >{l.label}</Link>
                );
              }
              return (
                <a key={j} href={l.to} style={{ fontSize: 14, color: COLORS.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = COLORS.fg)}
                  onMouseLeave={e => (e.currentTarget.style.color = COLORS.muted)}
                >{l.label}</a>
              );
            })}
          </div>
        </div>
      ))}
    </div>



    <div className="reveal reveal-delay-6" style={{ borderTop: `1px solid ${COLORS.border}`, textAlign: 'center', padding: '20px 24px', fontSize: 12, color: COLORS.muted }}>
      © {new Date().getFullYear()} Dima. Built for small businesses.
    </div>
  </footer>
  );
};

/* ────────────────────── Landing Page ────────────────────────── */
const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Dima | Digital Loyalty Cards for Small Businesses';
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', background: COLORS.bg, color: COLORS.fg }}>
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <DemoShowcase />
      <Features />
      <Plans />
      <FAQ />
      <CtaBanner />
      <Footer />
    </div>
  );
};

export default LandingPage;
