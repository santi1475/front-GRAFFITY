import type { Metadata } from "next"
import DefaultLayout from "@/layouts/DefaultLayout"

export const metadata: Metadata = {
  title: {
    template: '%s | Graffity POS',
    default: 'Dashboard | Graffity POS',
  },
  description: 'Sistema de punto de venta Graffity POS',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DefaultLayout>{children}</DefaultLayout>
}
