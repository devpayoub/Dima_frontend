import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Smartphone, Palette, BarChart3, QrCode, Sparkles, ArrowRight, Check, Zap, Users } from 'lucide-react';
import { hexToRgba } from '@/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';

/* ---------------------------- injected styles ---------------------------- */
if (!document.getElementById('landing-styles')) {
  const style = document.createElement('style');
  style.id = 'landing-styles';
  style.textContent = `
    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
    @keyframes floatCard { 0%, 100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-14px) rotate(1.5deg); } }
    @keyframes blobDrift { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(40px, -30px) scale(1.08); } 66% { transform: translate(-30px, 24px) scale(0.94); } }
    @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(201,123,75,0.35); } 70% { box-shadow: 0 0 0 14px rgba(201,123,75,0); } 100% { box-shadow: 0 0 0 0 rgba(201,123,75,0); } }
    @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }

    .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .reveal.show, .show .reveal { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.08s; }
    .reveal-delay-2 { transition-delay: 0.16s; }
    .reveal-delay-3 { transition-delay: 0.24s; }
    .reveal-delay-4 { transition-delay: 0.32s; }
    .reveal-delay-5 { transition-delay: 0.40s; }
    .reveal-delay-6 { transition-delay: 0.48s; }

    .lift { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s; will-change: transform; }
    .lift:hover { transform: translateY(-8px); box-shadow: 0 24px 48px -16px rgba(26,25,22,0.16); }

    .btn-hero { position: relative; overflow: hidden; transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s; }
    .btn-hero:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 16px 32px -8px rgba(201,123,75,0.45); }
    .btn-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%); background-size: 200% 100%; animation: shimmer 3.2s infinite; }

    .gradient-text { background: linear-gradient(90deg, #c97b4b, #8a4e2a, #3a6b60, #c97b4b); background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 7s ease infinite; }

    .faq-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .faq-body.open { grid-template-rows: 1fr; }
    .faq-body > div { overflow: hidden; }

    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; left: 0; bottom: -4px; width: 100%; height: 2px; border-radius: 2px; background: #c97b4b; transform: scaleX(0); transform-origin: left; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
    .nav-link:hover::after { transform: scaleX(1); }

    @media (prefers-reduced-motion: reduce) {
      .reveal, .lift, .btn-hero { transition: none !important; animation: none !important; }
      .reveal { opacity: 1 !important; transform: none !important; }
      * { animation-duration: 0.001s !important; }
    }
  `;
  document.head.appendChild(style);
}

function useInView<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ------------------------------- palette --------------------------------- */
const COLORS = {
  bg: '#f4f1ea',
  card: '#fbf9f4',
  fg: '#1a1916',
  muted: '#6b6560',
  border: '#e2ddd2',
  terracotta: '#c97b4b',
  terraDark: '#8a4e2a',
  teal: '#3a6b60',
  olive: '#5c6b4a',
};
const ACCENT = [COLORS.terracotta, COLORS.teal, COLORS.olive];
const a = (i: number) => ACCENT[i % 3];

/* ------------------------------ aurora bg -------------------------------- */
const Aurora: React.FC = () => (
  <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', top: '-12%', left: '-8%', width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${hexToRgba(COLORS.terracotta, 0.22)} 0%, transparent 70%)`, filter: 'blur(60px)', animation: 'blobDrift 14s ease-in-out infinite' }} />
    <div style={{ position: 'absolute', top: '18%', right: '-10%', width: 560, height: 560, borderRadius: '50%', background: `radial-gradient(circle, ${hexToRgba(COLORS.teal, 0.18)} 0%, transparent 70%)`, filter: 'blur(70px)', animation: 'blobDrift 18s ease-in-out infinite reverse' }} />
    <div style={{ position: 'absolute', bottom: '-18%', left: '28%', width: 480, height: 480, borderRadius: '50%', background: `radial-gradient(circle, ${hexToRgba(COLORS.olive, 0.16)} 0%, transparent 70%)`, filter: 'blur(65px)', animation: 'blobDrift 16s ease-in-out infinite 2s' }} />
  </div>
);

