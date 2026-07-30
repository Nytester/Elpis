import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { BLOG_POSTS } from '../lib/blogPosts.js';

export default function Blog() {
  return (
    <>
      <Navbar />

      <div className="ep-container" style={{ maxWidth: 760, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <h6 style={{ color: 'var(--color-accent-700)' }}>From the team behind Elpis</h6>
        <h1 style={{ fontSize: 52, fontWeight: 400, marginTop: 'var(--space-4)', lineHeight: 1.12, maxWidth: '18ch' }}>
          Why we're building Elpis, and what we're learning along the way.
        </h1>
      </div>

      <div className="hr ep-container" style={{ maxWidth: 760 }} />

      <div className="ep-container" style={{ maxWidth: 760, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        {BLOG_POSTS.length === 0 ? (
          <p className="text-muted">No posts yet — check back soon.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {BLOG_POSTS.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                style={{
                  display: 'block', textDecoration: 'none', color: 'inherit',
                  padding: 'var(--space-6) 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--color-divider)',
                }}
              >
                <span className="text-muted" style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{post.date}</span>
                <h2 style={{ fontSize: 28, fontWeight: 400, marginTop: 'var(--space-2)' }}>{post.title}</h2>
                <p className="text-muted" style={{ fontSize: 15.5, marginTop: 'var(--space-2)', maxWidth: '60ch', lineHeight: 1.6 }}>{post.excerpt}</p>
                <span style={{ display: 'inline-block', marginTop: 'var(--space-3)', fontSize: 13, color: 'var(--color-accent-700)' }}>Read more →</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
