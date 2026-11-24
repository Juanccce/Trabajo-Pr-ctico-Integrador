import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CircleUserRound, ShoppingBag, ShoppingBasket, Store } from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export function Navbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.cantidad, 0))
  const navigate = useNavigate()

  async function closeSession() {
    await logout()
    navigate('/')
  }

  return <header className="topbar">
    <div className="topbar-inner">
      <Link to="/" className="brand"><span className="brand-mark"><Store size={19} /></span><span>food<span className="brand-light">store</span></span></Link>
      <nav className="main-nav">
        <NavLink to="/" end>Menú</NavLink>
        {user && <NavLink to="/mis-pedidos">Mis pedidos</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin/resumen">Administración</NavLink>}
      </nav>
      <div className="top-actions">
        <Link className="cart-link" to="/carrito" aria-label={`Carrito, ${count} productos`}><ShoppingBasket size={20} /><span>Carrito</span>{count > 0 && <b>{count}</b>}</Link>
        {user ? <div className="account-menu"><span className="account-name"><CircleUserRound size={18} />{user.full_name.split(' ')[0]}</span><button className="text-button" onClick={closeSession}>Salir</button></div> : <Link to="/login" className="login-link"><ShoppingBag size={17} />Ingresar</Link>}
      </div>
    </div>
  </header>
}
