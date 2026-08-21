package com.lankafresh.backend.user.service;

import com.lankafresh.backend.user.model.User;
import com.lankafresh.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles just-in-time user provisioning.
 *
 * When someone authenticates for the first time, Clerk knows who they are
 * but our database doesn't have a row for them yet. This service creates
 * that row on the fly — no webhook, no manual step needed.
 *
 * Other modules that need the current user should call getCurrentUser()
 * from SecurityContext (see JwtUserFilter) rather than calling this service
 * directly. Only call this service if you explicitly need to look up or
 * modify a User record.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Returns the existing User row for this Clerk ID, or creates one
     * with role=CUSTOMER if this is their first request.
     */
    @Transactional
    public User findOrCreate(String clerkId, String email,
                             String firstName, String lastName) {
        return userRepository.findByClerkId(clerkId)
                .orElseGet(() -> {
                    User newUser = new User(clerkId, email, firstName, lastName);
                    return userRepository.save(newUser);
                });
    }

    /**
     * Simple lookup — throws if not found.
     * Use this when you're sure the user already exists (i.e. after JIT creation).
     */
    @Transactional(readOnly = true)
    public User getByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found for clerkId: " + clerkId));
    }
}
