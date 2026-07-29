alter table community_posts add column category text not null default 'thought'
  check (category in ('milestone','good_news','support','question','thought'));

-- create_community_post gains a 3rd parameter. Postgres identifies functions by
-- name + argument types, so adding a parameter creates a NEW overload rather than
-- replacing the old one — drop the 2-arg version first so it doesn't linger as
-- dead code alongside the 3-arg one.
drop function if exists create_community_post(text, text);

create or replace function create_community_post(p_caption text, p_image_path text default null, p_category text default 'thought')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_id uuid;
begin
  select full_name into v_name from profiles where id = auth.uid() and role in ('patient','caregiver');
  if v_name is null then
    raise exception 'Only patients or caregivers can post';
  end if;

  if (p_caption is null or btrim(p_caption) = '') and (p_image_path is null or btrim(p_image_path) = '') then
    raise exception 'Post must include a caption or a photo';
  end if;

  if p_image_path is not null and p_image_path not like (auth.uid()::text || '/%') then
    raise exception 'Invalid image path';
  end if;

  if p_category not in ('milestone','good_news','support','question','thought') then
    raise exception 'Invalid category';
  end if;

  insert into community_posts (author_id, author_name, caption, image_path, category)
  values (auth.uid(), v_name, nullif(btrim(p_caption), ''), p_image_path, p_category)
  returning id into v_id;

  return v_id;
end;
$$;
grant execute on function create_community_post(text, text, text) to authenticated;
