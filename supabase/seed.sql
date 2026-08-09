-- Sample data for local development (run automatically by `supabase db reset`).
-- Mirrors src/lib/mockData.ts so the app looks the same in demo mode and once
-- connected to a real local/staging Supabase project.

insert into public.videos (title, description, video_url, published, display_order) values
  ('Championship Trailer — Season', 'A first look at the biggest checkers championship in Hopeland history.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, 1),
  ('Meet the Defending Champion', 'An inside look at the training routine of last year''s world title holder.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, 2),
  ('How Qualifiers Work', 'Everything you need to know about the regional qualifier brackets.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, 3),
  ('Behind the Board: Live Production', 'A look at how we broadcast every match to over 120 countries.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, 4)
on conflict do nothing;

insert into public.sponsors (name, logo_url, website_url, tier, display_order) values
  ('Northbridge Capital', '', '#', 'platinum', 1),
  ('Solstice Games', '', '#', 'platinum', 2),
  ('Ardent Media', '', '#', 'gold', 3),
  ('Vantage Sports', '', '#', 'gold', 4),
  ('Clearwater Foods', '', '#', 'silver', 5),
  ('Meridian Airlines', '', '#', 'silver', 6),
  ('Pinehall Studios', '', '#', 'partner', 7),
  ('Everline Bank', '', '#', 'partner', 8)
on conflict do nothing;

insert into public.blog_posts (title, slug, excerpt, content, author, published, published_at) values
  (
    'Registration Opens for the World Championship',
    'registration-opens',
    'Players from over 120 countries can now secure their spot on the road to the world title.',
    'Registration for the Hopeland Global Checkers World Championship is officially open. This year''s tournament introduces expanded regional qualifiers, a larger prize pool, and live-streamed coverage of every match from the quarterfinals onward.\n\nPlayers of every skill level are welcome to compete in the Open Division, while the Masters Division remains reserved for federation-rated players.',
    'Hopeland Organizing Committee',
    true,
    now()
  ),
  (
    'Inside the New Fair-Play Review System',
    'fair-play-review-system',
    'A closer look at the certified referee panel and the technology keeping every match fair.',
    'Fair play is the foundation of every Hopeland Global Checkers event. This season, we''re introducing an expanded certified referee panel alongside a digital move-review system used across all qualifier and final-stage matches.',
    'Competition Integrity Team',
    true,
    now()
  )
on conflict (slug) do nothing;
