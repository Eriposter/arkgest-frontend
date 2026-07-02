export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  status: 'active' | 'inactive' | 'prospect';
  birthday?: string;
  notes?: string;
  nif?: string;
  bi?: string;
  passport?: string;
  profession?: string;
  client_type?: 'fisica' | 'empresa' | 'estado' | 'ong' | 'cooperativa';
  created_at: string;
  updated_at: string;
}