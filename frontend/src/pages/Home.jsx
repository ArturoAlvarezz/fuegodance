import Hero from '../components/home/Hero'
import About from '../components/home/About'
import InstagramCarousel from '../components/home/InstagramCarousel'
import Locations from '../components/home/Locations'
import GalleryCarousel from '../components/home/GalleryCarousel'
import { Helmet } from 'react-helmet-async'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Fuego Dance — Academia de Salsa Casino en Curicó, Talca y Rancagua</title>
        <meta name="description" content="Academia de Salsa Casino en Curicó, Talca y Rancagua. Clases para todos los niveles, figuras en video, sociales y comunidad. ¡Primera clase gratis!" />
        <link rel="canonical" href="https://fuegodance.cl/" />
        <meta property="og:title" content="Fuego Dance — Academia de Salsa Casino" />
        <meta property="og:description" content="Clases de Salsa Casino en Curicó, Talca y Rancagua. Figuras en video, sociales y comunidad." />
        <meta property="og:url" content="https://fuegodance.cl/" />
      </Helmet>
      <Hero />
      <About />
      <InstagramCarousel />
      <Locations />
      <GalleryCarousel />
    </>
  )
}
