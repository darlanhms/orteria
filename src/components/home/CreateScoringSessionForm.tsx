import { FormProvider, useForm } from 'react-hook-form';
import { ControlledInput } from '../form/ControlledInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { scoringSessionSchema, type ScoringSessionRequest } from '../../lib/score';
import { useRouter } from '@tanstack/react-router';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { HammerIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import useDisclosure from '@/hooks/useDisclosure';

const possibleScoresTemplates = ['1, 2, 3, 5, 8, 13, 21, 34, 55, 89', 'RN, PP, P, M, G, GG, XGG'];

export const CreateScoringSessionForm: React.FC = () => {
  const router = useRouter();
  const popoverDisclosure = useDisclosure();

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
        <Card>
          <CardHeader>
            <CardTitle>Inicie uma pontuação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ControlledInput name="name" placeholder="Nome da sessão" />
            <div className="flex gap-2">
              <ControlledInput name="possibleScores" placeholder="Sistema de pontuação" />
              <Popover open={popoverDisclosure.isOpen} onOpenChange={popoverDisclosure.onToggle}>
                <PopoverTrigger asChild>
                  <Button size="icon" className="h-12 w-12" onClick={popoverDisclosure.onOpen}>
                    <HammerIcon className="size-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="space-y-3">
                  {possibleScoresTemplates.map(template => (
                    <Button
                      variant="outline"
                      className="w-full"
                      key={template}
                      onClick={() => {
                        form.setValue('possibleScores', template);
                        popoverDisclosure.onClose();
                      }}
                    >
                      {template}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            <ControlledInput name="ownerName" placeholder="Seu apelido" />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">Criar sessão</Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};
