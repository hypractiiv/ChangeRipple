package com.changeripple.project;

import com.changeripple.auth.User;
import com.changeripple.auth.UserRepository;
import com.changeripple.change.ChangeRequestRepository;
import com.changeripple.common.BadRequestException;
import com.changeripple.common.ForbiddenException;
import com.changeripple.common.PagedResponse;
import com.changeripple.common.ResourceNotFoundException;
import com.changeripple.component.ComponentRepository;
import com.changeripple.dependency.DependencyRepository;
import com.changeripple.security.ProjectSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ComponentRepository componentRepository;
    private final DependencyRepository dependencyRepository;
    private final ChangeRequestRepository changeRequestRepository;
    private final ProjectSecurityService projectSecurityService;

    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getProjects(String search, Pageable pageable) {
        String userId = projectSecurityService.getCurrentUserId();
        Page<Project> page;
        if (search != null && !search.isBlank()) {
            page = projectRepository.searchByMemberUserIdAndName(userId, search.trim(), pageable);
        } else {
            page = projectRepository.findAllByMemberUserId(userId, pageable);
        }

        return PagedResponse.of(page.map(p -> toProjectResponse(p, userId)));
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(String projectId) {
        validateAccess(projectId, "MEMBER");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        String userId = projectSecurityService.getCurrentUserId();
        return toProjectResponse(project, userId);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        String userId = projectSecurityService.getCurrentUserId();
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Project project = Project.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .owner(owner)
                .build();

        project = projectRepository.save(project);

        ProjectMember ownerMember = ProjectMember.builder()
                .project(project)
                .user(owner)
                .role(ProjectRole.OWNER)
                .build();

        projectMemberRepository.save(ownerMember);

        return toProjectResponse(project, userId);
    }

    @Transactional
    public ProjectResponse updateProject(String projectId, ProjectRequest request) {
        validateAccess(projectId, "ADMIN");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        project.setName(request.getName().trim());
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        project = projectRepository.save(project);
        return toProjectResponse(project, projectSecurityService.getCurrentUserId());
    }

    @Transactional
    public void deleteProject(String projectId) {
        validateAccess(projectId, "OWNER");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getMembers(String projectId) {
        validateAccess(projectId, "MEMBER");
        List<ProjectMember> members = projectMemberRepository.findAllByProjectId(projectId);
        return members.stream().map(this::toMemberResponse).toList();
    }

    @Transactional
    public ProjectMemberResponse addOrUpdateMember(String projectId, AddMemberRequest request) {
        validateAccess(projectId, "ADMIN");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        User user = userRepository.findByUsername(request.getUsernameOrEmail().trim().toLowerCase())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail().trim().toLowerCase()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with identifier: " + request.getUsernameOrEmail()));

        if (project.getOwner().getId().equals(user.getId()) && request.getRole() != ProjectRole.OWNER) {
            throw new BadRequestException("Project owner role cannot be demoted.");
        }

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, user.getId())
                .orElse(ProjectMember.builder()
                        .project(project)
                        .user(user)
                        .build());

        member.setRole(request.getRole());
        member = projectMemberRepository.save(member);

        return toMemberResponse(member);
    }

    @Transactional
    public void removeMember(String projectId, String userId) {
        validateAccess(projectId, "ADMIN");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (project.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Cannot remove project owner from project.");
        }

        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    private void validateAccess(String projectId, String minimumRole) {
        if (!projectSecurityService.hasAccess(projectId, minimumRole)) {
            throw new ForbiddenException("You do not have required " + minimumRole + " access for project " + projectId);
        }
    }

    private ProjectResponse toProjectResponse(Project project, String currentUserId) {
        String role = projectMemberRepository.findByProjectIdAndUserId(project.getId(), currentUserId)
                .map(m -> m.getRole().name())
                .orElse("NONE");

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getFullName())
                .userRole(role)
                .componentCount(componentRepository.countByProjectId(project.getId()))
                .dependencyCount(dependencyRepository.countByProjectId(project.getId()))
                .changeRequestCount(changeRequestRepository.countByProjectId(project.getId()))
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private ProjectMemberResponse toMemberResponse(ProjectMember member) {
        return ProjectMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .username(member.getUser().getUsername())
                .email(member.getUser().getEmail())
                .fullName(member.getUser().getFullName())
                .role(member.getRole())
                .createdAt(member.getCreatedAt())
                .build();
    }
}
