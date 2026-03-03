-- Add episode history data for the first 20 patients with unique episode numbers
WITH first_20_patients AS (
  SELECT id, first_name, last_name, created_at, 
         row_number() OVER (ORDER BY created_at) as patient_rank
  FROM patients 
  ORDER BY created_at 
  LIMIT 20
),
max_episode_num AS (
  SELECT COALESCE(MAX(CAST(SUBSTR(episode_number, 3) AS INTEGER)), 0) as max_num
  FROM episodes
  WHERE episode_number ~ '^EP\d+$'
),
sample_episodes AS (
  SELECT 
    p.id as patient_id,
    p.first_name,
    p.last_name,
    p.patient_rank,
    episode_seq,
    -- Create multiple episodes per patient (current and historical)
    CASE 
      WHEN episode_seq = 1 THEN 'active'
      ELSE 'completed'
    END as status,
    CASE 
      WHEN episode_seq = 1 THEN CURRENT_DATE - INTERVAL '30 days'
      WHEN episode_seq = 2 THEN CURRENT_DATE - INTERVAL '120 days'
      ELSE CURRENT_DATE - INTERVAL '200 days'
    END as start_date,
    CASE 
      WHEN episode_seq = 1 THEN CURRENT_DATE + INTERVAL '30 days'
      WHEN episode_seq = 2 THEN CURRENT_DATE - INTERVAL '90 days'
      ELSE CURRENT_DATE - INTERVAL '170 days'
    END as end_date,
    'EP' || LPAD((m.max_num + ((p.patient_rank - 1) * 3) + episode_seq)::text, 6, '0') as episode_number,
    CASE 
      WHEN episode_seq = 2 THEN 'Goals met - patient independent'
      WHEN episode_seq = 3 THEN 'Transferred to higher level of care'
      ELSE NULL
    END as discharge_reason
  FROM first_20_patients p
  CROSS JOIN (VALUES (1), (2), (3)) AS t(episode_seq)
  CROSS JOIN max_episode_num m
)
INSERT INTO episodes (patient_id, episode_number, status, start_date, end_date, discharge_reason, primary_nurse_id, coordinator_id)
SELECT 
  patient_id,
  episode_number,
  status,
  start_date,
  end_date,
  discharge_reason,
  (SELECT id FROM profiles WHERE role = 'nurse' ORDER BY created_at LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'nurse' ORDER BY created_at OFFSET 1 LIMIT 1)
FROM sample_episodes
ORDER BY patient_rank, episode_seq;