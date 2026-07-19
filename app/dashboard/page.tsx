'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Ticket, TicketStatus, TicketUrgency } from '@/lib/types';

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'to_do', label: 'To Do' },
  { status: 'investigating', label: 'Investigating' },
  { status: 'done', label: 'Done' },
];

const URGENCY_SEAL: Record<TicketUrgency, string> = {
  low: 'C',
  medium: 'R',
  high: 'L',
  critical: 'X',
};

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

    const channel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        loadTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <main className="page">
        <p className="status">Loading the Court&apos;s ledger...</p>
        <style jsx>{`
          .page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .status {
            color: var(--text-muted);
            font-family: var(--font-mono);
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="shop-header">
        <p className="eyebrow">scrumban ledger</p>
        <h1>The Kingdom&apos;s Complaints Office</h1>
      </header>

      <div className="board-wrap">
        <div className="board">
          {COLUMNS.map((col) => {
            const columnTickets = tickets.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="column">
                <h2>
                  {col.label} <span className="count">({columnTickets.length})</span>
                </h2>
                {columnTickets.map((ticket) => (
                  <div key={ticket.id} className="card">
                    <span className={`seal seal--${ticket.urgency}`}>
                      {URGENCY_SEAL[ticket.urgency]}
                    </span>
                    <p className="card-name">{ticket.title}</p>
                    <p className="card-effect">{ticket.description}</p>
                    <div className="meta">
                      <span>{ticket.submitter_name}</span>
                      <span className={`urgency-label urgency-label--${ticket.urgency}`}>
                        {ticket.urgency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
        }
        .shop-header {
          text-align: center;
          padding: 1.75rem 1.5rem 1rem;
          border-bottom: 1px solid var(--border);
        }
        .eyebrow {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 0.75rem;
        }
        .shop-header h1 {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          margin: 0;
          color: var(--accent);
        }
        .board-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }
        .board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .column {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1rem;
        }
        .column h2 {
          font-family: var(--font-display);
          font-size: 1.05rem;
          margin: 0 0 0.5rem;
          color: var(--text);
        }
        .count {
          color: var(--text-muted);
          font-weight: normal;
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }
        .card {
          position: relative;
          background: var(--bg-card-hover);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 1.25rem 1rem 1rem;
          margin-top: 0.75rem;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          background: var(--bg-card-selected);
        }
        .seal {
          position: absolute;
          top: -10px;
          right: 12px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1b1420;
          transform: rotate(-8deg);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
        }
        .seal--low { background: var(--urgency-low); }
        .seal--medium { background: var(--urgency-medium); }
        .seal--high { background: var(--urgency-high); }
        .seal--critical { background: var(--urgency-critical); color: #f2e9e4; }
        .card-name {
          font-family: var(--font-display);
          font-size: 1rem;
          margin: 0.25rem 0 0.5rem;
          color: var(--text);
        }
        .card-effect {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0 0 0.75rem;
          line-height: 1.4;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .urgency-label {
          text-transform: uppercase;
          font-weight: 600;
        }
        .urgency-label--low { color: var(--urgency-low); }
        .urgency-label--medium { color: var(--urgency-medium); }
        .urgency-label--high { color: var(--urgency-high); }
        .urgency-label--critical { color: var(--urgency-critical); }
      `}</style>
    </main>
  );
}