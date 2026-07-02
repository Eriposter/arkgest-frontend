import { Project } from './project.model';

export interface Document {
  id: number;
  project_id: number;
  file_name: string;
  file_path: string;
  file_url?: string;
  file_size: number;
  mime_type: string;
  category?: string;
  description?: string;
  uploaded_by: number;
  created_at: string;
  project?: Project;
}