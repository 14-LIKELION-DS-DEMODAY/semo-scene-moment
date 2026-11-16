import type { ReactNode } from 'react'

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col bg-white">
      {children}
    </div>
  )
}
