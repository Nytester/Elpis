import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const SIGNED_URL_TTL = 60 * 60; // seconds

// Reddit's "hot" ranking formula: engagement gives a post an initial boost
// (log-scaled, so the 10th reaction matters much less than the 1st), and a
// recency term that grows with the post's own timestamp — so newer posts
// naturally outrank older ones of similar engagement without needing votes
// to decay over time. EPOCH is Reddit's original reference point; the exact
// value only matters for relative ordering, not in isolation.
const HOT_EPOCH_SECONDS = 1134028003;

function hotScore(reactionCount, commentCount, createdAt) {
  const score = reactionCount + commentCount;
  const order = Math.log10(Math.max(score, 1));
  const seconds = new Date(createdAt).getTime() / 1000 - HOT_EPOCH_SECONDS;
  return order + seconds / 45000;
}

function mergePosts(posts, reactions, comments, myId) {
  return posts
    .map((p) => {
      const reactionCount = reactions.filter((r) => r.post_id === p.id).length;
      const postComments = comments
        .filter((c) => c.post_id === p.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      return {
        ...p,
        reactionCount,
        reactedByMe: reactions.some((r) => r.post_id === p.id && r.user_id === myId),
        comments: postComments,
        isMine: p.author_id === myId,
        hotScore: hotScore(reactionCount, postComments.length, p.created_at),
      };
    })
    .sort((a, b) => b.hotScore - a.hotScore);
}

export function useHope() {
  const { session } = useAuth();
  const [posts, setPosts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setPosts([]);
      setLoading(false);
      return;
    }

    let active = true;
    const load = async () => {
      const { data: postRows } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!active || !postRows) return;

      const ids = postRows.map((p) => p.id);
      const [{ data: reactionRows }, { data: commentRows }] = await Promise.all([
        ids.length ? supabase.from('community_likes').select('*').in('post_id', ids) : Promise.resolve({ data: [] }),
        ids.length
          ? supabase.from('community_comments').select('*').in('post_id', ids).order('created_at')
          : Promise.resolve({ data: [] }),
      ]);
      if (!active) return;

      setPosts(mergePosts(postRows, reactionRows ?? [], commentRows ?? [], session.user.id));
      setLoading(false);

      const paths = [...new Set(postRows.map((p) => p.image_path).filter(Boolean))];
      if (paths.length) {
        const { data: signed } = await supabase.storage.from('community-photos').createSignedUrls(paths, SIGNED_URL_TTL);
        if (active && signed) {
          setImageUrls(Object.fromEntries(signed.filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl])));
        }
      }
    };

    load();

    const channel = supabase
      .channel(`hope-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_likes' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  const createPost = useCallback(
    async ({ caption, file, category }) => {
      let imagePath = null;
      if (file) {
        const ext = file.name.split('.').pop();
        imagePath = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('community-photos').upload(imagePath, file, { upsert: false });
        if (uploadError) throw uploadError;
      }
      const { error } = await supabase.rpc('create_community_post', {
        p_caption: caption?.trim() || null,
        p_image_path: imagePath,
        p_category: category || 'thought',
      });
      if (error) throw error;
    },
    [session]
  );

  const deletePost = useCallback(async (post) => {
    const { error } = await supabase.from('community_posts').delete().eq('id', post.id);
    if (error) throw error;
    if (post.image_path) await supabase.storage.from('community-photos').remove([post.image_path]);
  }, []);

  const toggleReaction = useCallback(
    async (post) => {
      if (post.reactedByMe) {
        await supabase.from('community_likes').delete().eq('post_id', post.id).eq('user_id', session.user.id);
      } else {
        await supabase.from('community_likes').insert({ post_id: post.id, user_id: session.user.id, reaction_type: 'hope' });
      }
    },
    [session]
  );

  const addComment = useCallback(async (postId, body) => {
    const { error } = await supabase.rpc('create_community_comment', { p_post_id: postId, p_body: body });
    if (error) throw error;
  }, []);

  const reportPost = useCallback(async (postId) => {
    const { error } = await supabase.rpc('report_community_post', { p_post_id: postId });
    if (error) throw error;
  }, []);

  return { posts, imageUrls, loading, createPost, deletePost, toggleReaction, addComment, reportPost };
}
