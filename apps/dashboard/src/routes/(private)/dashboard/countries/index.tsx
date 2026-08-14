import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/dashboard/countries/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/dashboard/countries/"!</div>
}
