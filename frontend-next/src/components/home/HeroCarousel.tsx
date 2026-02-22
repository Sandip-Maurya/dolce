'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import Image from 'next/image'
import 'swiper/css'
import 'swiper/css/pagination'

interface HeroCarouselProps {
  imageUrls: string[]
  alt?: string
}

export function HeroCarousel({ imageUrls, alt = 'Premium artisanal gift hampers with organic treats' }: HeroCarouselProps) {
  if (imageUrls.length === 0) return null

  return (
    <div className="hero-carousel relative w-full h-full" role="region" aria-label="Hero carousel">
      <Swiper
        loop
        modules={[Pagination]}
        pagination={{ clickable: true }}
        className="w-full aspect-[2/1]"
      >
        {imageUrls.map((url, index) => (
          <SwiperSlide key={`${url}-${index}`}>
            <div className="relative w-full h-full">
              <Image
                src={url}
                alt={`${alt}${imageUrls.length > 1 ? ` – slide ${index + 1}` : ''}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
