import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Lock } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { hexToRgba } from '@/lib/utils';

const COLORS = {
  bg: '#e8e4dc',
  card: '#f0ece3',
  fg: '#1a1916',
  muted: '#6b6560',
  border: '#d4d0c8',
  terracotta: '#c97b4b',
  teal: '#3a6b60',
  olive: '#5c6b4a',
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ NavBar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
        zIndex: 100,
        width: 'min(860px, 90vw)',
        background: scrolled ? 'rgba(232,228,220,0.92)' : 'rgba(232,228,220,0.85)',
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
        {[{ label: 'Features', to: '/#features' }, { label: 'How It Works', to: '/#how-it-works' }, { label: 'Plans', to: '/#plans' }, { label: 'FAQ', to: '/#faq' }].map((link) => (
          <Link
            key={link.label}
            to={link.to}
            style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = COLORS.fg)}
            onMouseLeave={e => (e.currentTarget.style.color = COLORS.muted)}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link
          to="/contact"
          style={{ fontSize: 13, fontWeight: 500, color: COLORS.terracotta, textDecoration: 'none', padding: '6px 14px', transition: 'color 0.2s' }}
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
          to={currentUser ? '/dashboard' : '/login'}
          style={{
            fontSize: 13, fontWeight: 600, color: '#fff',
            background: COLORS.terracotta, border: 'none', borderRadius: 9999,
            padding: '8px 20px', textDecoration: 'none', transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#b56a3a')}
          onMouseLeave={e => (e.currentTarget.style.background = COLORS.terracotta)}
        >
          {currentUser ? 'Dashboard' : 'Get Started â€” Free'}
        </Link>
      </div>
    </nav>
  );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#fff', borderTop: `1px solid ${COLORS.border}` }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 w-full max-w-[1200px] mx-auto px-6 py-16">
        <div className="lg:col-span-1 md:col-span-2">
          <Link to="/">
            <img src="/stampee.svg" alt="Stampee" style={{ height: 40, width: 'auto', marginBottom: 14 }} />
          </Link>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.muted, maxWidth: 260 }}>
            A digital loyalty card platform built for small businesses worldwide.
          </p>
        </div>
        {[
          { heading: 'Product', links: [{ label: 'Features', to: '/#features' }, { label: 'Campaigns', to: '/#how-it-works' }, { label: 'Analytics', to: '/#features' }] },
          { heading: 'Company', links: [{ label: 'About', to: '#' }, { label: 'Blog', to: '#' }, { label: 'Contact', to: '/contact' }, { label: 'Privacy Policy', to: '#' }, { label: 'Terms of Service', to: '#' }] },
          { heading: 'Community', links: [{ label: 'Discord', to: '#' }, { label: 'Twitter', to: '#' }] },
        ].map((col, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.fg, marginBottom: 18 }}>{col.heading}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((l, j) => (
                <Link key={j} to={l.to} style={{ fontSize: 14, color: COLORS.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = COLORS.fg)}
                  onMouseLeave={e => (e.currentTarget.style.color = COLORS.muted)}
                >{l.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${COLORS.border}`, textAlign: 'center', padding: '20px 24px', fontSize: 12, color: COLORS.muted }}>
        Â© {new Date().getFullYear()} Stampee. Built for small businesses.
      </div>
    </footer>
  );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Contact Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ContactPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', background: COLORS.bg, color: COLORS.fg, minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px 24px 80px' }}>
        <div style={{ width: '100%', maxWidth: 540 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', color: COLORS.fg, margin: '0 0 16px' }}>
              Get in touch
            </h1>
            <p style={{ fontSize: 18, color: COLORS.muted, maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
              Questions about Stampee or need help setting up? We'd love to hear from you.
            </p>
          </div>

          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 32, padding: '40px 36px' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 64, height: 64, background: hexToRgba(COLORS.terracotta, 0.1), color: COLORS.terracotta, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <MessageSquare size={32} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: COLORS.fg, marginBottom: 8 }}>Message Sent</h3>
                <p style={{ color: COLORS.muted, fontSize: 15 }}>
                  Thanks for reaching out! We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  style={{ marginTop: 28, fontSize: 14, fontWeight: 700, color: COLORS.terracotta, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { id: 'name', label: 'Name', type: 'text', placeholder: 'Jane Doe' },
                  { id: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
                ].map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} style={{ display: 'block', fontSize: 13, fontWeight: 700, color: COLORS.fg, marginBottom: 8 }}>{field.label}</label>
                    <input
                      type={field.type}
                      id={field.id}
                      required
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 12,
                        border: `1px solid ${COLORS.border}`, background: '#fff',
                        fontSize: 14, color: COLORS.fg, boxSizing: 'border-box',
                        outline: 'none', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = COLORS.terracotta)}
                      onBlur={e => (e.currentTarget.style.borderColor = COLORS.border)}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="message" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: COLORS.fg, marginBottom: 8 }}>Message</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="How can we help?"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: `1px solid ${COLORS.border}`, background: '#fff',
                      fontSize: 14, color: COLORS.fg, boxSizing: 'border-box',
                      outline: 'none', resize: 'none', transition: 'border-color 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = COLORS.terracotta)}
                    onBlur={e => (e.currentTarget.style.borderColor = COLORS.border)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  style={{
                    width: '100%', padding: '14px', background: COLORS.terracotta,
                    color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 12,
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, transition: 'background 0.2s',
                    opacity: status === 'submitting' ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (status !== 'submitting') e.currentTarget.style.background = '#b56a3a'; }}
                  onMouseLeave={e => (e.currentTarget.style.background = COLORS.terracotta)}
                >
                  {status === 'submitting' ? 'Sending...' : (
                    <>
                      <Mail size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
