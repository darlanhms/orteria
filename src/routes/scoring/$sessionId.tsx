import { createFileRoute, useLocation } from '@tanstack/react-router';
import { ScoringSessionProvider, useScoringSession } from '../../hooks/useScoringSession';
import { UserForm } from '../../components/UserForm/UserForm';

export const Route = createFileRoute('/scoring/$sessionId')({
  component: RouteComponent,
});

function ScoringContent() {
  const { scoringSession, isLoadingSession, currentUserId, addUser } = useScoringSession();

  if (isLoadingSession) {
    return <div>Loading...</div>;
  }

  if (!currentUserId) {
    return (
      <UserForm
        onSubmit={data =>
          addUser({
            ...data,
            id: crypto.randomUUID(),
          })
        }
      />
    );
  }

  return <div>{scoringSession?.users.map(user => user.name).join(', ')}</div>;
}

function RouteComponent() {
  const { sessionId } = Route.useParams();
  const state = useLocation({
    select: location => location.state,
  });

  return (
    <ScoringSessionProvider sessionId={sessionId} newScoringSession={state.newScoringSession}>
      <ScoringContent />
    </ScoringSessionProvider>
  );
}
