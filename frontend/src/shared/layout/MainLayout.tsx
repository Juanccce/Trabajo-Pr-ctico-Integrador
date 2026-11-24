import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

export function MainLayout({ children }: { children: ReactNode }) {
  return <><Navbar /><main className="page-shell">{children}</main><footer className="footer"><span>Food Store</span><span>Hecho para disfrutar, pedido a pedido.</span></footer></>
}
