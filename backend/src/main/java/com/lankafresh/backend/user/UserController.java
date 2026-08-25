package com.lankafresh.backend.user;

import com.lankafresh.backend.config.ApiResponse;
import com.lankafresh.backend.config.BaseController;
import com.lankafresh.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Endpoints for the current signed-in user.
 * Base path: /api/v1/users
 *
 * GET /api/v1/users/me — returns the current user's id, email, and role.
 * Used by the frontend to determine what the user can see and do.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController extends BaseController {

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUserInfo(
            HttpServletRequest request) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(UserResponseDto.from(user)));
    }
}
