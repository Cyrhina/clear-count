import { createInertiaApp } from '@inertiajs/react'
import OpsPage from '@ops/OpsPage'

void createInertiaApp({
  title: (title) => (title ? `${title} - FBS Pay` : 'FBS Pay'),
  resolve: () => OpsPage,
  strictMode: true,
  progress: { color: '#2d9450' },
})
