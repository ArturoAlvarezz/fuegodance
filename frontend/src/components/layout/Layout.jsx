import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import PushNag from '../common/PushNag'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-obsidian">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PushNag />
    </div>
  )
}
