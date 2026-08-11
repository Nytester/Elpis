import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { BLOG_POSTS } from '../lib/blogPosts.js';
import './dashboardGlass.css';

// Roughly the midpoint paragraph — where the pull-quote breaks up the text.
function midpoint(arr) {
  return Math.floor(arr.length / 2);
}

// Bolds every occurrence of `name` within a paragraph's text, leaving
// everything else untouched.
function withBoldName(text, name) {
  if (!name) return text;
  const parts = text.split(name);
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) => (
    i === 0 ? [part] : [<strong key={i}>{name}</strong>, part]
  ));
}

export default function BlogPost() {
  const { slug } = useParams();
  const index = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const post = BLOG_POSTS[index];
  const nextPost = index !== -1 && BLOG_POSTS.length > 1 ? BLOG_POSTS[(index + 1) % BLOG_POSTS.length] : null;

  if (!post) {
    return (
      <div className="gl-public gl-auth-bg" style={{ minHeight: '100vh' }}>
        <Navbar />
        <div className="ep-container" style={{ maxWidth: 820, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <div className="gl-hero-frame" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ margin: 0 }}>Post not found</h2>
            <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>This post doesn't exist, or may have been moved.</p>
            <Link to="/blog" style={{ color: '#1d7a5f', fontSize: 13 }}>← Back to Blog</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="gl-public gl-auth-bg" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="ep-container" style={{ maxWidth: 720, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <Link to="/blog" className="gl-hero-eyebrow" style={{ textDecoration: 'none' }}>← Back to Blog</Link>
        <h1 className="gl-hero-title" style={{ fontSize: 40, marginTop: 'var(--space-5)', textAlign: 'left' }}>{post.title}</h1>
        <span className="text-muted" style={{ display: 'block', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 'var(--space-3)' }}>{post.date}</span>

        <div className="gl-hero-frame" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-7, 40px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {post.body.map((paragraph, i) => (
              <Fragment key={i}>
                <p className={i === 0 ? 'gl-dropcap' : undefined} style={{ fontSize: 16, lineHeight: 1.7, margin: 0 }}>
                  {post.slug === 'finding-the-right-partner' ? withBoldName(paragraph, 'Prabhakar Shrestha') : paragraph}
                </p>
                {post.pullQuote && i === midpoint(post.body) && (
                  <blockquote className="gl-pullquote">&ldquo;{post.pullQuote}&rdquo;</blockquote>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {nextPost && (
          <Link to={`/blog/${nextPost.slug}`} className="gl-hero-frame gl-blog-card gl-post-nav" style={{ marginTop: 'var(--space-5)' }}>
            <span className="gl-kicker">Next story</span>
            <h4>{nextPost.title} →</h4>
          </Link>
        )}
      </div>
      <Footer />
    </div>
  );
}
