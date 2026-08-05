import { useRef, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { useHope } from '../hooks/useHope.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRelativeDate } from '../lib/formatDate.js';
import './dashboardGlass.css';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const CATEGORIES = [
  { value: 'milestone', label: '🌱 Milestone', tagClass: 'tag-accent' },
  { value: 'support', label: '❤️ Need Support', tagClass: 'tag-outline' },
  { value: 'question', label: '❓ Question', tagClass: 'tag-neutral' },
  { value: 'good_news', label: '🎉 Good News', tagClass: 'tag-accent-2' },
  { value: 'thought', label: '☀️ Just Sharing', tagClass: 'tag-neutral' },
];
const CATEGORY_BY_VALUE = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));
const MOMENT_EMOJI = { milestone: '🌱', good_news: '🎉' };

const DAILY_PROMPTS = [
  "Healing isn't only measured by test results. What's one small victory you've had this week?",
  'Someone here may need exactly the story you have to share today.',
  'What gave you hope today?',
  'Progress can be quiet. What helped you today?',
  "Hope grows when it's shared.",
];

const EMPTY_STATES = {
  All: { heading: 'Hope starts with one story.', body: 'Be the first to encourage someone today.' },
  support: { heading: 'No one has asked for support today.', body: 'You could be the first.' },
  milestone: { heading: 'Every journey has milestones.', body: 'Celebrate your next one.' },
  question: { heading: 'No questions yet today.', body: 'Someone may have the answer you need.' },
};

const HeartIcon = ({ filled, className }) => (
  <svg className={className} viewBox="0 0 24 24" width="19" height="19" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a8 8 0 1 1-3.4-6.5L21 4l-1 4.3A7.9 7.9 0 0 1 21 12z" />
  </svg>
);

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3v18M5 4h12l-3 4 3 4H5" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);

const EmptyIllustration = () => (
  <svg viewBox="0 0 96 96" width="72" height="72" fill="none">
    <circle cx="48" cy="48" r="46" fill="var(--color-accent-100)" />
    <path d="M48 68s-19-11.5-24.5-22.5A13.7 13.7 0 0 1 48 30a13.7 13.7 0 0 1 24.5 15.5C67 56.5 48 68 48 68z" stroke="var(--color-accent-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function initialsOf(name) {
  return (name ?? '').split(' ').map((w) => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

function excerptOf(caption) {
  if (caption.length <= 60) return caption;
  return `${caption.slice(0, 60).trim()}…`;
}

function DailyReflection() {
  const [prompt] = useState(() => DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)]);
  return (
    <div className="ep-prompt-card">
      <SparkleIcon />
      <div>
        <div className="ep-prompt-kicker">Daily Reflection</div>
        <div className="ep-prompt-text">{prompt}</div>
      </div>
    </div>
  );
}

function PostComposer({ onSubmit }) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('thought');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Please choose a JPEG, PNG, WEBP, or GIF image.');
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError('Images must be under 5 MB.');
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeComposer = () => {
    setCaption('');
    setCategory('thought');
    clearFile();
    setError('');
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !file) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ caption, file, category });
      closeComposer();
    } catch (err) {
      setError(err.message ?? 'Could not share your story.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="ep-composer-trigger" onClick={() => setOpen(true)}>
        <div className="ep-avatar ep-avatar-lg">{initialsOf(profile?.full_name)}</div>
        <span>What's on your mind today?</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card elev-md" style={{ marginBottom: 'var(--space-5)', gap: 'var(--space-3)', borderRadius: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="ep-avatar ep-avatar-lg">{initialsOf(profile?.full_name)}</div>
        <div>
          <span className="card-kicker">Share Your Story</span>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>{profile?.full_name}</div>
        </div>
      </div>
      {error && <div className="ep-err">{error}</div>}
      <textarea
        className="input"
        placeholder="What's on your mind today?"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={3}
        autoFocus
        style={{ border: 'none', padding: '4px 0', fontSize: 15 }}
      />
      {preview && (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
          <button type="button" className="btn btn-icon" onClick={clearFile} style={{ position: 'absolute', top: 8, right: 8, background: 'var(--color-bg)', borderRadius: '50%' }} aria-label="Remove photo">×</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', borderTop: '1px solid var(--color-divider)', paddingTop: 'var(--space-3)' }}>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Add a Moment
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 'auto' }}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button type="button" className="btn btn-ghost" onClick={closeComposer}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting || (!caption.trim() && !file)}>
          {submitting ? 'Sharing…' : 'Share'}
        </button>
      </div>
    </form>
  );
}

