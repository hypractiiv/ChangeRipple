package com.changeripple.preset;

import com.changeripple.auth.User;
import com.changeripple.auth.UserRepository;
import com.changeripple.change.AnalysisStatus;
import com.changeripple.change.ChangeCategory;
import com.changeripple.change.ChangeRequest;
import com.changeripple.change.ChangeRequestRepository;
import com.changeripple.change.ChangeSeverity;
import com.changeripple.common.BadRequestException;
import com.changeripple.common.ResourceNotFoundException;
import com.changeripple.component.Component;
import com.changeripple.component.ComponentRepository;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.dependency.Dependency;
import com.changeripple.dependency.DependencyRepository;
import com.changeripple.dependency.DependencyType;
import com.changeripple.history.AnalysisDetailDto;
import com.changeripple.history.AnalysisService;
import com.changeripple.project.Project;
import com.changeripple.project.ProjectMember;
import com.changeripple.project.ProjectMemberRepository;
import com.changeripple.project.ProjectRepository;
import com.changeripple.project.ProjectRole;
import com.changeripple.security.ProjectSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PresetDemoService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ComponentRepository componentRepository;
    private final DependencyRepository dependencyRepository;
    private final ChangeRequestRepository changeRequestRepository;
    private final UserRepository userRepository;
    private final AnalysisService analysisService;
    private final ProjectSecurityService projectSecurityService;

    private static final String DEMO_PROJECT_ID = "p0000000-0000-0000-0000-000000000001";

    public List<PresetInfo> getAvailablePresets() {
        return List.of(
                PresetInfo.builder()
                        .key("core-db-schema")
                        .title("Core Data Model Mutation (OrderRepository)")
                        .description("Refactor Order persistence entity to support fractional multi-currency balances and VAT isolation.")
                        .componentName("OrderRepository")
                        .category(ChangeCategory.DATA_MODEL_CHANGE)
                        .severity(ChangeSeverity.CRITICAL)
                        .expectedOutcome("High blast radius across 5 components (OrderService, CheckoutController, Checkout API) with 50% test suite reduction.")
                        .build(),

                PresetInfo.builder()
                        .key("public-api-interface")
                        .title("Payment Webhook Interface Alteration (PaymentService)")
                        .description("Stripe v2 API upgrade updating token validation and webhook signatures.")
                        .componentName("PaymentService")
                        .category(ChangeCategory.INTERFACE_CHANGE)
                        .severity(ChangeSeverity.HIGH)
                        .expectedOutcome("Affects OrderService and public payment APIs; traces to PCI-DSS compliance requirement.")
                        .build(),

                PresetInfo.builder()
                        .key("isolated-utility-fix")
                        .title("Isolated Notification Template Fix (EmailTemplateHelper)")
                        .description("Patch character escaping in email receipt template helper.")
                        .componentName("EmailTemplateHelper")
                        .category(ChangeCategory.LOGIC_CHANGE)
                        .severity(ChangeSeverity.LOW)
                        .expectedOutcome("Low blast radius affecting only NotificationWorker; LOW risk score with minimal regression test needed.")
                        .build(),

                PresetInfo.builder()
                        .key("cycle-diamond-mesh")
                        .title("Circular & Diamond Mesh Demonstration")
                        .description("Demonstrates cycle-breaking traversal safety, multi-path convergence, and deterministic tie-breaking.")
                        .componentName("DiamondServiceA")
                        .category(ChangeCategory.LOGIC_CHANGE)
                        .severity(ChangeSeverity.HIGH)
                        .expectedOutcome("Safely traverses diamond dependency and circular loop without infinite recursion.")
                        .build()
        );
    }

    @Transactional
    public AnalysisDetailDto loadAndExecutePreset(String presetKey) {
        String currentUserId = projectSecurityService.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        ensureDemoProjectAndMembership(currentUser);

        if ("cycle-diamond-mesh".equalsIgnoreCase(presetKey)) {
            return setupAndRunDiamondMesh(currentUser);
        }

        PresetInfo preset = getAvailablePresets().stream()
                .filter(p -> p.getKey().equalsIgnoreCase(presetKey))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Unknown preset key: " + presetKey));

        // Locate component in demo project
        Component targetComponent = componentRepository.findAllByProjectId(DEMO_PROJECT_ID).stream()
                .filter(c -> c.getName().equalsIgnoreCase(preset.getComponentName()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Component for preset not found: " + preset.getComponentName()));

        Project project = projectRepository.findById(DEMO_PROJECT_ID).orElseThrow();

        // Create change request
        ChangeRequest cr = ChangeRequest.builder()
                .project(project)
                .changedComponent(targetComponent)
                .title("[Preset Demo] " + preset.getTitle())
                .description(preset.getDescription())
                .category(preset.getCategory())
                .severity(preset.getSeverity())
                .status(AnalysisStatus.PENDING)
                .author(currentUser)
                .build();

        cr = changeRequestRepository.save(cr);

        // Run analysis and return full result
        return analysisService.runAnalysis(cr.getId());
    }

    private void ensureDemoProjectAndMembership(User user) {
        Project project = projectRepository.findById(DEMO_PROJECT_ID).orElse(null);
        if (project == null) {
            project = Project.builder()
                    .name("CloudCommerce Enterprise Platform")
                    .description("Enterprise e-commerce platform demonstrating multi-tier change impact analysis.")
                    .owner(user)
                    .build();
            project.setId(DEMO_PROJECT_ID);
            project = projectRepository.save(project);
        }

        if (!projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())) {
            ProjectMember member = ProjectMember.builder()
                    .project(project)
                    .user(user)
                    .role(ProjectRole.OWNER)
                    .build();
            projectMemberRepository.save(member);
        }
    }

    private AnalysisDetailDto setupAndRunDiamondMesh(User user) {
        Project project = projectRepository.findById(DEMO_PROJECT_ID).orElseThrow();

        // Create nodes for diamond + cycle if not present:
        // DiamondServiceA -> DiamondServiceB -> DiamondServiceD
        // DiamondServiceA -> DiamondServiceC -> DiamondServiceD
        // Circular: DiamondServiceD -> DiamondServiceB (creates cycle B -> D -> B)
        Component compA = getOrCreate(project, "DiamondServiceA", ComponentType.CLASS, Criticality.HIGH);
        Component compB = getOrCreate(project, "DiamondServiceB", ComponentType.CLASS, Criticality.HIGH);
        Component compC = getOrCreate(project, "DiamondServiceC", ComponentType.CLASS, Criticality.MEDIUM);
        Component compD = getOrCreate(project, "DiamondServiceD", ComponentType.CLASS, Criticality.CRITICAL);

        ensureDependency(project, compA, compB);
        ensureDependency(project, compA, compC);
        ensureDependency(project, compB, compD);
        ensureDependency(project, compC, compD);
        ensureDependency(project, compD, compB); // cycle

        ChangeRequest cr = ChangeRequest.builder()
                .project(project)
                .changedComponent(compD)
                .title("[Preset Demo] Diamond & Circular Loop Impact (DiamondServiceD)")
                .description("Verification of cycle safety and shortest-path convergence in multi-path diamond topologies.")
                .category(ChangeCategory.LOGIC_CHANGE)
                .severity(ChangeSeverity.HIGH)
                .status(AnalysisStatus.PENDING)
                .author(user)
                .build();

        cr = changeRequestRepository.save(cr);
        return analysisService.runAnalysis(cr.getId());
    }

    private Component getOrCreate(Project project, String name, ComponentType type, Criticality crit) {
        return componentRepository.findAllByProjectId(project.getId()).stream()
                .filter(c -> c.getName().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    Component c = Component.builder()
                            .project(project)
                            .name(name)
                            .type(type)
                            .criticality(crit)
                            .description("Demonstration node for graph algorithms")
                            .build();
                    return componentRepository.save(c);
                });
    }

    private void ensureDependency(Project project, Component source, Component target) {
        if (!dependencyRepository.existsByProjectIdAndSourceComponentIdAndTargetComponentIdAndDependencyType(
                project.getId(), source.getId(), target.getId(), DependencyType.RUNTIME)) {
            Dependency dep = Dependency.builder()
                    .project(project)
                    .sourceComponent(source)
                    .targetComponent(target)
                    .dependencyType(DependencyType.RUNTIME)
                    .description("Preset mesh connection")
                    .build();
            dependencyRepository.save(dep);
        }
    }
}
