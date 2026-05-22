import Hero from '../components/home/Hero'
import About from '../components/home/About'
import InstagramCarousel from '../components/home/InstagramCarousel'
import Locations from '../components/home/Locations'
import GalleryCarousel from '../components/home/GalleryCarousel'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <InstagramCarousel />
      <Locations />
      <GalleryCarousel />
    </>
  )
}
