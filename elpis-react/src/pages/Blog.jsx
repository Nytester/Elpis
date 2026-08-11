import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { BLOG_POSTS } from '../lib/blogPosts.js';
import './dashboardGlass.css';

export default function Blog() {
  return (
    <div className="gl-public gl-auth-bg" style={{ minHeight: '100vh' }}>
      <Navbar />

      <div className="ep-container" style={{ maxWidth: 760, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
        <span className="gl-hero-eyebrow">From the team behind Elpis</span>
        <h1 className="gl-hero-title" style={{ fontSize: 44, marginTop: 'var(--space-4)', maxWidth: '18ch' }}>
          Why we're building Elpis, and what we're learning along the way.
        </h1>
      </div>

      <div className="ep-container" style={{ maxWidth: 820, paddingBottom: 'var(--space-8)' }}>
        {BLOG_POSTS.length === 0 ? (
          <div className="gl-hero-frame" style={{ padding: 'var(--space-6)' }}>
            <p className="text-muted" style={{ margin: 0 }}>No posts yet — check back soon.</p>
          </div>
        ) : (
          <>
            {/* Featured — the most recent post, given the full editorial
                treatment: bigger type and its own pull-quote. */}
            <Link
              to={`/blog/${BLOG_POSTS[0].slug}`}
              className="gl-hero-frame gl-blog-card gl-blog-featured"
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
              <span className="gl-kicker">Latest</span>
              <span className="text-muted" style={{ display: 'block', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6 }}>{BLOG_POSTS[0].date}</span>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 38, marginTop: 'var(--space-2)', lineHeight: 1.12 }}>{BLOG_POSTS[0].title}</h2>
              <p className="text-muted" style={{ fontSize: 16, marginTop: 'var(--space-3)', maxWidth: '58ch', lineHeight: 1.65 }}>{BLOG_POSTS[0].excerpt}</p>
              {BLOG_POSTS[0].pullQuote && (
                <blockquote className="gl-pullquote" style={{ marginTop: 'var(--space-5)' }}>&ldquo;{BLOG_POSTS[0].pullQuote}&rdquo;</blockquote>
              )}
              <span style={{ display: 'inline-block', marginTop: 'var(--space-5)', fontSize: 13, color: '#1d7a5f' }}>Read the full story →</span>
            </Link>

            {/* Everything else — a quieter, denser list underneath. */}
            {BLOG_POSTS.length > 1 && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <span className="gl-kicker" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>More stories</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {BLOG_POSTS.slice(1).map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="gl-hero-frame gl-blog-card"
                      style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: 'var(--space-5) var(--space-6)' }}
                    >
                      <span className="text-muted" style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{post.date}</span>
                      <h3 style={{ fontSize: 21, fontWeight: 600, fontFamily: 'var(--font-heading)', marginTop: 'var(--space-2)' }}>{post.title}</h3>
                      <p className="text-muted" style={{ fontSize: 14.5, marginTop: 6, maxWidth: '60ch', lineHeight: 1.6 }}>{post.excerpt}</p>
                      <span style={{ display: 'inline-block', marginTop: 'var(--space-2)', fontSize: 13, color: '#1d7a5f' }}>Read more →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
