package com.ssafy.fourcut.domain.user.repository;

import com.ssafy.fourcut.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // 필요한 경우 커스텀 메서드 추가 가능
    User findByUserEmail(String userEmail);
}