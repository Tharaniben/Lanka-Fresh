package com.lankafresh.backend.user.repository;

import com.lankafresh.backend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Used by JwtUserFilter to look up (or confirm existence of) the local
     * User row that matches the Clerk JWT's 'sub' claim.
     */
    Optional<User> findByClerkId(String clerkId);
}
