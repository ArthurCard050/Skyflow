-- ==============================================================================
-- RESOLUÇÃO DEFINITIVA DO LOOP (INFINITE RECURSION) E RLS
-- Utilizar SECURITY DEFINER para verificar funções (bypassa o RLS interno previnindo o loop)
-- ==============================================================================

-- 1. Helper Function Seguro para ler cargos SEM ativar o gatilho de segurança (evita o loop 42P17)
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_role text;
BEGIN
  -- Como o SECURITY DEFINER roda como 'root/superuser', esse SELECT não dispara NENHUMA Rule Level Security
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  RETURN v_role = 'admin';
END;
$$;

-- 2. Limpar todas as políticas possivelmente problemáticas existentes para perfis
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

-- 3. Recriar as Políticas Blindadas sem sub-consultas vulneráveis a recursão
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid() -- A própria pessoa pode ler seu perfil
    OR id IN (SELECT member_id FROM team_members WHERE owner_id = auth.uid()) -- Admins leem a equipe
    OR id IN (SELECT owner_id FROM team_members WHERE member_id = auth.uid()) -- Membros leem o Admin
    OR is_admin() -- Segurança extra: Admin lê qualquer perfil p/ checar existência na hora do convite
  );

CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid() -- Próprio usuário cria a conta
    OR is_admin() -- Admin pode inserir o perfil por ele (durante o invite na DB.ts)
  );

CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (
    id = auth.uid() -- Próprio usuário edita perfil
    OR (is_admin() AND id IN (SELECT member_id FROM team_members WHERE owner_id = auth.uid())) -- Admin só altera QUEM está na equipe dele
  );

-- 4. Função segura para ligar contas já existentes à agência, no caso do email já ser cadastrado no Supabase
CREATE OR REPLACE FUNCTION link_existing_user_to_team(
  p_email TEXT,
  p_owner_id UUID,
  p_role TEXT,
  p_client_id UUID DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM profiles WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO team_members (owner_id, member_id, role, client_id)
  VALUES (p_owner_id, v_user_id, p_role, p_client_id)
  ON CONFLICT (owner_id, member_id) 
  DO UPDATE SET role = EXCLUDED.role, client_id = EXCLUDED.client_id;
  
  RETURN TRUE;
END;
$$;
