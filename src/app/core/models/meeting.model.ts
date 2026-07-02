import { Project } from './project.model';
import { User } from './user.model';

export interface Meeting {
  id: number;
  project_id?: number;
  user_id: number;
  title: string;
  description?: string;
  type: 'reuniao_cliente' | 'visita_obra' | 'reuniao_equipa' | 'apresentacao' | 'outro';
  start_time: string;
  end_time: string;
  location?: string;
  meeting_link?: string;
  participants?: number[];
  status: 'agendada' | 'confirmada' | 'cancelada' | 'concluida';
  created_at: string;
  updated_at: string;
  project?: Project;
  organizer?: User;
}