function PostCard({ post, imageUrl, highlighted, registerRef, onToggleReaction, onAddComment, onReport, onDelete }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [error, setError] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  const handleReact = () => {
    if (!post.reactedByMe) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 400);
    }
    onToggleReaction(post);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentDraft.trim()) return;
    setSubmittingComment(true);
    setError('');
    try {
      await onAddComment(post.id, commentDraft);
      setCommentDraft('');
    } catch (err) {
      setError(err.message ?? 'Could not add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReport = () => {
    if (window.confirm('Report this post? It will be hidden automatically once a few other patients also report it.')) {
      onReport(post.id).catch((err) => setError(err.message ?? 'Could not report post.'));
    }
  };

  const handleDelete = () => {
    if (window.confirm('Remove this story? This cannot be undone.')) {
      onDelete(post).catch((err) => setError(err.message ?? 'Could not remove story.'));
    }
  };

  return (
    <article className={`ep-post-card${highlighted ? ' highlighted' : ''}`} ref={registerRef}>
      <div className="ep-post-header">
        <div className="ep-avatar ep-avatar-lg">{initialsOf(post.author_name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ep-post-name">{post.author_name}</div>
          <div className="text-muted ep-post-time">{formatRelativeDate(post.created_at)}</div>
        </div>
        {post.category && post.category !== 'thought' && (
          <span className={`tag ${CATEGORY_BY_VALUE[post.category]?.tagClass ?? 'tag-neutral'}`}>
            {CATEGORY_BY_VALUE[post.category]?.label ?? post.category}
          </span>
        )}
        {post.isMine && post.hidden && <span className="tag tag-neutral">Hidden after reports</span>}
      </div>

      {post.caption && <p className="ep-post-caption">{post.caption}</p>}

      {post.image_path && imageUrl && (
        <div className="ep-post-photo">
          <img src={imageUrl} alt="" />
        </div>
      )}

      <div className="ep-post-actions">
        <button type="button" className={`ep-post-action${post.reactedByMe ? ' reacted' : ''}`} onClick={handleReact}>
          <HeartIcon filled={post.reactedByMe} className={pulsing ? 'pulse' : ''} />
          Sending Hope
          {post.reactionCount > 0 && <span className="ep-post-action-count"> · {post.reactionCount}</span>}
        </button>
        <button type="button" className="ep-post-action" onClick={() => setCommentsOpen((s) => !s)}>
          <CommentIcon /> Comments
          {post.comments.length > 0 && <span className="ep-post-action-count"> · {post.comments.length}</span>}
        </button>
        <div style={{ flex: 1 }} />
        {post.isMine ? (
          <button type="button" className="ep-post-action" onClick={handleDelete}>Remove Story</button>
        ) : (
          <button type="button" className="ep-post-action" onClick={handleReport}>
            <FlagIcon /> Report
          </button>
        )}
      </div>

      {commentsOpen && (
        <div className="ep-post-comments">
          {error && <div className="ep-err">{error}</div>}
          {post.comments.map((c) => (
            <div key={c.id} className="ep-post-comment">
              <b>{c.author_name}</b>
              <span>{c.body}</span>
            </div>
          ))}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              className="input"
              placeholder="Add a comment..."
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-secondary" disabled={submittingComment || !commentDraft.trim()}>Post</button>
          </form>
        </div>
      )}
    </article>
  );
}

export default function Hope() {
  const { posts, imageUrls, loading, createPost, deletePost, toggleReaction, addComment, reportPost } = useHope();
  const [activeCategory, setActiveCategory] = useState('All');
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const postRefs = useRef({});

  const visiblePosts = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);
  const moments = posts
    .filter((p) => (p.category === 'milestone' || p.category === 'good_news') && p.caption?.trim())
    .slice(0, 6);
  const emptyState = EMPTY_STATES[activeCategory] ?? EMPTY_STATES.All;

  const scrollToPost = (postId) => {
    setActiveCategory('All');
    requestAnimationFrame(() => {
      postRefs.current[postId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    setHighlightedPostId(postId);
    setTimeout(() => setHighlightedPostId((id) => (id === postId ? null : id)), 1500);
  };

  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Hope" />

      <div className="ep-main">
       <div className="gl-dash" style={{ maxWidth: 720, marginInline: 'auto' }}>
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <h1 className="gl-greeting" style={{ fontSize: 32 }}>Hope</h1>
          <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>A place to share encouragement, celebrate milestones, ask questions, and support others on their journey.</p>
        </div>

        <DailyReflection />

        <PostComposer onSubmit={createPost} />

        {moments.length > 0 && (
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Today's Hope</h2>
            <div className="ep-moments-row">
              {moments.map((m) => (
                <div key={m.id} className="ep-moment-card" onClick={() => scrollToPost(m.id)}>
                  <div style={{ marginBottom: 6 }}>
                    {MOMENT_EMOJI[m.category]}{' '}
                    <b style={{ fontFamily: 'var(--font-heading)' }}>{m.author_name.split(' ')[0]}</b>
                  </div>
                  <div className="text-muted">{excerptOf(m.caption)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
          {['All', ...CATEGORIES.map((c) => c.value)].map((value) => (
            <span
              key={value}
              className={`ep-chip${activeCategory === value ? ' selected' : ''}`}
              onClick={() => setActiveCategory(value)}
            >
              {value === 'All' ? 'All' : CATEGORY_BY_VALUE[value].label}
            </span>
          ))}
        </div>

        {loading && <p className="text-muted" style={{ fontSize: 13 }}>Gathering today's stories…</p>}

        {!loading && visiblePosts.length === 0 && (
          <div className="ep-hope-empty">
            <EmptyIllustration />
            <h3>{emptyState.heading}</h3>
            <p className="text-muted" style={{ fontSize: 14, margin: 0 }}>{emptyState.body}</p>
          </div>
        )}

        <div className="ep-community-feed">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              imageUrl={post.image_path ? imageUrls[post.image_path] : null}
              highlighted={post.id === highlightedPostId}
              registerRef={(el) => { if (el) postRefs.current[post.id] = el; }}
              onToggleReaction={toggleReaction}
              onAddComment={addComment}
              onReport={reportPost}
              onDelete={deletePost}
            />
          ))}
        </div>

        {!loading && visiblePosts.length > 0 && (
          <div className="ep-feed-end">
            You've reached the end for today.<br />
            Take care of yourself. We'll be here tomorrow.<br />
            🌿
          </div>
        )}
       </div>
      </div>
    </div>
  );
}
