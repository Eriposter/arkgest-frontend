export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  avatar_url?: string;
  role?: string; // ← GARANTIR QUE ESTE CAMPO EXISTE
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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