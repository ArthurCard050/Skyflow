-- ==============================================================================
-- FIX PARA CONVITES DE MEMBROS DA EQUIPE NO MULTI-TENANCY
-- Esse script cria as permissões adequadas para o administrador poder convidar.
-- ==============================================================================

-- 1. Permitir que Administradores leiam qualquer perfil (necessário para ver se o email já existe)
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR id IN (SELECT member_id FROM team_members WHERE owner_id = auth.uid())
    OR id IN (SELECT owner_id FROM team_members WHERE member_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 2. Permitir que Administradores insiram perfis (quando criam um novo membro)
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. Função segura (bypassa o RLS) para ligar um usuário que já existe na plataforma à sua agência
CREATE OR REPLACE FUNCTION link_existing_user_to_team(
  p_email TEXT,
  p_owner_id UUID,
  p_role TEXT,
  p_client_id UUID DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Roda como admin do banco de dados para bypassar bloqueios
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Procurar o ID do usuário pelo email na tabela profiles
  SELECT id INTO v_user_id FROM profiles WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Inserir ou atualizar na team_members
  INSERT INTO team_members (owner_id, member_id, role, client_id)
  VALUES (p_owner_id, v_user_id, p_role, p_client_id)
  ON CONFLICT (owner_id, member_id) 
  DO UPDATE SET role = EXCLUDED.role, client_id = EXCLUDED.client_id;
  
  RETURN TRUE;
END;
$$;
