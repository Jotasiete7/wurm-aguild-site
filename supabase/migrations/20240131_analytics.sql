-- Migration: 20240131_analytics.sql
-- Description: RPC function to get Database Usage Stats (Free Tier Monitoring)
create or replace function get_db_stats() returns json language plpgsql security definer as $$
declare total_size bigint;
recipes_count bigint;
begin -- 1. Get total Database Size (approx)
select pg_database_size(current_database()) into total_size;
-- 2. Get Row Counts (Key Tables)
select count(*)
from recipes into recipes_count;
-- Return JSON
return json_build_object(
    'db_size_bytes',
    total_size,
    'db_size_mb',
    round(total_size / 1024.0 / 1024.0, 2),
    'recipes_count',
    recipes_count,
    'limit_db_size_mb',
    500 -- Free Tier Limit
);
end;
$$;
-- Grant access to authenticated users (so Admins can call it)
grant execute on function get_db_stats() to authenticated;
grant execute on function get_db_stats() to anon;
-- Temporarily for testing/dashboard if needed, or restrict to auth