package com.changeripple.change;

import com.changeripple.auth.User;
import com.changeripple.auth.UserRepository;
import com.changeripple.common.ForbiddenException;
import com.changeripple.common.PagedResponse;
import com.changeripple.common.ResourceNotFoundException;
import com.changeripple.component.Component;
import com.changeripple.component.ComponentRepository;
import com.changeripple.history.AnalysisRun;
import com.changeripple.history.AnalysisRunRepository;
import com.changeripple.project.Project;
import com.changeripple.project.ProjectRepository;
import com.changeripple.security.ProjectSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final ComponentRepository componentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AnalysisRunRepository analysisRunRepository;
    private final ProjectSecurityService projectSecurityService;

    @Transactional(readOnly = true)
    public PagedResponse<ChangeRequestResponseDto> getChangeRequests(String projectId, Pageable pageable) {
        validateAccess(projectId, "MEMBER");
        Page<ChangeRequest> page = changeRequestRepository.findAllByProjectId(projectId, pageable);
        return PagedResponse.of(page.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public List<ChangeRequestResponseDto> getAllChangeRequests(String projectId) {
        validateAccess(projectId, "MEMBER");
        return changeRequestRepository.findAllByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChangeRequestResponseDto getChangeRequest(String changeId) {
        ChangeRequest cr = changeRequestRepository.findById(changeId)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", changeId));

        validateAccess(cr.getProject().getId(), "MEMBER");
        return toResponse(cr);
    }

    @Transactional
    public ChangeRequestResponseDto createChangeRequest(String projectId, ChangeRequestCreateDto request) {
        validateAccess(projectId, "MEMBER");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        Component component = componentRepository.findByIdAndProjectId(request.getChangedComponentId(), projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Changed component not found in this project"));

        String userId = projectSecurityService.getCurrentUserId();
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        ChangeRequest cr = ChangeRequest.builder()
                .project(project)
                .changedComponent(component)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .category(request.getCategory())
                .severity(request.getSeverity())
                .status(AnalysisStatus.PENDING)
                .author(author)
                .build();

        cr = changeRequestRepository.save(cr);
        return toResponse(cr);
    }

    private void validateAccess(String projectId, String minRole) {
        if (!projectSecurityService.hasAccess(projectId, minRole)) {
            throw new ForbiddenException("You do not have required " + minRole + " access for project " + projectId);
        }
    }

    public ChangeRequestResponseDto toResponse(ChangeRequest cr) {
        List<AnalysisRun> runs = analysisRunRepository.findAllByChangeRequestIdOrderByExecutedAtDesc(cr.getId());
        String latestRunId = runs.isEmpty() ? null : runs.get(0).getId();
        Double latestScore = runs.isEmpty() ? null : runs.get(0).getOverallRiskScore();

        return ChangeRequestResponseDto.builder()
                .id(cr.getId())
                .projectId(cr.getProject().getId())
                .projectName(cr.getProject().getName())
                .changedComponentId(cr.getChangedComponent().getId())
                .changedComponentName(cr.getChangedComponent().getName())
                .title(cr.getTitle())
                .description(cr.getDescription())
                .category(cr.getCategory())
                .severity(cr.getSeverity())
                .status(cr.getStatus())
                .authorId(cr.getAuthor().getId())
                .authorName(cr.getAuthor().getFullName())
                .latestAnalysisRunId(latestRunId)
                .latestRiskScore(latestScore)
                .createdAt(cr.getCreatedAt())
                .updatedAt(cr.getUpdatedAt())
                .build();
    }
}
