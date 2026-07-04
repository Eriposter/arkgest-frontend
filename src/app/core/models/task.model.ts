import { Project } from './project.model';
import { User } from './user.model';

export interface Subtask {
  id?: number;
  task_id?: number;
  title: string;
  description?: string;
  is_completed: boolean;
  assigned_to?: number;
  assigned_to_user?: User;
  order?: number;
}

export interface Collaborator {
  id: number;
  name: string;
  email: string;
  pivot: {
    role: 'colaborador' | 'revisor' | 'observador';
  };
}

export interface Task {
  id: number;
  project_id: number;
  assigned_to?: number;
  created_by?: number;
  title: string;
  description?: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_progresso' | 'revisao' | 'concluida' | 'cancelada';
  due_date?: string;
  estimated_hours?: number;
  progress: number;
  created_at: string;
  updated_at: string;
  project?: Project;
  assignee?: User;
  creator?: User;
  subtasks?: Subtask[];
  collaborators?: Collaborator[];
}