import { Project } from './project.model';
import { User } from './user.model';

export interface Task {
  id: number;
  project_id: number;
  assigned_to?: number;
  created_by: number;
  title: string;
  description?: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_progresso' | 'revisao' | 'concluida' | 'cancelada';
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress: number;
  parent_task_id?: number;
  created_at: string;
  updated_at: string;
  project?: Project;
  assignee?: User;
}