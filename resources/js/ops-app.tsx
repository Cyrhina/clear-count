import { createInertiaApp } from '@inertiajs/react'
import OpsPage from '@ops/OpsPage'

void createInertiaApp({
  title: (title) => (title ? `${title} - Clear Count` : 'Clear Count'),
  resolve: () => OpsPage,
  strictMode: true,
  progress: { color: '#1e3765' },
})
