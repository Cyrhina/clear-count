import { useToast } from '@ops/components/ui/Toast'
import { apiErrorMessage } from '@ops/lib/api/http'

/** Runs a save of one employee section: success toast and `onSaved()`, or the server's message as an error toast. */
export function useSectionSave(onSaved: () => void) {
  const { notify } = useToast()

  return async (save: () => Promise<unknown>, success: string, description?: string) => {
    try {
      await save()
    } catch (error) {
      return notify({ title: "Couldn't save the changes", description: apiErrorMessage(error), tone: 'danger' })
    }
    notify({ title: success, description, tone: 'success' })
    onSaved()
  }
}
