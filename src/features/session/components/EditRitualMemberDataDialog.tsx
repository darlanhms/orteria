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
  readonly onOpenChange: (open: boolean) => void
}

const editRitualMemberDataSchema = z.object({
  memberName: z.string().trim().min(1, "Informe seu nome no ritual"),
})

type EditRitualMemberDataValues = z.infer<typeof editRitualMemberDataSchema>

export function EditRitualMemberDataDialog({
  open,
  ritualId,
  initialMemberName,
  onOpenChange,
}: EditRitualMemberDataDialogProps) {
  const form = useForm<EditRitualMemberDataValues>({
    resolver: zodResolver(editRitualMemberDataSchema),
    mode: "onChange",
    defaultValues: {
      memberName: initialMemberName,
    },
  })

  const updateMyRitualMemberData = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.updateMyRitualMemberData),
    onSuccess: () => {
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({ memberName: initialMemberName })
      updateMyRitualMemberData.reset()
    }
  }, [open, initialMemberName, form])

  function onSubmit(values: EditRitualMemberDataValues) {
    updateMyRitualMemberData.reset()
    updateMyRitualMemberData.mutate({
      ritualId,
      memberName: values.memberName,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          updateMyRitualMemberData.reset()
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

            {updateMyRitualMemberData.error && (
              <p className="text-sm text-destructive">{updateMyRitualMemberData.error.message}</p>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={updateMyRitualMemberData.isPending || !form.formState.isValid}
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
