// client.model.ts
import { Invoice } from "./invoice.model";

export interface Project {
  id: number;
  name: string;
  status: string;
  created_at: string;
  // ... other project properties
}

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
  invoice: Invoice[];
  projects?: Project[]; // Add projects
  invoices?: Invoice[]; // Add invoices
}

// Or create a separate interface for details
export interface ClientDetails {
  client: Client;
  stats?: {
    total_projects: number;
    active_projects: number;
    total_billed: number;
    total_pending: number;
  };
  projects?: Project[];
  invoices?: Invoice[];
}