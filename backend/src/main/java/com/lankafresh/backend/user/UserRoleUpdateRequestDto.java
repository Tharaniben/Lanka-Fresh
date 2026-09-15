package com.lankafresh.backend.user;

import com.lankafresh.backend.user.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserRoleUpdateRequestDto {

    @NotNull(message = "Role is required")
    private Role role;
}
