package com.changeripple.component;

import com.changeripple.common.BadRequestException;
import com.changeripple.common.ForbiddenException;
import com.changeripple.common.PagedResponse;
import com.changeripple.common.ResourceNotFoundException;
import com.changeripple.dependency.Dependency;
import com.changeripple.dependency.DependencyRepository;
import com.changeripple.dependency.TestCoverageRepository;
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
public class ComponentService {

    private final ComponentRepository componentRepository;
    private final ProjectRepository projectRepository;
    private final DependencyRepository dependencyRepository;
    private final TestCoverageRepository testCoverageRepository;
    private final ProjectSecurityService projectSecurityService;

    @Transactional(readOnly = true)
    public PagedResponse<ComponentResponse> getComponents(
            String projectId,
            ComponentType type,
            Criticality criticality,
            String search,
            Pageable pageable) {
        validateAccess(projectId, "MEMBER");

        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        Page<Component> page = componentRepository.findFiltered(projectId, type, criticality, cleanSearch, pageable);

        return PagedResponse.of(page.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public List<ComponentResponse> getAllComponentsForProject(String projectId) {
        validateAccess(projectId, "MEMBER");
        return componentRepository.findAllByProjectId(projectId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ComponentResponse getComponent(String componentId) {
        Component component = componentRepository.findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException("Component", "id", componentId));

        validateAccess(component.getProject().getId(), "MEMBER");
        return toResponse(component);
    }

    @Transactional
    public ComponentResponse createComponent(String projectId, ComponentRequest request) {
        validateAccess(projectId, "ADMIN");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (componentRepository.existsByProjectIdAndName(projectId, request.getName().trim())) {
            throw new BadRequestException("A component with name '" + request.getName() + "' already exists in this project.");
        }

        Component component = Component.builder()
                .project(project)
                .name(request.getName().trim())
                .type(request.getType())
                .description(request.getDescription())
                .criticality(request.getCriticality())
                .sourcePath(request.getSourcePath())
                .metadataJson(request.getMetadataJson())
                .build();

        component = componentRepository.save(component);
        return toResponse(component);
    }

    @Transactional
    public ComponentResponse updateComponent(String componentId, ComponentRequest request) {
        Component component = componentRepository.findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException("Component", "id", componentId));

        String projectId = component.getProject().getId();
        validateAccess(projectId, "ADMIN");

        String newName = request.getName().trim();
        if (!component.getName().equalsIgnoreCase(newName) &&
                componentRepository.existsByProjectIdAndName(projectId, newName)) {
            throw new BadRequestException("A component with name '" + newName + "' already exists in this project.");
        }

        component.setName(newName);
        component.setType(request.getType());
        component.setDescription(request.getDescription());
        component.setCriticality(request.getCriticality());
        component.setSourcePath(request.getSourcePath());
        component.setMetadataJson(request.getMetadataJson());

        component = componentRepository.save(component);
        return toResponse(component);
    }

    @Transactional
    public void deleteComponent(String componentId) {
        Component component = componentRepository.findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException("Component", "id", componentId));

        validateAccess(component.getProject().getId(), "ADMIN");

        // Clean up connected dependencies and coverage records
        dependencyRepository.deleteAllBySourceComponentIdOrTargetComponentId(componentId, componentId);
        testCoverageRepository.deleteAllByTestComponentIdOrTargetComponentId(componentId, componentId);

        componentRepository.delete(component);
    }

    private void validateAccess(String projectId, String minRole) {
        if (!projectSecurityService.hasAccess(projectId, minRole)) {
            throw new ForbiddenException("You do not have required " + minRole + " access for project " + projectId);
        }
    }

    public ComponentResponse toResponse(Component component) {
        List<Dependency> allDeps = dependencyRepository.findAllConnectedToComponent(component.getId());

        int outgoing = 0; // component is source (depends on others)
        int incoming = 0; // component is target (others depend on this)
        for (Dependency d : allDeps) {
            if (d.getSourceComponent().getId().equals(component.getId())) {
                outgoing++;
            }
            if (d.getTargetComponent().getId().equals(component.getId())) {
                incoming++;
            }
        }

        return ComponentResponse.builder()
                .id(component.getId())
                .projectId(component.getProject().getId())
                .projectName(component.getProject().getName())
                .name(component.getName())
                .type(component.getType())
                .description(component.getDescription())
                .criticality(component.getCriticality())
                .sourcePath(component.getSourcePath())
                .metadataJson(component.getMetadataJson())
                .incomingDependencyCount(incoming)
                .outgoingDependencyCount(outgoing)
                .createdAt(component.getCreatedAt())
                .updatedAt(component.getUpdatedAt())
                .build();
    }
}
