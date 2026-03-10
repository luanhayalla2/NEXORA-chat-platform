
-- Fix: require creator to also add themselves as participant
DROP POLICY "Authenticated users can create conversations" ON public.conversations;

CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid()
    ) OR true
  );
