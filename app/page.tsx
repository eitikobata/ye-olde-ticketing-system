'use client';

import { useState, FormEvent } from 'react';

export default function ComplaintFormPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          submitter_name: submitterName,
          submitter_email: submitterEmail || null,
        }),
      });

      if (!response.ok) throw new Error('Request failed');

      setStatus('sent');
      setTitle('');
      setDescription('');
      setSubmitterName('');
      setSubmitterEmail('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <main className="page">
      <header className="shop-header">
        <p className="eyebrow">est. by royal decree, mostly ignored since</p>
        <h1>The Kingdom&apos;s Complaints Office</h1>
        <p className="tagline">File your grievance. A clerk will (eventually) attend to it.</p>
        <a href="/dashboard" className="btn btn-secondary nav-link">View the Ledger →</a>
      </header>

      <div className="form-wrap">
        {status === 'sent' ? (
          <div className="confirmation">
            <p>Your complaint has been formally registered.</p>
            <button className="btn btn-primary" onClick={() => setStatus('idle')}>
              File another complaint
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Your name
              <input
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                required
              />
            </label>

            <label>
              Your email (optional, for the confirmation scroll)
              <input
                type="email"
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
              />
            </label>

            <label>
              Complaint title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label>
              Describe your grievance in full
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </label>

            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Submitting to the Court...' : 'Submit Complaint'}
            </button>

            {status === 'error' && (
              <p className="error">Something went wrong. The Court apologizes.</p>
            )}
          </form>
        )}
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
          margin: 0 0 0.5rem;
          color: var(--accent);
        }
        .tagline {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.95rem;
        }
        .form-wrap {
          max-width: 560px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 4rem;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        input,
        textarea {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          padding: 0.65rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
        }
        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--border-accent);
        }
        .btn {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          border: 1px solid var(--border);
          cursor: pointer;
          background: transparent;
          color: var(--text);
          transition: transform 0.15s ease;
        }
        .btn:not(:disabled):hover {
          transform: translateY(-1px);
        }
        .btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .btn-primary {
          background: var(--accent);
          color: #1b1420;
          border-color: var(--accent);
          font-weight: 600;
        }
        .confirmation {
          text-align: center;
          color: var(--text-muted);
        }
        .confirmation p {
          margin-bottom: 1.5rem;
        }
        .nav-link {
          display: inline-block;
          margin-top: 0.75rem;
          text-decoration: none;
        }  
        .error {
          color: var(--urgency-critical);
          font-size: 0.85rem;
        }
      `}</style>
    </main>
  );
}
