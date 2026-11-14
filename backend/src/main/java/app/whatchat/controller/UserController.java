package app.whatchat.controller;

import app.whatchat.auth.AuthResponses;
import app.whatchat.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User profile retrieval, search, avatar, and presence")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<AuthResponses.AccountView> getCurrentProfile(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(authService.currentAccount(principal.getName()));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get another user's public profile")
    public ResponseEntity<AuthResponses.AccountView> getPublicProfile(@PathVariable String userId) {
        return ResponseEntity.ok(authService.publicProfile(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile information")
    public ResponseEntity<AuthResponses.AccountView> updateProfile(
            Principal principal,
            @RequestBody Map<String, String> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        String fullName = payload.getOrDefault("fullName", "");
        String username = payload.get("username");
        String about = payload.get("about");
        String phoneNumber = payload.get("phoneNumber");

        authService.updateProfile(principal.getName(), fullName, username, about, phoneNumber);
        return ResponseEntity.ok(authService.currentAccount(principal.getName()));
    }

    @PutMapping("/avatar")
    @Operation(summary = "Update current user profile avatar URL")
    public ResponseEntity<AuthResponses.AccountView> updateAvatar(
            Principal principal,
            @RequestBody Map<String, String> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        String avatarUrl = payload.get("avatarUrl");
        authService.updateAvatar(principal.getName(), avatarUrl);
        return ResponseEntity.ok(authService.currentAccount(principal.getName()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by name or username")
    public ResponseEntity<List<AuthResponses.AccountView>> searchUsers(@RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(authService.searchUsers(q));
    }

    @GetMapping("/{userId}/status")
    @Operation(summary = "Retrieve user online or offline status")
    public ResponseEntity<Map<String, Object>> getUserStatus(@PathVariable String userId) {
        AuthResponses.AccountView view = authService.publicProfile(userId);
        return ResponseEntity.ok(Map.of(
                "userId", view.id(),
                "username", view.username() != null ? view.username() : "",
                "status", "Available"
        ));
    }
}

