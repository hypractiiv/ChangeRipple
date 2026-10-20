package com.changeripple.dependency;

import com.changeripple.common.BadRequestException;
import com.changeripple.common.ForbiddenException;
import com.changeripple.common.ResourceNotFoundException;
import com.changeripple.component.Component;
import com.changeripple.component.ComponentRepository;
import com.changeripple.component.ComponentResponse;
import com.changeripple.component.ComponentService;
import com.changeripple.graph.DirectedGraph;
import com.changeripple.graph.GraphBuilder;
import com.changeripple.graph.GraphValidationResult;
import com.changeripple.project.Project;
import com.changeripple.project.ProjectRepository;
import com.changeripple.security.ProjectSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DependencyService {

    private final DependencyRepository dependencyRepository;
    private final TestCoverageRepository testCoverageRepository;
    private final ComponentRepository componentRepository;
    private final ProjectRepository projectRepository;
    private final ComponentService componentService;
    private final GraphBuilder graphBuilder;
    private final ProjectSecurityService projectSecurityService;

    @Transactional(readOnly = true)
    public GraphResponse getProjectGraph(String projectId) {
        validateAccess(projectId, "MEMBER");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        List<Component> components = componentRepository.findAllByProjectId(projectId);
        List<Dependency> dependencies = dependencyRepository.findAllByProjectId(projectId);

        List<ComponentResponse> nodes = components.stream()
                .map(componentService::toResponse)
                .toList();

        List<DependencyResponse> edges = dependencies.stream()
                .map(this::toResponse)
                .toList();

        DirectedGraph graph = graphBuilder.buildGraphForProject(projectId);
        GraphValidationResult validation = graphBuilder.validateGraph(graph);

        return GraphResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .nodes(nodes)
                .edges(edges)
                .validation(validation)
                .build();
    }

    @Transactional
    public DependencyResponse createDependency(String projectId, DependencyRequest request) {
        validateAccess(projectId, "ADMIN");

        if (request.getSourceComponentId().equals(request.getTargetComponentId())) {
            throw new BadRequestException("Self-dependency is disallowed: A component cannot depend on itself.");
        }

        Component source = componentRepository.findByIdAndProjectId(request.getSourceComponentId(), projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Source component not found in this project"));

        Component target = componentRepository.findByIdAndProjectId(request.getTargetComponentId(), projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Target component not found in this project"));

        if (!source.getProject().getId().equals(target.getProject().getId())) {
            throw new BadRequestException("Cross-project dependencies are prohibited.");
        }

        if (dependencyRepository.existsByProjectIdAndSourceComponentIdAndTargetComponentIdAndDependencyType(
                projectId, source.getId(), target.getId(), request.getDependencyType())) {
            throw new BadRequestException("Dependency relationship already exists between these components.");
        }

        Dependency dependency = Dependency.builder()
                .project(source.getProject())
                .sourceComponent(source)
                .targetComponent(target)
                .dependencyType(request.getDependencyType())
                .description(request.getDescription())
                .build();

        dependency = dependencyRepository.save(dependency);

        return toResponse(dependency);
    }

    @Transactional
    public void deleteDependency(String dependencyId) {
        Dependency dependency = dependencyRepository.findById(dependencyId)
                .orElseThrow(() -> new ResourceNotFoundException("Dependency", "id", dependencyId));

        validateAccess(dependency.getProject().getId(), "ADMIN");
        dependencyRepository.delete(dependency);
    }

    @Transactional(readOnly = true)
    public Map<String, List<DependencyResponse>> getComponentDependencies(String componentId) {
        Component component = componentRepository.findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException("Component", "id", componentId));

        validateAccess(component.getProject().getId(), "MEMBER");

        List<Dependency> allConnected = dependencyRepository.findAllConnectedToComponent(componentId);

        List<DependencyResponse> outgoing = allConnected.stream()
                .filter(d -> d.getSourceComponent().getId().equals(componentId))
                .map(this::toResponse)
                .toList();

        List<DependencyResponse> incoming = allConnected.stream()
                .filter(d -> d.getTargetComponent().getId().equals(componentId))
                .map(this::toResponse)
                .toList();

        Map<String, List<DependencyResponse>> result = new HashMap<>();
        result.put("outgoing", outgoing); // What this component depends on
        result.put("incoming", incoming); // What depends on this component
        return result;
    }

    @Transactional(readOnly = true)
    public List<TestCoverageResponse> getTestCoverages(String projectId) {
        validateAccess(projectId, "MEMBER");
        return testCoverageRepository.findAllByProjectId(projectId).stream()
                .map(this::toCoverageResponse)
                .toList();
    }

    @Transactional
    public TestCoverageResponse createTestCoverage(String projectId, TestCoverageRequest request) {
        validateAccess(projectId, "ADMIN");

        Component testComp = componentRepository.findByIdAndProjectId(request.getTestComponentId(), projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Test component not found in this project"));

        Component targetComp = componentRepository.findByIdAndProjectId(request.getTargetComponentId(), projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Target component not found in this project"));

        if (testCoverageRepository.existsByProjectIdAndTestComponentIdAndTargetComponentId(
                projectId, testComp.getId(), targetComp.getId())) {
            throw new BadRequestException("Test coverage mapping already exists between these components.");
        }

        TestCoverage coverage = TestCoverage.builder()
                .project(testComp.getProject())
                .testComponent(testComp)
                .targetComponent(targetComp)
                .coverageType(request.getCoverageType() != null ? request.getCoverageType() : "UNIT")
                .build();

        coverage = testCoverageRepository.save(coverage);
        return toCoverageResponse(coverage);
    }

    @Transactional
    public void deleteTestCoverage(String coverageId) {
        TestCoverage coverage = testCoverageRepository.findById(coverageId)
                .orElseThrow(() -> new ResourceNotFoundException("TestCoverage", "id", coverageId));

        validateAccess(coverage.getProject().getId(), "ADMIN");
        testCoverageRepository.delete(coverage);
    }

    private void validateAccess(String projectId, String minRole) {
        if (!projectSecurityService.hasAccess(projectId, minRole)) {
            throw new ForbiddenException("You do not have required " + minRole + " access for project " + projectId);
        }
    }

    private DependencyResponse toResponse(Dependency d) {
        return DependencyResponse.builder()
                .id(d.getId())
                .projectId(d.getProject().getId())
                .sourceComponentId(d.getSourceComponent().getId())
                .sourceComponentName(d.getSourceComponent().getName())
                .targetComponentId(d.getTargetComponent().getId())
                .targetComponentName(d.getTargetComponent().getName())
                .dependencyType(d.getDependencyType())
                .description(d.getDescription())
                .createdAt(d.getCreatedAt())
                .build();
    }

    private TestCoverageResponse toCoverageResponse(TestCoverage tc) {
        return TestCoverageResponse.builder()
                .id(tc.getId())
                .projectId(tc.getProject().getId())
                .testComponentId(tc.getTestComponent().getId())
                .testComponentName(tc.getTestComponent().getName())
                .targetComponentId(tc.getTargetComponent().getId())
                .targetComponentName(tc.getTargetComponent().getName())
                .coverageType(tc.getCoverageType())
                .createdAt(tc.getCreatedAt())
                .build();
    }
}