/* -------------------------------- NavBar --------------------------------- */
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
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        animation: 'slideDown 0.6s cubic-bezier(0.16,1,0.3,1) both', zIndex: 100,
        width: 'min(880px, 92vw)',
        background: scrolled ? 'rgba(251,249,244,0.88)' : 'rgba(251,249,244,0.45)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.4)', borderRadius: 9999,
        boxShadow: scrolled ? '0 8px 32px rgba(26,25,22,0.10)' : '0 4px 24px rgba(26,25,22,0.05)',
        transition: 'background 0.3s, box-shadow 0.3s',
        padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/stampee.svg" alt="Stampee" style={{ height: 38, width: 'auto' }} />
      </Link>
      <div className="hidden md:flex" style={{ gap: 28, alignItems: 'center' }}>
        {['Features', 'How It Works', 'Plans', 'FAQ'].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            className="nav-link"
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
          <Link to="/login" style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, textDecoration: 'none', padding: '6px 14px' }}>
            Log in
          </Link>
        )}
        <Link
          to={currentUser ? '/dashboard' : '/login'}
          className="btn-hero"
          style={{
            fontSize: 13, fontWeight: 600, color: '#fff',
            background: `linear-gradient(120deg, ${COLORS.terracotta}, ${COLORS.terraDark})`,
            border: 'none', borderRadius: 9999, padding: '9px 20px', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          {currentUser ? 'Dashboard' : 'Get Started'}
          <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  );
};

