'use client';

import React, { useState } from 'react';

interface Invitation {
  id: string;
  recipient_name: string;
  recipient_role: string;
  engagement_context: string;
  token: string;
  status: string;
  created_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

export const InvitationsList: React.FC<{ invitations: Invitation[] }> = ({ invitations }) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyLink = async (token: string) => {
    const baseUrl = window.location.origin;
    await navigator.clipboard.writeText(`${baseUrl}/references/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (invitations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        No invitations yet.{' '}
        <a href="/admin/testimonials/invitations/new" className="text-accent hover:underline">
          Create the first one.
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-foreground">Recipient</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Engagement</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Date Sent</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {invitations.map((inv) => (
            <tr key={inv.id} className="transition-colors hover:bg-muted/50">
              <td className="px-4 py-3 font-medium text-foreground">{inv.recipient_name}</td>
              <td className="px-4 py-3 capitalize text-muted-foreground">{inv.recipient_role}</td>
              <td className="max-w-xs px-4 py-3 text-muted-foreground">
                <span className="line-clamp-2">{inv.engagement_context}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(inv.created_at).toLocaleDateString('de-DE')}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[inv.status] ?? 'bg-gray-100 text-gray-800'}`}
                >
                  {inv.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => copyLink(inv.token)}
                  className="rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {copiedToken === inv.token ? 'Copied!' : 'Copy Link'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
