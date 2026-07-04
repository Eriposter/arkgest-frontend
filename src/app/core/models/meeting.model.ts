import { Project } from './project.model';
import { User } from './user.model';

export interface MeetingParticipant {
  id?: number;
  participant_type: 'user' | 'guest';
  user_id?: number;
  name: string;
  email?: string;
  role: 'organizador' | 'apresentador' | 'participante' | 'convidado';
  status: 'pending' | 'accepted' | 'declined';
  user?: User;
}

export interface Meeting {
  id: number;
  project_id?: number;
  user_id?: number;
  title: string;
  description?: string;
  type: 'reuniao_cliente' | 'visita_obra' | 'reuniao_equipa' | 'apresentacao' | 'outro';
  start_time: string;
  end_time: string;
  location?: string;
  meeting_link?: string;
  status: 'agendada' | 'confirmada' | 'cancelada' | 'concluida';
  project?: Project;
  organizer?: User;
  meetingParticipants?: MeetingParticipant[];
    internal_participants?: any[]; // or User[] if you have a User type
  external_guests?: any[];
  participants_count?: number;
}