package com.sims.server.dto;

import com.sims.server.model.User;

public class UserDTO {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;

    public UserDTO() {}

    public static UserDTO from(User user) {
        UserDTO dto = new UserDTO();
        dto.id = user.getId();
        dto.username = user.getUsername();
        dto.fullName = user.getFullName();
        dto.email = user.getEmail() != null ? user.getEmail() : "";
        dto.role = user.getRole();
        return dto;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}
