"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Plus, ImageIcon, Mail } from "lucide-react"
import { usePathname } from "next/navigation"
import "./header.css"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">
              <span className="logo-text">StarLog</span>
            </Link>
            <div className="header-actions">
              <button className="icon-button">
                <Mail size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bottom-navbar">
        <div className="container">
          <ul className="nav-list">
            <li className="nav-item">
              <Link href="/gallery" className={`nav-link ${isActive("/gallery") ? "active" : ""}`}>
                <ImageIcon size={20} />
                <span>갤러리</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
                <Plus size={24} />
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>
                <User size={20} />
                <span>프로필</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}
