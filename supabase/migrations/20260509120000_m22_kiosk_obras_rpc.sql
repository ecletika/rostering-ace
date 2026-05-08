-- Função RPC para o kiosk obter obras autorizadas
-- SECURITY DEFINER: contorna RLS de forma segura
-- Funciona mesmo sem sessão de auth (anon)
CREATE OR REPLACE FUNCTION public.m22_kiosk_obras(p_employee_id uuid DEFAULT NULL)
RETURNS TABLE (
  id          uuid,
  name        text,
  client_name text,
  authorized  boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1.ª tentativa: obras autorizadas para o funcionário específico
  IF p_employee_id IS NOT NULL THEN
    RETURN QUERY
      SELECT
        ws.id,
        ws.name,
        COALESCE(c.name, '—') AS client_name,
        TRUE AS authorized
      FROM m22_employee_work_sites ews
      JOIN m22_work_sites ws ON ws.id = ews.work_site_id
      LEFT JOIN m22_clients c ON c.id = ws.client_id
      WHERE ews.employee_id = p_employee_id
        AND ews.active = TRUE
        AND ews.permission <> 'blocked'
        AND ws.status = 'active'
      ORDER BY ws.name;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  -- Fallback: todas as obras ativas que permitem externo
  RETURN QUERY
    SELECT
      ws.id,
      ws.name,
      COALESCE(c.name, '—') AS client_name,
      FALSE AS authorized
    FROM m22_work_sites ws
    LEFT JOIN m22_clients c ON c.id = ws.client_id
    WHERE ws.status = 'active'
      AND ws.allow_external = TRUE
    ORDER BY ws.name;
END;
$$;

-- Conceder execução ao role anon e authenticated
GRANT EXECUTE ON FUNCTION public.m22_kiosk_obras(uuid) TO anon, authenticated;
