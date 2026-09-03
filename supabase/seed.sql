-- Seed default supported domains
insert into public.supported_domains (domain, enabled, notes)
values
  ('example.com', true, 'Default test domain for HTML5 video extraction'),
  ('commondatastorage.googleapis.com', true, 'Public Google Cloud Storage direct video samples'),
  ('sample-videos.com', true, 'Public sample video streams'),
  ('vjs.zencdn.net', true, 'VideoJS public video streams'),
  ('archive.org', true, 'Internet Archive open media')
on conflict (domain) do update set enabled = excluded.enabled;
