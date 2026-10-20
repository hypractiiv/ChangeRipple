package com.changeripple.security;

import com.changeripple.project.ProjectMember;
import com.changeripple.project.ProjectMemberRepository;
import com.changeripple.project.ProjectRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("projectSecurity")
@RequiredArgsConstructor
public class ProjectSecurityService {

    private final ProjectMemberRepository projectMemberRepository;

    public String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        if (auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getId();
        }
        return null;
    }

    public boolean hasAccess(String projectId, String minimumRole) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        // Global admin bypass
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }

        String userId = getCurrentUserId();
        if (userId == null || projectId == null) {
            return false;
        }

        ProjectRole requiredRole = ProjectRole.valueOf(minimumRole.toUpperCase());
        Optional<ProjectMember> membership = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);

        return membership.map(member -> member.getRole().satisfies(requiredRole)).orElse(false);
    }

    public boolean isMember(String projectId) {
        return hasAccess(projectId, "MEMBER");
    }

    public boolean isAdmin(String projectId) {
        return hasAccess(projectId, "ADMIN");
    }

    public boolean isOwner(String projectId) {
        return hasAccess(projectId, "OWNER");
    }
}
