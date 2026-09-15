package com.lankafresh.backend.user;

import com.lankafresh.backend.user.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * What the API returns for the current user.
 * Only exposes what the frontend needs — id, email, and role.
 * Never expose clerkId or internal fields directly.
 */
@Getter
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;

    public static UserResponseDto from(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
        );
    }
}
