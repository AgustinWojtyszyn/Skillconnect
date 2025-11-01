-- Habilitar políticas para friend_requests (SELECT/INSERT/UPDATE/DELETE)
-- Permitir leer solicitudes donde participa el usuario (como emisor o receptor)
DROP POLICY IF EXISTS "select_own_requests" ON friend_requests;
CREATE POLICY "select_own_requests" ON friend_requests
  FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Permitir crear solicitud donde el emisor es el usuario
DROP POLICY IF EXISTS "insert_own_requests" ON friend_requests;
CREATE POLICY "insert_own_requests" ON friend_requests
  FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Permitir actualizar estado (aceptar/rechazar) cuando el receptor es el usuario
DROP POLICY IF EXISTS "update_as_recipient" ON friend_requests;
CREATE POLICY "update_as_recipient" ON friend_requests
  FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- (Opcional) Permitir cancelar solicitud pendiente por el emisor
DROP POLICY IF EXISTS "delete_own_pending_request" ON friend_requests;
CREATE POLICY "delete_own_pending_request" ON friend_requests
  FOR DELETE
  USING (sender_id = auth.uid() AND status = 'pending');
