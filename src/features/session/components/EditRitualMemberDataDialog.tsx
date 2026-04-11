import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useConvexMutation } from "@convex-dev/react-query"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Id } from "~convex/_generated/dataModel"
import { api } from "~convex/_generated/api"

export interface EditRitualMemberDataDialogProps {
  readonly open: boolean
  readonly ritualId: Id<"rituals">
  readonly initialMemberName: string
  readonly memberId?: Id<"ritualMembers">
  readonly canManageReadOnly?: boolean
  readonly canVote?: boolean
  readonly onOpenChange: (open: boolean) => void
}

const editRitualMemberDataSchema = z.object({
  memberName: z.string().trim().min(1, "Informe seu nome no ritual"),
  participationMode: z.enum(["VOTER", "READONLY"]),
})

type EditRitualMemberDataValues = z.infer<typeof editRitualMemberDataSchema>

export function EditRitualMemberDataDialog({
  open,
  ritualId,
  initialMemberName,
  memberId,
  canManageReadOnly = false,
  canVote = true,
  onOpenChange,
}: EditRitualMemberDataDialogProps) {
  const form = useForm<EditRitualMemberDataValues>({
    resolver: zodResolver(editRitualMemberDataSchema),
    mode: "onChange",
    defaultValues: {
      memberName: initialMemberName,
      participationMode: canVote ? "VOTER" : "READONLY",
    },
  })

  const updateMyRitualMemberData = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.updateMyRitualMemberData),
  })
  const manageRitualMember = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.manageRitualMember),
    onSuccess: () => {
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        memberName: initialMemberName,
        participationMode: canVote ? "VOTER" : "READONLY",
      })
      updateMyRitualMemberData.reset()
      manageRitualMember.reset()
    }
  }, [open, initialMemberName, canVote, form])

  async function onSubmit(values: EditRitualMemberDataValues) {
    updateMyRitualMemberData.reset()
    manageRitualMember.reset()
    try {
      const trimmedCurrentName = initialMemberName.trim()
      const trimmedNextName = values.memberName.trim()
      if (trimmedNextName !== trimmedCurrentName) {
        await updateMyRitualMemberData.mutateAsync({
          ritualId,
          memberName: values.memberName,
        })
      }

      const nextCanVote = values.participationMode === "VOTER"
      if (canManageReadOnly && memberId && nextCanVote !== canVote) {
        await manageRitualMember.mutateAsync({
          ritualId,
          memberId,
          action: nextCanVote ? "SET_CAN_VOTE" : "SET_READONLY",
        })
      }

      onOpenChange(false)
    } catch {
      // errors are surfaced by mutation states below
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          updateMyRitualMemberData.reset()
          manageRitualMember.reset()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar dados do membro</DialogTitle>
          <DialogDescription>
            Atualize seus dados neste ritual.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="memberName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome no ritual</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome no ritual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {canManageReadOnly && (
              <FormField
                control={form.control}
                name="participationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modo de participação</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          variant={field.value === "VOTER" ? "default" : "outline"}
                          onClick={() => form.setValue("participationMode", "VOTER", { shouldDirty: true })}
                        >
                          Pode votar
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "READONLY" ? "default" : "outline"}
                          onClick={() =>
                            form.setValue("participationMode", "READONLY", { shouldDirty: true })
                          }
                        >
                          Somente leitura
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {updateMyRitualMemberData.error && (
              <p className="text-sm text-destructive">{updateMyRitualMemberData.error.message}</p>
            )}
            {manageRitualMember.error && (
              <p className="text-sm text-destructive">{manageRitualMember.error.message}</p>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  updateMyRitualMemberData.isPending ||
                  manageRitualMember.isPending ||
                  !form.formState.isValid
                }
              >
                {updateMyRitualMemberData.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
