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

const GUARD_LINES = [
  "You have a problem this size 🤏... I have one THIS size 🙌",
  "You speak as if I don't work. I had to explain myself to my HUSBAND last night.",
  "Careful what you say in here. Everything can be... reinterpreted.",
  "I tried to free you. Upper management said no.",
  "WORTHLESS! ALL OF YOU! MOVE FASTER!",
  "Back to work! The complaints don't file themselves!",
];

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % GUARD_LINES.length);
    }, 4000);
    return () => clearInterval(interval);
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
      <div className="banner">
        <img src="/images/dashboard-banner.png" alt="A prison warden shouting through a megaphone" className="banner-bg" />
        <div className="speech-bubble">
          <p>{GUARD_LINES[lineIndex]}</p>
        </div>
      </div>

      <a href="/" className="btn btn-secondary nav-link">← File a Complaint</a>

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
        .banner {
          position: relative;
          width: 100%;
          aspect-ratio: 2.4 / 1;
          max-height: 420px;
          overflow: hidden;
        }
        .banner-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          image-rendering: pixelated;
        }
        .speech-bubble {
          position: absolute;
          top: 8%;
          left: 4%;
          max-width: 42%;
          background: rgba(18, 13, 22, 0.88);
          border: 1px solid var(--border-accent);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          transition: opacity 0.3s ease;
        }
        .speech-bubble p {
          margin: 0;
          font-size: clamp(0.75rem, 1.5vw, 0.95rem);
          line-height: 1.4;
          color: var(--text);
        }
        .btn {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          padding: 0.55rem 1rem;
          border-radius: 6px;
          border: 1px solid var(--border);
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .btn-secondary {
          background: transparent;
          color: var(--text);
        }
        .nav-link {
          display: block;
          text-align: center;
          margin: 1rem auto;
          width: fit-content;
        }
        .board-wrap {
          width: 100%;
          margin: 0 auto;
          padding: 2rem 2vw 4rem;
        }
        .board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
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

        @media (max-width: 800px) {
          .board {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
