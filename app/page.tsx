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
      <h1>The Kingdom&apos;s Complaints Office</h1>
      <p className="subtitle">File your grievance. A clerk will (eventually) attend to it.</p>

      {status === 'sent' ? (
        <div className="confirmation">
          <p>Your complaint has been formally registered.</p>
          <button onClick={() => setStatus('idle')}>File another complaint</button>
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

          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Submitting to the Court...' : 'Submit Complaint'}
          </button>

          {status === 'error' && (
            <p className="error">Something went wrong. The Court apologizes.</p>
          )}
        </form>
      )}

      <style jsx>{`
        .page {
          max-width: 640px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
          font-family: Georgia, serif;
        }
        h1 {
          margin-bottom: 0.25rem;
        }
        .subtitle {
          color: #666;
          margin-bottom: 2rem;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-weight: 600;
        }
        input,
        textarea {
          font-family: inherit;
          font-size: 1rem;
          padding: 0.6rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          background: #6b3f1d;
          color: white;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .confirmation {
          text-align: center;
        }
        .error {
          color: #b00020;
        }
      `}</style>
    </main>
  );
}
