"use client"

import { useState, useEffect } from "react"
import { Filter, Calendar, MapPin, Tag, Star, Heart, Download, Share2, X } from "lucide-react"
import Image from "next/image"
import "./page.css"

// Mock data for photos
const mockPhotos = [
  {
    id: 1,
    src: "/photo-booth-fun.png",
    date: "2023-04-15",
    location: "홍대",
    brand: "인생네컷",
    favorite: false,
    tags: ["친구", "봄", "홍대"],
  },
  {
    id: 2,
    src: "/silly-booth-fun.png",
    date: "2023-05-20",
    location: "강남",
    brand: "하루필��",
    favorite: true,
    tags: ["커플", "데이트"],
  },
  {
    id: 3,
    src: "/placeholder.svg?key=u3sit",
    date: "2023-06-10",
    location: "이태원",
    brand: "포토이즘",
    favorite: false,
    tags: ["친구", "여름"],
  },
  {
    id: 4,
    src: "/placeholder.svg?key=5dc1f",
    date: "2023-07-05",
    location: "명동",
    brand: "인생네컷",
    favorite: true,
    tags: ["가족", "여행"],
  },
  {
    id: 5,
    src: "/photo-booth-fun.png",
    date: "2023-08-12",
    location: "홍대",
    brand: "하루필름",
    favorite: false,
    tags: ["친구", "여름"],
  },
  {
    id: 6,
    src: "/photo-booth-hearts.png",
    date: "2023-09-25",
    location: "강남",
    brand: "포토이즘",
    favorite: true,
    tags: ["커플", "데이트"],
  },
]

type Photo = (typeof mockPhotos)[0]

