export type Profile = {
  id: string
  fb_profile_link: string | null
  display_name: string | null
  points: number
  referral_code: string | null
  referred_by: string | null
  created_at: string
}
 
export type TaskType = 'view' | 'follow' | 'comment'
export type TaskStatus = 'active' | 'completed' | 'paused'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'
 
export type Task = {
  id: string
  owner_id: string
  content_link: string
  task_type: TaskType
  points_per_action: number
  total_needed: number
  total_completed: number
  status: TaskStatus
  created_at: string
}
 
export type Submission = {
  id: string
  task_id: string
  user_id: string
  screenshot_url: string | null
  timer_completed: boolean
  status: SubmissionStatus
  created_at: string
}
 
export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  view: 'ভিউ',
  follow: 'ফলো',
  comment: 'কমেন্ট',
}
 
export const TASK_TYPE_ICON: Record<TaskType, string> = {
  view: '📺',
  follow: '➕',
  comment: '💬',
}
 
export const TASK_REWARD: Record<TaskType, number> = {
  view: 2,
  follow: 3,
  comment: 4,
}
 
