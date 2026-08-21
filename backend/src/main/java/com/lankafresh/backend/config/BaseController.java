package com.lankafresh.backend.config;

import com.lankafresh.backend.user.model.User;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Optional base class for module controllers.
 * Extend this to get the getCurrentUser() helper for free.
 *
 * Usage in your controller:
 *   public class ProductController extends BaseController {
 *       @GetMapping("/me")
 *       public ResponseEntity<?> getMe(HttpServletRequest request) {
 *           User user = getCurrentUser(request);
 *           ...
 *       }
 *   }
 *
 * The User object is placed into the request by JwtUserFilter on every
 * authenticated request — it's always non-null by the time a controller runs.
 */
public abstract class BaseController {

    protected User getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            throw new IllegalStateException(
                "currentUser not found in request — is this endpoint authenticated?");
        }
        return user;
    }
}