/* --------------------------------- Hero ---------------------------------- */
const Hero: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className={inView ? 'show' : ''}
      style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', position: 'relative',
        paddingTop: 130, paddingBottom: 80,
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, #efeadf 100%)`,
        overflow: 'hidden',
      }}
    >
      <Aurora />

      {/* dotted texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        backgroundImage: `radial-gradient(${hexToRgba(COLORS.fg, 0.06)} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-[64px] items-center w-full max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Left: text */}
        <div>
          <div className="reveal reveal-delay-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
            background: hexToRgba(COLORS.terracotta, 0.1), border: `1px solid ${hexToRgba(COLORS.terracotta, 0.25)}`,
            borderRadius: 9999, padding: '7px 16px',
          }}>
            <Sparkles size={14} color={COLORS.terracotta} />
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.terraDark, letterSpacing: '0.04em' }}>
              Loyalty made delightful
            </span>
          </div>

          <h1 className="reveal reveal-delay-2" style={{ fontSize: 'clamp(44px,6vw,76px)', fontWeight: 800, lineHeight: 1.03, letterSpacing: '-0.035em', color: COLORS.fg, margin: '0 0 24px' }}>
            Digital Loyalty<br />Cards for Your<br />
            <span className="gradient-text">Small Business</span>
          </h1>
          <p className="reveal reveal-delay-3" style={{ fontSize: 17, lineHeight: 1.7, color: COLORS.muted, maxWidth: 480, marginBottom: 40 }}>
            Launch a beautiful, mobile-first loyalty stamp card program in minutes. No app download required for your customers.
          </p>
          <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/login"
              className="btn-hero"
              style={{
                background: `linear-gradient(120deg, ${COLORS.terracotta}, ${COLORS.terraDark})`,
                color: '#fff', borderRadius: 9999, padding: '15px 34px',
                fontWeight: 600, fontSize: 15, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              Start for Free <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              style={{
                color: COLORS.fg, borderRadius: 9999, padding: '14px 30px',
                fontWeight: 600, fontSize: 15, textDecoration: 'none',
                border: `1.5px solid ${COLORS.border}`, background: 'rgba(255,255,255,0.5)',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.terracotta; e.currentTarget.style.background = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Right: floating card */}
        <div className="reveal reveal-delay-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {/* glow behind the card */}
          <div aria-hidden style={{
            position: 'absolute', width: '78%', height: '78%', borderRadius: '50%',
            background: `radial-gradient(circle, ${hexToRgba(COLORS.terracotta, 0.28)} 0%, transparent 70%)`,
            filter: 'blur(48px)', animation: 'floatY 7s ease-in-out infinite',
          }} />
          <div style={{ animation: 'floatCard 7s ease-in-out infinite', position: 'relative' }}>
            <img
              src="/image_2.png"
              alt="Stampee loyalty card preview"
              style={{ width: '100%', maxWidth: 460, borderRadius: 28, display: 'block', boxShadow: '0 40px 90px -24px rgba(26,25,22,0.35)' }}
            />
            {/* floating chips */}
            <div style={{
              position: 'absolute', top: -18, right: -14, background: '#fff', borderRadius: 16,
              padding: '10px 16px', boxShadow: '0 12px 32px rgba(26,25,22,0.14)',
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'floatY 5s ease-in-out infinite 0.6s',
            }}>
              <Zap size={16} color={COLORS.terracotta} />
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.fg }}>Stamp added!</span>
            </div>
            <div style={{
              position: 'absolute', bottom: -16, left: -18, background: '#fff', borderRadius: 16,
              padding: '10px 16px', boxShadow: '0 12px 32px rgba(26,25,22,0.14)',
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'floatY 6s ease-in-out infinite 1.2s',
            }}>
              <Users size={16} color={COLORS.teal} />
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.fg }}>+38 customers this week</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------- Marquee -------------------------------- */
const Marquee: React.FC = () => {
  const items = ['No app download', 'Free to start', 'QR-based stamps', 'Custom branding', 'Staff PINs', 'Real-time analytics', 'Setup in minutes', 'Works on any phone'];
  const row = [...items, ...items];
  return (
    <div style={{ background: COLORS.fg, overflow: 'hidden', padding: '18px 0', position: 'relative' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 28s linear infinite' }}>
        {row.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, paddingRight: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>{item}</span>
            <span aria-hidden style={{ width: 6, height: 6, background: COLORS.terracotta, transform: 'rotate(45deg)', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* --------------------------------- Stats --------------------------------- */
const CountUp: React.FC<{ end: number; suffix?: string; run: boolean; style?: React.CSSProperties }> = ({ end, suffix = '', run, style }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, end]);
  return <span style={style}>{val}{suffix}</span>;
};

const Stats: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const items = [
    { end: 100, suffix: '%', label: 'Free to Get Started', color: COLORS.terracotta },
    { end: 5, suffix: ' min', label: 'Average Setup Time', color: COLORS.teal },
    { end: 0, suffix: '', label: 'App Downloads Needed', color: COLORS.olive },
    { text: 'Unlimited', label: 'Cards & Campaigns', color: COLORS.terracotta },
  ];
  return (
    <section ref={ref} className={inView ? 'show' : ''} style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 w-full max-w-[1200px] mx-auto px-6">
        {items.map((item, i) => (
          <div key={i} className={`reveal reveal-delay-${(i % 4) + 1}`} style={{
            padding: '52px 16px', textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${COLORS.border}` : 'none',
          }}>
            <div style={{ fontSize: 'clamp(44px,4.5vw,64px)', fontWeight: 800, letterSpacing: '-0.04em', color: item.color, lineHeight: 1 }}>
              {item.text ? item.text : <CountUp end={item.end!} suffix={item.suffix} run={inView} />}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.muted, marginTop: 14 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ------------------------------ How It Works ----------------------------- */
const HowItWorks: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const steps = [
    { icon: <Palette size={22} />, title: 'Setup in Seconds', desc: "Pick a template, set your stamp goal, and customize your colors. No coding or complex menus. You're ready to go before your coffee gets cold." },
    { icon: <QrCode size={22} />, title: 'Customers Scan & Join', desc: 'Put your unique QR code on the counter. Customers scan it with their camera and instantly save the card to their phone. Zero friction.' },
    { icon: <Zap size={22} />, title: 'Issue Stamps', desc: "Your staff uses a secure PIN to scan a customer's card and issue stamps. Once they hit the goal, the reward is automatically unlocked." },
  ];
  return (
    <section id="how-it-works" ref={ref} className={inView ? 'show' : ''} style={{ padding: '120px 24px', background: COLORS.bg, position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
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
            <div key={i} className={`reveal reveal-delay-${(i % 3) + 3} lift`} style={{
              position: 'relative', background: COLORS.card, borderRadius: 32,
              padding: '48px 40px', border: `1px solid ${COLORS.border}`, overflow: 'hidden',
            }}>
              <div aria-hidden style={{
                position: 'absolute', top: -24, right: -12,
                fontSize: 170, fontWeight: 900, color: a(i),
                opacity: 0.05, lineHeight: 1, letterSpacing: '-0.05em', pointerEvents: 'none',
              }}>
                {`0${i + 1}`}
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 18,
                  background: `linear-gradient(135deg, ${hexToRgba(a(i), 0.16)}, ${hexToRgba(a(i), 0.06)})`,
                  color: a(i), display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                  border: `1px solid ${hexToRgba(a(i), 0.2)}`,
                }}>
                  {step.icon}
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

/* ----------------------------- Demo carousel ------------------------------ */
const DemoShowcase: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const images = Array.from({ length: 9 }, (_, i) => ({ src: `/demo_${i + 1}.png`, label: `Template ${i + 1}` }));
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const perView = 4;
  const max = images.length - perView;

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev >= max ? 0 : prev + 1));
    }, 3200);
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

  return (
    <section ref={ref} className={inView ? 'show' : ''} style={{ padding: '110px 24px', background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="reveal reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: COLORS.olive }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.olive }}>Templates</span>
            <div style={{ height: 1, width: 32, background: COLORS.olive }} />
          </div>
          <h2 className="reveal reveal-delay-2" style={{ fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', color: COLORS.fg, margin: 0 }}>
            Ready-Made Templates
          </h2>
        </div>
        <div className="reveal reveal-delay-3" style={{ overflow: 'hidden', borderRadius: 24, border: `1px solid ${COLORS.border}`, boxShadow: '0 32px 80px -20px rgba(26,25,22,0.16)', background: '#fff', padding: 12 }}>
          <div style={{ overflow: 'hidden', borderRadius: 14 }}>
            <div style={{
              display: 'flex', gap: 12,
              transform: `translateX(calc(-${current} * (25% - 9px) - ${current} * 12px))`,
              transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              {images.map((img, i) => (
                <div key={i} style={{ width: 'calc(25% - 9px)', flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: COLORS.card }}>
                  <img src={img.src} alt={img.label} style={{ width: '100%', display: 'block', transition: 'transform 0.5s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="reveal reveal-delay-4" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} style={{
              width: i === current ? 26 : 10, height: 10, borderRadius: 9999, border: 'none', cursor: 'pointer',
              background: i === current ? COLORS.terracotta : COLORS.border,
              transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
            }} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------- Features -------------------------------- */
const Features: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section id="features" ref={ref} className={inView ? 'show' : ''} style={{ padding: '110px 24px', background: COLORS.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 className="reveal reveal-delay-1" style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, letterSpacing: '-0.04em', color: COLORS.fg, margin: 0, lineHeight: 1.1 }}>
            Everything you need.<br /><span className="gradient-text">Nothing you don't.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="reveal reveal-delay-2 lift md:col-span-2" style={{
            background: `linear-gradient(135deg, ${COLORS.card} 60%, ${hexToRgba(COLORS.terracotta, 0.08)})`,
            borderRadius: 32, padding: '56px 48px', border: `1px solid ${COLORS.border}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div aria-hidden style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: hexToRgba(COLORS.terracotta, 0.1), filter: 'blur(30px)', animation: 'floatY 8s ease-in-out infinite' }} />
            <div style={{ width: 52, height: 52, borderRadius: 18, background: hexToRgba(COLORS.terracotta, 0.12), color: COLORS.terracotta, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${hexToRgba(COLORS.terracotta, 0.2)}` }}>
              <Palette size={24} />
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: COLORS.fg, marginBottom: 16, letterSpacing: '-0.03em' }}>Visual Card Studio</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: COLORS.muted, maxWidth: 480, margin: 0 }}>
              Drag, drop, and design. Customize your loyalty card to match your exact brand identity with gradients, custom logos, and dynamic icons. Make it uniquely yours.
            </p>
          </div>

          <div className="reveal reveal-delay-3 lift md:col-span-1" style={{ background: COLORS.card, borderRadius: 32, padding: '48px 40px', border: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, background: hexToRgba(COLORS.teal, 0.12), color: COLORS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${hexToRgba(COLORS.teal, 0.2)}` }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: COLORS.fg, marginBottom: 12, letterSpacing: '-0.02em' }}>Staff PINs</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: COLORS.muted, margin: 0 }}>
              Keep your data safe. Issue staff-specific PIN codes so they can stamp cards without accessing your owner dashboard.
            </p>
          </div>

          <div className="reveal reveal-delay-4 lift md:col-span-1" style={{ background: COLORS.card, borderRadius: 32, padding: '48px 40px', border: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, background: hexToRgba(COLORS.olive, 0.12), color: COLORS.olive, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${hexToRgba(COLORS.olive, 0.2)}` }}>
              <Smartphone size={24} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: COLORS.fg, marginBottom: 12, letterSpacing: '-0.02em' }}>No App Required</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: COLORS.muted, margin: 0 }}>
              Friction kills loyalty. Customers access their cards directly via a simple web link. No downloads or passwords.
            </p>
          </div>

          <div className="reveal reveal-delay-5 lift md:col-span-2" style={{
            background: `linear-gradient(135deg, ${COLORS.card} 60%, ${hexToRgba(COLORS.teal, 0.08)})`,
            borderRadius: 32, padding: '56px 48px', border: `1px solid ${COLORS.border}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div aria-hidden style={{ position: 'absolute', right: -60, bottom: -60, width: 220, height: 220, borderRadius: '50%', background: hexToRgba(COLORS.teal, 0.1), filter: 'blur(30px)', animation: 'floatY 9s ease-in-out infinite 1s' }} />
            <div style={{ width: 52, height: 52, borderRadius: 18, background: hexToRgba(COLORS.teal, 0.12), color: COLORS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${hexToRgba(COLORS.teal, 0.2)}` }}>
              <BarChart3 size={24} />
            </div>
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

/* --------------------------------- Plans ---------------------------------- */
const Plans: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const plans = [
    {
      name: 'Standard', price: '$29', period: '/month', accent: COLORS.teal, featured: false,
      desc: 'Everything you need to launch a digital loyalty program.',
      features: ['Up to 3 loyalty campaigns', 'Unlimited issued cards', 'Up to 1,000 customers', 'QR code-based stamp & redemption', 'Basic Analytics', 'Public card & campaign pages'],
      cta: 'Request Access', ctaLink: '/contact',
    },
    {
      name: 'Popular', price: '$79', period: '/month', accent: COLORS.terracotta, featured: true,
      desc: 'Advanced tools to grow your customer base.',
      features: ['Unlimited loyalty campaigns', 'Unlimited customers', 'Staff accounts with PIN access', 'Advanced Analytics & history', 'Full card design editor', 'No app required for customers'],
      cta: 'Request Access', ctaLink: '/contact',
    },
    {
      name: 'Premium', price: '$199', period: '/month', accent: COLORS.fg, featured: false,
      desc: 'Enterprise-grade features and custom branding.',
      features: ['Everything in Popular plan', 'White-label branding', 'Custom domain support', 'Dedicated account manager', 'Priority support', 'Custom integrations'],
      cta: 'Request Access', ctaLink: '/contact',
    },
  ];
  return (
    <section id="plans" ref={ref} className={inView ? 'show' : ''} style={{ padding: '110px 24px', background: COLORS.bg }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="reveal reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: COLORS.terracotta }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.terracotta }}>Plans</span>
            <div style={{ height: 1, width: 32, background: COLORS.terracotta }} />
          </div>
          <h2 className="reveal reveal-delay-2" style={{ fontSize: 'clamp(36px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.03em', color: COLORS.fg, margin: '0 0 16px' }}>Simple, Transparent Options</h2>
          <p className="reveal reveal-delay-3" style={{ fontSize: 16, color: COLORS.muted, maxWidth: 480, margin: '0 auto' }}>No hidden costs, no usage tiers. Pick the plan that fits your business.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <div key={i} className={`reveal reveal-delay-${(i % 3) + 3} lift`} style={{
              background: plan.featured ? '#fff' : COLORS.card,
              border: plan.featured ? `2px solid ${plan.accent}` : `1px solid ${COLORS.border}`,
              borderRadius: 24, padding: '40px 36px 36px',
              display: 'flex', flexDirection: 'column', position: 'relative',
              boxShadow: plan.featured ? `0 24px 64px -16px ${hexToRgba(plan.accent, 0.35)}` : 'none',
            }}>
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: `linear-gradient(120deg, ${COLORS.terracotta}, ${COLORS.terraDark})`, color: '#fff',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  borderRadius: 9999, padding: '6px 18px', whiteSpace: 'nowrap',
                  animation: 'pulseRing 2.4s infinite',
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: plan.accent, marginBottom: 12 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.04em', color: COLORS.fg, lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: COLORS.muted }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.muted, marginBottom: 28 }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: COLORS.fg }}>
                    <Check size={16} color={plan.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 36 }}>
                <Link to={plan.ctaLink} className={plan.featured ? 'btn-hero' : undefined} style={{
                  display: 'block', textAlign: 'center',
                  background: plan.featured ? `linear-gradient(120deg, ${COLORS.terracotta}, ${COLORS.terraDark})` : plan.accent,
                  color: '#fff', borderRadius: 9999, padding: '14px', fontWeight: 600, fontSize: 15, textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => { if (!plan.featured) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { if (!plan.featured) e.currentTarget.style.opacity = '1'; }}
                >{plan.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------------------------- FAQ ----------------------------------- */
const FAQ: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  const items = [
    { q: 'Is Stampee really free to start?', a: 'Yes. You can sign up and launch your first loyalty campaign for free. No credit card required to get started.' },
    { q: 'Do my customers need to download an app?', a: 'No. Customers access their loyalty card through a regular browser link or by scanning a QR code. No app install, no account creation needed on their end.' },
    { q: 'Can I use my own branding?', a: 'Absolutely. The card designer lets you set your business name, logo, brand colors, background images, icons, and more. Every card looks uniquely yours.' },
    { q: 'What happens if a customer loses their phone?', a: 'Each card is tied to a URL, not a device. Customers can bookmark it or it can be retrieved by your staff by searching in the Issued Cards panel.' },
    { q: 'Can I have multiple staff members?', a: "Yes. You can create multiple staff accounts with secure PINs. Staff can issue stamps and redeem rewards, but they don't have access to your owner dashboard or settings." },
    { q: 'How do stamps work?', a: "Staff scan a customer's card QR code using any phone camera. The stamp is added instantly. When the stamp goal is reached, the reward is unlocked automatically." },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" ref={ref} className={inView ? 'show' : ''} style={{ padding: '110px 24px', background: COLORS.bg }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="reveal reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: COLORS.olive }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.olive }}>FAQ</span>
            <div style={{ height: 1, width: 32, background: COLORS.olive }} />
          </div>
          <h2 className="reveal reveal-delay-2" style={{ fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', color: COLORS.fg, margin: 0 }}>Common Questions</h2>
        </div>
        {items.map((item, i) => (
          <div key={i} className={`reveal reveal-delay-${(i % 5) + 2}`} style={{
            border: `1px solid ${open === i ? hexToRgba(COLORS.terracotta, 0.4) : COLORS.border}`,
            borderRadius: 18, marginBottom: 12, background: open === i ? '#fff' : COLORS.card,
            transition: 'background 0.3s, border-color 0.3s', overflow: 'hidden',
          }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 24px', textAlign: 'left', gap: 16,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: open === i ? COLORS.terracotta : COLORS.fg, transition: 'color 0.2s' }}>{item.q}</span>
              <span aria-hidden style={{ fontSize: 22, color: COLORS.muted, flexShrink: 0, transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)', transform: open === i ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
            </button>
            <div className={`faq-body${open === i ? ' open' : ''}`}>
              <div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: COLORS.muted, margin: 0, padding: '0 24px 22px' }}>{item.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ---------------------------------- CTA ----------------------------------- */
const CtaBanner: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section ref={ref} className={inView ? 'show' : ''} style={{ padding: '100px 24px', background: COLORS.fg, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* animated glow */}
      <div aria-hidden style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${hexToRgba(COLORS.terracotta, 0.25)} 0%, transparent 65%)`, filter: 'blur(40px)', animation: 'blobDrift 12s ease-in-out infinite' }} />
      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
        <h2 className="reveal reveal-delay-1" style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 20px' }}>
          Start Your Loyalty Program Today
        </h2>
        <p className="reveal reveal-delay-2" style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', marginBottom: 36 }}>
          Join small businesses using Stampee to build real customer loyalty in minutes.
        </p>
        <Link
          to="/login"
          className="reveal reveal-delay-3 btn-hero"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `linear-gradient(120deg, ${COLORS.terracotta}, ${COLORS.terraDark})`, color: '#fff',
            borderRadius: 9999, padding: '16px 44px', fontWeight: 600, fontSize: 16, textDecoration: 'none',
          }}
        >
          Get Started, It's Free <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};

/* --------------------------------- Footer ---------------------------------- */
const Footer: React.FC = () => {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <footer ref={ref} className={inView ? 'show' : ''} style={{ background: '#fff', borderTop: `1px solid ${COLORS.border}` }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 w-full max-w-[1200px] mx-auto px-6 py-16">
        <div className="reveal reveal-delay-1 lg:col-span-1 md:col-span-2">
          <img src="/stampee.svg" alt="Stampee" style={{ height: 40, width: 'auto', marginBottom: 14 }} />
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
        (c) {new Date().getFullYear()} Stampee. Built for small businesses.
      </div>
    </footer>
  );
};

/* ------------------------------ Landing Page ------------------------------- */
const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Stampee | Digital Loyalty Cards for Small Businesses';
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', background: COLORS.bg, color: COLORS.fg }}>
      <Navbar />
      <Hero />
      <Marquee />
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
