import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { NewInvitationForm } from './new-invitation-form';

const NewInvitationPage = async () => {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin/testimonials/invitations/new');
  }

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
              New Testimonial Invitation
            </Heading>
            <p className="text-muted-foreground">
              Generate a personalized, token-based invitation link to send manually.
            </p>
          </div>
          <Button href="/admin/testimonials/invitations" variant="secondary">
            Back to Invitations
          </Button>
        </div>
        <div className="max-w-2xl">
          <NewInvitationForm />
        </div>
      </Container>
    </main>
  );
};

export default NewInvitationPage;
