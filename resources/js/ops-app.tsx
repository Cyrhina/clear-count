import { createInertiaApp } from '@inertiajs/react'
import OpsPage from '@ops/OpsPage'

void createInertiaApp({
  title: (title) => (title ? `${title} - FBS OPS` : 'FBS OPS'),
  resolve: () => OpsPage,
  strictMode: true,
  progress: { color: '#1f6f5f' },
})
