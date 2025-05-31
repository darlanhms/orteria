import { FormProvider, useForm } from 'react-hook-form';
import { ControlledInput } from '../form/ControlledInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { z } from 'zod';

export const EnterExistingScoringSessionForm: React.FC = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(
      z.object({
        sessionId: z.string(),
      }),
    ),
    defaultValues: {
      sessionId: '',
    },
  });

  const handleSubmit = (data: { sessionId: string }) => {
    router.navigate({
      to: '/scoring/$sessionId',
      params: {
        sessionId: data.sessionId,
      },
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Entrar em uma pontuação</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <ControlledInput name="sessionId" placeholder="Código da sessão" />
            <Button type="submit">Entrar</Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};
