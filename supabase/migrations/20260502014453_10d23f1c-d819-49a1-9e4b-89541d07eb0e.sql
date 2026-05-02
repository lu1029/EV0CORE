-- Revoke public execution
REVOKE EXECUTE ON FUNCTION get_conversations(UUID, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_conversations(UUID, INTEGER, INTEGER) FROM anon;

-- Grant to authenticated
GRANT EXECUTE ON FUNCTION get_conversations(UUID, INTEGER, INTEGER) TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_receiver ON direct_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_sender ON direct_messages(receiver_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_unread ON direct_messages(receiver_id) WHERE is_read = false;