type FilterOptions = {
  brand: string | null
  location: string | null
  date: string | null
  favorite: boolean | null
  tag: string | null
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    brand: null,
    location: null,
    date: null,
    favorite: null,
    tag: null,
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Get unique values for filter options
  const brands = Array.from(new Set(mockPhotos.map((photo) => photo.brand)))
  const locations = Array.from(new Set(mockPhotos.map((photo) => photo.location)))
  const tags = Array.from(new Set(mockPhotos.flatMap((photo) => photo.tags)))

  useEffect(() => {
    // Filter photos based on selected filters
    let filteredPhotos = [...mockPhotos]

    if (filters.brand) {
      filteredPhotos = filteredPhotos.filter((photo) => photo.brand === filters.brand)
    }

    if (filters.location) {
      filteredPhotos = filteredPhotos.filter((photo) => photo.location === filters.location)
    }

    if (filters.date) {
      filteredPhotos = filteredPhotos.filter((photo) => photo.date === filters.date)
    }

    if (filters.favorite !== null) {
      filteredPhotos = filteredPhotos.filter((photo) => photo.favorite === filters.favorite)
    }

    if (filters.tag) {
      filteredPhotos = filteredPhotos.filter((photo) => photo.tags.includes(filters.tag))
    }

    setPhotos(filteredPhotos)
  }, [filters])

  const toggleFavorite = (id: number) => {
    setPhotos(photos.map((photo) => (photo.id === id ? { ...photo, favorite: !photo.favorite } : photo)))
  }

  const resetFilters = () => {
    setFilters({
      brand: null,
      location: null,
      date: null,
      favorite: null,
      tag: null,
    })
  }

  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const openPhotoDetail = (photo: Photo) => {
    setSelectedPhoto(photo)
  }

  const closePhotoDetail = () => {
    setSelectedPhoto(null)
  }

  return (
    <div className="gallery-container animate-fade-in">
      <div className="gallery-header">
        <h1 className="gallery-title">나의 네컷 갤러리</h1>
        <button className="filter-toggle-btn btn btn-outline" onClick={toggleFilterPanel}>
          <Filter size={18} />
          <span className="ml-2">필터</span>
        </button>
      </div>

      <div className={`filter-panel glass-card ${isFilterOpen ? "open" : ""}`}>
        <div className="filter-header">
          <h2 className="filter-title">필터</h2>
          <button className="btn btn-outline btn-sm" onClick={resetFilters}>
            초기화
          </button>
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <h3 className="filter-group-title">
              <Calendar size={16} className="filter-icon" />
              날짜
            </h3>
            <select
              className="filter-select"
              value={filters.date || ""}
              onChange={(e) => setFilters({ ...filters, date: e.target.value || null })}
            >
              <option value="">모든 날짜</option>
              {Array.from(new Set(mockPhotos.map((photo) => photo.date))).map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString("ko-KR")}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3 className="filter-group-title">
              <MapPin size={16} className="filter-icon" />
              장소
            </h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filters.location === null ? "active" : ""}`}
                onClick={() => setFilters({ ...filters, location: null })}
              >
                전체
              </button>
              {locations.map((location) => (
                <button
                  key={location}
                  className={`filter-btn ${filters.location === location ? "active" : ""}`}
                  onClick={() => setFilters({ ...filters, location })}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-group-title">
              <Tag size={16} className="filter-icon" />
              브랜드
            </h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filters.brand === null ? "active" : ""}`}
                onClick={() => setFilters({ ...filters, brand: null })}
              >
                전체
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  className={`filter-btn ${filters.brand === brand ? "active" : ""}`}
                  onClick={() => setFilters({ ...filters, brand })}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-group-title">
              <Star size={16} className="filter-icon" />
              즐겨찾기
            </h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filters.favorite === null ? "active" : ""}`}
                onClick={() => setFilters({ ...filters, favorite: null })}
              >
                전체
              </button>
              <button
                className={`filter-btn ${filters.favorite === true ? "active" : ""}`}
                onClick={() => setFilters({ ...filters, favorite: true })}
              >
                즐겨찾기만
              </button>
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-group-title">
              <Tag size={16} className="filter-icon" />
              태그
            </h3>
            <div className="filter-tags">
              <button
                className={`tag-btn ${filters.tag === null ? "active" : ""}`}
                onClick={() => setFilters({ ...filters, tag: null })}
              >
                전체
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-btn ${filters.tag === tag ? "active" : ""}`}
                  onClick={() => setFilters({ ...filters, tag })}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="photos-grid">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <div key={photo.id} className="photo-card glass-card">
              <div className="photo-container" onClick={() => openPhotoDetail(photo)}>
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={`네컷 사진 ${photo.id}`}
                  width={300}
                  height={400}
                  className="photo-image"
                />
                <div className="photo-overlay">
                  <button className="overlay-btn">
                    <Share2 size={20} />
                  </button>
                  <button className="overlay-btn">
                    <Download size={20} />
                  </button>
                </div>
              </div>
              <div className="photo-info">
                <div className="photo-meta">
                  <span className="photo-date">
                    <Calendar size={14} className="info-icon" />
                    {new Date(photo.date).toLocaleDateString("ko-KR")}
                  </span>
                  <span className="photo-location">
                    <MapPin size={14} className="info-icon" />
                    {photo.location}
                  </span>
                </div>
                <div className="photo-brand">{photo.brand}</div>
                <button
                  className={`favorite-btn ${photo.favorite ? "active" : ""}`}
                  onClick={() => toggleFavorite(photo.id)}
                  aria-label={photo.favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                  <Heart size={20} fill={photo.favorite ? "#f472b6" : "none"} />
                </button>
              </div>
              <div className="photo-tags">
                {photo.tags.map((tag) => (
                  <span key={tag} className="photo-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-photos glass-card">
            <p>해당 조건에 맞는 사진이 없습니다.</p>
            <button className="btn btn-primary" onClick={resetFilters}>
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div className="photo-detail-overlay" onClick={closePhotoDetail}>
          <div className="photo-detail glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closePhotoDetail}>
              <X size={24} />
            </button>
            <div className="detail-content">
              <div className="detail-image-container">
                <Image
                  src={selectedPhoto.src || "/placeholder.svg"}
                  alt={`네컷 사진 상세`}
                  width={400}
                  height={600}
                  className="detail-image"
                />
              </div>
              <div className="detail-info">
                <div className="detail-header">
                  <h2 className="detail-title">{selectedPhoto.brand} 네컷</h2>
                  <button
                    className={`favorite-btn large ${selectedPhoto.favorite ? "active" : ""}`}
                    onClick={() => toggleFavorite(selectedPhoto.id)}
                  >
                    <Heart size={24} fill={selectedPhoto.favorite ? "#f472b6" : "none"} />
                  </button>
                </div>

                <div className="detail-meta">
                  <div className="meta-item">
                    <Calendar size={18} className="meta-icon" />
                    <span>{new Date(selectedPhoto.date).toLocaleDateString("ko-KR")}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={18} className="meta-icon" />
                    <span>{selectedPhoto.location}</span>
                  </div>
                </div>

                <div className="detail-tags">
                  {selectedPhoto.tags.map((tag) => (
                    <span key={tag} className="detail-tag">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="detail-actions">
                  <button className="btn btn-primary">
                    <Download size={18} className="btn-icon" />
                    <span>다운로드</span>
                  </button>
                  <button className="btn btn-outline">
                    <Share2 size={18} className="btn-icon" />
                    <span>공유하기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
