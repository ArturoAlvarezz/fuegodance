import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Figures from './pages/Figures'
import Contact from './pages/Contact'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="galeria" element={<Gallery />} />
        <Route path="figuras" element={<Figures />} />
        <Route path="contacto" element={<Contact />} />
      </Route>
    </Routes>
  )
}

export default App
