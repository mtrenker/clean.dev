'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';

interface InvitationResult {
  invitation: {
    id: string;
    recipient_name: string;
    recipient_role: string;
    engagement_context: string;
    token: string;
    status: string;
  };
  link: string;
}

export const NewInvitationForm: React.FC = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvitationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch('/api/testimonials/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: data.get('recipientName'),
          recipientRole: data.get('recipientRole'),
          engagementContext: data.get('engagementContext'),
        }),
      });

      if (!response.ok) {
        const json = await response.json() as { error?: string };
        setError(json.error ?? 'Failed to create invitation');
        return;
      }

      const json = await response.json() as InvitationResult;
      setResult(json);
      form.reset();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.link) return;
    await navigator.clipboard.writeText(result.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Recipient Name" htmlFor="recipientName" required>
            <Input
              id="recipientName"
              name="recipientName"
              type="text"
              placeholder="Jane Smith"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField label="Role / Relationship" htmlFor="recipientRole" required>
            <Select id="recipientRole" name="recipientRole" required disabled={isPending}>
              <option value="">Select a role</option>
              <option value="client">Client</option>
              <option value="manager">Manager</option>
              <option value="peer">Peer / Collaborator</option>
            </Select>
          </FormField>

          <FormField label="Engagement Context" htmlFor="engagementContext" required>
            <Textarea
              id="engagementContext"
              name="engagementContext"
              rows={4}
              placeholder="Describe the project or engagement (e.g. 'React migration at Acme Corp, Q3 2024')"
              required
              disabled={isPending}
            />
          </FormField>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? 'Creating...' : 'Generate Invitation Link'}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="border-accent">
          <p className="mb-2 text-sm font-medium text-foreground">
            Invitation created for <strong>{result.invitation.recipient_name}</strong>. Copy the link below and send it manually:
          </p>
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted p-3">
            <code className="flex-1 break-all text-sm text-foreground">{result.link}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};
