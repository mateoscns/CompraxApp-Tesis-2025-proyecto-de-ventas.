package com.CompraXApp.repository;

import com.CompraXApp.model.Role;
import com.CompraXApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Override
    @NonNull
    Optional<User> findById(@NonNull Long id);
    
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByPasswordResetToken(String token);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.active = true")
    long countByRolesNameAndActiveTrue(@Param("roleName") Role.ERole roleName);

    List<User> findByActiveTrue();
}