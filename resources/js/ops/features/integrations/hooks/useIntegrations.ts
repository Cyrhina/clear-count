import { useQuery } from '@tanstack/react-query'
import { getApiKeys, getWebhookDeliveries, getWebhooks } from '@ops/lib/services/integrationService'

export function useApiKeys() {
  const query = useQuery({ queryKey: ['integrations', 'keys'], queryFn: getApiKeys })
  return { apiKeys: query.data ?? [], isLoading: query.isPending, refetch: () => void query.refetch() }
}

export function useWebhooks() {
  const query = useQuery({ queryKey: ['integrations', 'webhooks'], queryFn: getWebhooks })
  return { webhooks: query.data ?? [], isLoading: query.isPending, refetch: () => void query.refetch() }
}

export function useWebhookDeliveries(webhookId: string | null) {
  const query = useQuery({ queryKey: ['integrations', 'deliveries', webhookId], queryFn: () => getWebhookDeliveries(webhookId as string), enabled: webhookId !== null })
  return { deliveries: query.data ?? [], isLoading: query.isPending && webhookId !== null, refetch: () => void query.refetch() }
}
