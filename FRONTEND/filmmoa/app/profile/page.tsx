"use client"

import { useState } from "react"
import { User, Mail, Phone, LogOut, HelpCircle, Trash2 } from "lucide-react"
import Image from "next/image"
import "./page.css"

// Mock user data
const mockUser = {
  name: "김스타",
  email: "star@example.com",
  phone: "010-1234-5678",
  profileImage: "/serene-woman-profile.png",
  joinDate: "2023-01-15",
  photoCount: 42,
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header glass-card">
        <div className="profile-avatar">
          <Image
            src={mockUser.profileImage || "/placeholder.svg"}
            alt="프로필 이미지"
            width={120}
            height={120}
            className="avatar-image"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{mockUser.name}</h1>
          <p className="profile-email">{mockUser.email}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{mockUser.photoCount}</span>
              <span className="stat-label">저장된 네컷</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {new Date(mockUser.joinDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="stat-label">가입일</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} className="tab-icon" />
            <span>프로필 정보</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "inquiry" ? "active" : ""}`}
            onClick={() => setActiveTab("inquiry")}
          >
            <HelpCircle size={18} className="tab-icon" />
            <span>1:1 문의</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <LogOut size={18} className="tab-icon" />
            <span>로그아웃 / 회원탈퇴</span>
          </button>
        </div>

        <div className="tab-content glass-card">
          {activeTab === "profile" && (
            <div className="profile-edit">
              <h2 className="section-title">프로필 정보</h2>
              <p className="section-description">프로필 정보를 수정할 수 있습니다</p>

              <form className="profile-form">
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} className="label-icon" />
                    이름
                  </label>
                  <input type="text" className="input" defaultValue={mockUser.name} placeholder="이름을 입력하세요" />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={16} className="label-icon" />
                    이메일
                  </label>
                  <input
                    type="email"
                    className="input"
                    defaultValue={mockUser.email}
                    placeholder="이메일을 입력하세요"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} className="label-icon" />
                    전화번호
                  </label>
                  <input
                    type="tel"
                    className="input"
                    defaultValue={mockUser.phone}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">프로필 이미지</label>
                  <div className="profile-image-upload">
                    <Image
                      src={mockUser.profileImage || "/placeholder.svg"}
                      alt="프로필 이미지"
                      width={100}
                      height={100}
                      className="upload-preview"
                    />
                    <div className="upload-controls">
                      <label className="btn btn-outline upload-btn">
                        <input type="file" accept="image/*" className="file-input" />
                        이미지 변경
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "inquiry" && (
            <div className="inquiry-form">
              <h2 className="section-title">1:1 문의하기</h2>
              <p className="section-description">궁금한 점이나 문제가 있으시면 문의해주세요</p>

              <form>
                <div className="form-group">
                  <label className="form-label">문의 유형</label>
                  <select className="input">
                    <option value="">문의 유형을 선택해주세요</option>
                    <option value="technical">기술적 문제</option>
                    <option value="account">계정 관련</option>
                    <option value="feature">기능 제안</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">제목</label>
                  <input type="text" className="input" placeholder="문의 제목을 입력해주세요" />
                </div>

                <div className="form-group">
                  <label className="form-label">내용</label>
                  <textarea className="input textarea" placeholder="문의 내용을 자세히 적어주세요" rows={6}></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">첨부 파일 (선택사항)</label>
                  <label className="btn btn-outline upload-btn">
                    <input type="file" className="file-input" />
                    파일 첨부하기
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    문의하기
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="account-settings">
              <h2 className="section-title">계정 설정</h2>
              <p className="section-description">로그아웃 또는 회원탈퇴를 할 수 있습니다</p>

              <div className="settings-section">
                <h3 className="settings-title">로그아웃</h3>
                <p className="settings-description">
                  현재 기기에서 로그아웃합니다. 다시 로그인하려면 이메일과 비밀번호가 필요합니다.
                </p>
                <button className="btn btn-outline">
                  <LogOut size={18} className="btn-icon" />
                  로그아웃
                </button>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-section danger">
                <h3 className="settings-title">회원탈퇴</h3>
                <p className="settings-description">
                  회원탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다. 신중하게 결정해주세요.
                </p>
                <button className="btn btn-danger">
                  <Trash2 size={18} className="btn-icon" />
                  회원탈퇴
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
