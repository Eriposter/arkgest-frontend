export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  avatar?: string;
  avatar_url?: string;
  role?: string; // ← Mantém opcional
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  last_login_at?: string;
  
  // ✅ Novas propriedades (contadores)
  projects_count?: number;
  tasks_count?: number;
  meetings_count?: number;
}

export interface Role {
  name: string;
  permissions: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  message?: string;
}