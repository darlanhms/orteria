import { zodResolver } from "@hookform/resolvers/zod"
import { useConvexMutation } from "@convex-dev/react-query"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Id } from "~convex/_generated/dataModel"
import { api } from "~convex/_generated/api"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const createSessionSchema = z.object({
  sessionName: z.string().trim().min(1, "Informe o nome da sessão"),
  externalUrl: z
    .string()
    .trim()
    .max(2048, "A URL deve ter no máximo 2048 caracteres")
    .optional()
    .refine((value) => {
      if (!value) return true
      try {
        const parsed = new URL(value)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
      } catch {
        return false
      }
    }, "Informe uma URL válida (http/https)"),
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
      form.reset()
      onOpenChange(false)
      onSessionCreated?.()
    },
  })

  const form = useForm<CreateSessionFormValues>({
    resolver: zodResolver(createSessionSchema),
    mode: "onChange",
    defaultValues: {
      sessionName: "",
      externalUrl: "",
    },
  })

  function onCreateSession(values: CreateSessionFormValues) {
    createSessionMutation.reset()
    createSessionMutation.mutate({
      ritualId,
      sessionName: values.sessionName,
      externalUrl: values.externalUrl?.trim() ? values.externalUrl.trim() : undefined,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          form.reset()
          createSessionMutation.reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-xl border border-primary/20 bg-card/95 px-6 py-6 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            Nova Sessão de Votação
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6 pt-2" onSubmit={form.handleSubmit(onCreateSession)}>
            <FormField
              control={form.control}
              name="sessionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Sessão</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: API de pagamentos - estimativa"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Dica: use algo curto e objetivo para facilitar a leitura durante a votação.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="externalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL externa (ClickUp/Jira)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://app.clickup.com/t/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional. Facilita os votantes a encontrarem o item da sessão.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {createSessionMutation.error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {createSessionMutation.error.message}
              </div>
            )}

            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent px-0 pb-0 pt-1">
              <Button
                type="submit"
                disabled={!form.formState.isValid || createSessionMutation.isPending}
                className="h-12 w-full text-base font-bold"
              >
                {createSessionMutation.isPending ? "Criando..." : "Criar sessão"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
