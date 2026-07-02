import { Client } from './client.model';

export interface Project {
  id: number;
  client_id: number;
  user_id: number;
  name: string;
  code: string;
  type: string;
  status: string;
  phase: string;
  area?: number;
  location?: string;
  budget?: number;
  start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  progress: number;
  description?: string;
  team_members?: number[];
  created_at: string;
  updated_at: string;
  client?: Client; // Relação
}