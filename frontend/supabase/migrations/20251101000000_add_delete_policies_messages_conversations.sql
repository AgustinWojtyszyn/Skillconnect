-- Política para permitir eliminar mensajes propios o de conversaciones donde participo
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE
  USING (
    sender_id = auth.uid() OR
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Política para permitir eliminar conversaciones donde participo
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;
CREATE POLICY "Users can delete their conversations" ON conversations
  FOR DELETE
  USING (user1_id = auth.uid() OR user2_id = auth.uid());
