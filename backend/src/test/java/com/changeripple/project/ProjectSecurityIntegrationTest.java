package com.changeripple.project;

import com.changeripple.auth.AuthResponse;
import com.changeripple.auth.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Users cannot access or modify projects they do not belong to (403 Forbidden)")
    void testProjectIsolationAndAccessControl() throws Exception {
        // 1. Register User 1
        String tokenUser1 = registerUser("user1_" + System.currentTimeMillis());

        // 2. Register User 2
        String tokenUser2 = registerUser("user2_" + System.currentTimeMillis());

        // 3. User 1 creates Project A
        ProjectRequest createProject = ProjectRequest.builder()
                .name("User1 Confidential Architecture")
                .description("Private project isolated from external users")
                .build();

        String projectResponse = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createProject)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String projectId = objectMapper.readTree(projectResponse).path("data").path("id").asText();

        // 4. User 1 can view the project
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("User1 Confidential Architecture"));

        // 5. User 2 CANNOT access User 1's project -> 403 Forbidden
        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + tokenUser2))
                .andExpect(status().isForbidden());

        // 6. User 2 CANNOT delete User 1's project -> 403 Forbidden
        mockMvc.perform(delete("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + tokenUser2))
                .andExpect(status().isForbidden());
    }

    private String registerUser(String username) throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username(username)
                .email(username + "@example.com")
                .password("Password123!")
                .fullName("Test User " + username)
                .build();

        String response = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).path("data").path("accessToken").asText();
    }
}
