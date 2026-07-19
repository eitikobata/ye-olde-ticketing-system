'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Ticket, TicketStatus } from '@/lib/types';

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'to_do', label: 'To Do' },
  { status: 'investigating', label: 'Investigating' },
  { status: 'done', label: 'Done' },
];

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setTickets(data as Ticket[]);
      }
      setLoading(false);
    }

    loadTickets();

    // Realtime subscription: any insert/update/delete on tickets refreshes the board
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          loadTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <main className="page">Loading the Court&apos;s ledger...</main>;

  return (
    <main className="page">
      <h1>Scrumban Board — The Kingdom&apos;s Complaints Office</h1>

      <div className="board">
        {COLUMNS.map((col) => {
          const columnTickets = tickets.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="column">
              <h2>
                {col.label} <span className="count">({columnTickets.length})</span>
              </h2>
              {columnTickets.map((ticket) => (
                <div key={ticket.id} className={`card urgency-${ticket.urgency}`}>
                  <strong>{ticket.title}</strong>
                  <p>{ticket.description}</p>
                  <div className="meta">
                    <span>{ticket.submitter_name}</span>
                    <span className="badge">{ticket.urgency}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          font-family: Georgia, serif;
        }
        .board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .column {
          background: #f4f1ea;
          border-radius: 8px;
          padding: 1rem;
        }
        .count {
          color: #888;
          font-weight: normal;
        }
        .card {
          background: white;
          border-radius: 6px;
          padding: 0.75rem;
          margin-top: 0.75rem;
          border-left: 4px solid #999;
        }
        .card p {
          font-size: 0.9rem;
          color: #555;
          margin: 0.4rem 0;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #777;
        }
        .badge {
          text-transform: uppercase;
          font-weight: 600;
        }
        .urgency-critical {
          border-left-color: #b00020;
        }
        .urgency-high {
          border-left-color: #e07b00;
        }
        .urgency-medium {
          border-left-color: #d4a017;
        }
        .urgency-low {
          border-left-color: #4a7a4a;
        }
      `}</style>
    </main>
  );
}
