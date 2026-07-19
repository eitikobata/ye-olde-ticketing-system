export type TicketStatus = 'to_do' | 'investigating' | 'done';
export type TicketUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface Category {
  id: number;
  slug: string;
  label: string;
}

export interface Ticket {
  id: string;
  category_id: number | null;
  title: string;
  description: string;
  submitter_name: string;
  submitter_email: string | null;
  urgency: TicketUrgency;
  status: TicketStatus;
  sla_deadline: string | null;
  fake_wait_years: number | null;
  created_at: string;
  resolved_at: string | null;
}
