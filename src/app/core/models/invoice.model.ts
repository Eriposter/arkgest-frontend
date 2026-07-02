import { Project } from './project.model';
import { Client } from './client.model';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: number;
  project_id: number;
  client_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  items?: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
  client?: Client;
}