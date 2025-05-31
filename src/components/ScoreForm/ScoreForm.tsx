import { FormProvider, useForm } from 'react-hook-form';
import { ControlledInput } from '../form/ControlledInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { scoringSessionSchema, type ScoringSessionRequest } from '../../lib/score';
import { useRouter } from '@tanstack/react-router';

export const ScoreForm: React.FC = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(scoringSessionSchema),
    defaultValues: {
      name: '',
      possibleScores: '',
      ownerName: '',
    },
  });

  const handleSubmit = (data: ScoringSessionRequest) => {
    router.navigate({
      to: '/scoring/$sessionId',
      params: {
        sessionId: crypto.randomUUID(),
      },
      state: {
        newScoringSession: data,
      },
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ControlledInput name="name" placeholder="Nome da sessão" />
        <ControlledInput name="possibleScores" placeholder="Pontuações possíveis" />
        <ControlledInput name="ownerName" placeholder="Seu apelido" />
        <button type="submit">Criar sessão</button>
      </form>
    </FormProvider>
  );
};
