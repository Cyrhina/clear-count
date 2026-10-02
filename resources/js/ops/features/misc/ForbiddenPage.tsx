import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@ops/components/ui/Button'
import { EmptyState } from '@ops/components/ui/EmptyState'

export function ForbiddenPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        description="Your current role doesn't include this capability. Switch roles from the demo switcher in the topbar to preview it."
        action={
          <Button asChild size="sm" variant="secondary">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
