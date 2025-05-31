import { createFileRoute } from '@tanstack/react-router';
import { CreateScoringSessionForm } from '@/components/home/CreateScoringSessionForm';
import { Separator } from '@/components/ui/Separator';
import { EnterExistingScoringSessionForm } from '@/components/home/EnterExistingScoringSessionForm';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <h3 className="text-2xl font-bold text-center">Orteria</h3>
      <div className="flex flex-col justify-evenly flex-1 mx-auto w-lg">
        <h5 className="text-sm text-muted-foreground text-center">Retros e pontuações em um só lugar</h5>
        <div className="space-y-6">
          <CreateScoringSessionForm />
          <div className="flex items-center">
            <div className="basis-2/5">
              <Separator />
            </div>
            <p className="basis-1/5 text-center">OU</p>
            <div className="basis-2/5">
              <Separator />
            </div>
          </div>
          <EnterExistingScoringSessionForm />
        </div>
      </div>
    </div>
  );
}
