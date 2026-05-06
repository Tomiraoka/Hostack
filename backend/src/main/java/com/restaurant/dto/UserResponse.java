package com.restaurant.dto;

import java.time.Instant;

import com.restaurant.model.User;

public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String role;
    private Instant createdAt;
    private boolean locked;

    public UserResponse() {}

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.name = u.getName();
        r.email = u.getEmail();
        r.role = u.getRole() != null ? u.getRole().name() : "USER";
        r.createdAt = u.getCreatedAt();
        r.locked = u.isLocked();
        return r;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant t) { this.createdAt = t; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean v) { this.locked = v; }
}
