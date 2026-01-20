create or replace function fn_next_available_username(base_username text)
returns text
language plpgsql
as $$
declare
    candidate text;
    counter int := 0;
begin
    candidate := base_username;
    loop
        exit when not exists (select 1 from users where loginUser = candidate);
        counter := counter + 1;
        candidate := base_username || counter::text;
    end loop;
    return candidate;
end;
$$;
