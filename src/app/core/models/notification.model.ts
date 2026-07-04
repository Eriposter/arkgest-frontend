export interface Notification {
  id: string;
  type: string; // 'task', 'invoice', 'system'
  title: string;
  message: string;
  link: string;
  icon: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
}