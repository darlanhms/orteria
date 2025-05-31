import { createFileRoute } from '@tanstack/react-router';
import { ScoreForm } from '../components/ScoreForm/ScoreForm';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ScoreForm />;
}
