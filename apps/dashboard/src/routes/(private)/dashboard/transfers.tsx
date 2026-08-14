import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/dashboard/transfers')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/dashboard/transfers"!</div>
}
