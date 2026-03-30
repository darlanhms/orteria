import { zodResolver } from "@hookform/resolvers/zod"
import { useConvexMutation } from "@convex-dev/react-query"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Id } from "~convex/_generated/dataModel"
import { api } from "~convex/_generated/api"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const createSessionSchema = z.object({
  sessionName: z.string().trim().min(1, "Informe o nome da sessão"),
})

export type CreateSessionFormValues = z.infer<typeof createSessionSchema>

export interface NewVotingSessionModalProps {
  readonly open: boolean
  readonly ritualId: Id<"rituals">
  readonly onOpenChange: (open: boolean) => void
  readonly onSessionCreated?: () => void
}

export function NewVotingSessionModal({
  open,
  ritualId,
  onOpenChange,
  onSessionCreated,
}: NewVotingSessionModalProps) {
  const createSessionMutation = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.createVotingSessionFromTitle),
    onSuccess: () => {
      reset()
      onOpenChange(false)
      onSessionCreated?.()
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateSessionFormValues>({
    resolver: zodResolver(createSessionSchema),
    mode: "onChange",
    defaultValues: {
      sessionName: "",
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
      createSessionMutation.reset()
    }
  }, [open, reset, createSessionMutation])

  function onCreateSession(values: CreateSessionFormValues) {
    createSessionMutation.reset()
    createSessionMutation.mutate({
      ritualId,
      sessionName: values.sessionName,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Sessão de Votação</DialogTitle>
          <DialogDescription>
            Defina o nome da sessão atual para iniciar uma nova rodada de votos.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onCreateSession)}>
          <div className="space-y-2">
            <Label htmlFor="sessionName">Nome da Sessão</Label>
            <Input
              id="sessionName"
              placeholder="Ex: API de pagamentos - estimativa"
              {...register("sessionName")}
            />
            {errors.sessionName && (
              <p className="text-sm text-destructive">{errors.sessionName.message}</p>
            )}
          </div>

          {createSessionMutation.error && (
            <p className="text-sm text-destructive">{createSessionMutation.error.message}</p>
          )}

          <DialogFooter className="mx-0 mb-0 px-0 pb-0 border-0 bg-transparent">
            <Button
              type="submit"
              disabled={!isValid || createSessionMutation.isPending}
              className="w-full"
            >
              {createSessionMutation.isPending ? "Criando..." : "Criar sessão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
