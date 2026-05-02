CREATE OR REPLACE FUNCTION get_conversations(
  viewer_id UUID,
  limit_val INTEGER DEFAULT 20,
  offset_val INTEGER DEFAULT 0
)
RETURNS TABLE (
  peer_id UUID,
  peer_name TEXT,
  peer_avatar_url TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  WITH last_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN sender_id = viewer_id THEN receiver_id 
        ELSE sender_id 
      END
    )
      id,
      CASE 
        WHEN sender_id = viewer_id THEN receiver_id 
        ELSE sender_id 
      END as peer_id,
      content,
      created_at
    FROM direct_messages
    WHERE sender_id = viewer_id OR receiver_id = viewer_id
    ORDER BY 
      CASE 
        WHEN sender_id = viewer_id THEN receiver_id 
        ELSE sender_id 
      END,
      created_at DESC
  ),
  unread_counts AS (
    SELECT 
      sender_id as peer_id,
      COUNT(*) as count
    FROM direct_messages
    WHERE receiver_id = viewer_id AND is_read = false
    GROUP BY sender_id
  )
  SELECT 
    lm.peer_id,
    p.name as peer_name,
    p.avatar_url as peer_avatar_url,
    lm.content as last_message,
    lm.created_at as last_message_at,
    COALESCE(uc.count, 0) as unread_count
  FROM last_messages lm
  JOIN profiles p ON p.id = lm.peer_id
  LEFT JOIN unread_counts uc ON uc.peer_id = lm.peer_id
  ORDER BY lm.created_at DESC
  LIMIT limit_val
  OFFSET offset_val;
END;
$$;