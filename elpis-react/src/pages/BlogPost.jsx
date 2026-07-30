import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { BLOG_POSTS } from '../lib/blogPosts.js';

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="ep-container" style={{ maxWidth: 820, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <h2>Post not found</h2>
          <p className="text-muted">This post doesn't exist, or may have been moved.</p>
          <Link to="/blog">← Back to Blog</Link>
        </div>
        <div className="hr ep-container" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="ep-container" style={{ maxWidth: 720, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <Link to="/blog" style={{ fontSize: 13 }}>← Back to Blog</Link>
        <span className="text-muted" style={{ display: 'block', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 'var(--space-5)' }}>{post.date}</span>
        <h1 style={{ fontSize: 46, fontWeight: 400, marginTop: 'var(--space-3)', lineHeight: 1.15 }}>{post.title}</h1>
        <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {post.body.map((paragraph, i) => (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.7 }}>{paragraph}</p>
          ))}
        </div>
      </div>
      <div className="hr ep-container" />
      <Footer />
    </>
  );
}
