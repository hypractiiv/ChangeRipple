package com.changeripple.config;

import com.changeripple.auth.User;
import com.changeripple.auth.UserRepository;
import com.changeripple.component.Component;
import com.changeripple.component.ComponentRepository;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.dependency.*;
import com.changeripple.project.Project;
import com.changeripple.project.ProjectMember;
import com.changeripple.project.ProjectMemberRepository;
import com.changeripple.project.ProjectRepository;
import com.changeripple.project.ProjectRole;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@org.springframework.stereotype.Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ComponentRepository componentRepository;
    private final DependencyRepository dependencyRepository;
    private final TestCoverageRepository testCoverageRepository;
    private final PasswordEncoder passwordEncoder;

    public static final String DEMO_PROJECT_ID = "p0000000-0000-0000-0000-000000000001";

    @Override
    @Transactional
    public void run(String... args) {
        initUsers();
        initDemoProject();
    }

    private void initUsers() {
        if (userRepository.findByEmail("admin@changeripple.io").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@changeripple.io")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .fullName("Platform Administrator")
                    .role("ADMIN")
                    .build();
            admin.setId("u0000000-0000-0000-0000-000000000001");
            userRepository.save(admin);
            log.info("Initialized admin account: admin@changeripple.io / Password123!");
        }

        if (userRepository.findByEmail("lead@changeripple.io").isEmpty()) {
            User lead = User.builder()
                    .username("lead")
                    .email("lead@changeripple.io")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .fullName("Tech Lead")
                    .role("USER")
                    .build();
            lead.setId("u0000000-0000-0000-0000-000000000002");
            userRepository.save(lead);
            log.info("Initialized lead developer account: lead@changeripple.io / Password123!");
        }

        if (userRepository.findByEmail("viewer@changeripple.io").isEmpty()) {
            User viewer = User.builder()
                    .username("viewer")
                    .email("viewer@changeripple.io")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .fullName("Quality Assurance Viewer")
                    .role("USER")
                    .build();
            viewer.setId("u0000000-0000-0000-0000-000000000003");
            userRepository.save(viewer);
            log.info("Initialized viewer account: viewer@changeripple.io / Password123!");
        }
    }

    private void initDemoProject() {
        if (projectRepository.findById(DEMO_PROJECT_ID).isPresent()) {
            return;
        }

        User admin = userRepository.findByEmail("admin@changeripple.io").orElseThrow();

        Project project = Project.builder()
                .name("CloudCommerce Enterprise Platform")
                .description("Enterprise high-throughput e-commerce microservices ecosystem featuring orders, payments, inventory, and notifications.")
                .owner(admin)
                .build();
        project.setId(DEMO_PROJECT_ID);
        project = projectRepository.save(project);

        ProjectMember pm = ProjectMember.builder()
                .project(project)
                .user(admin)
                .role(ProjectRole.OWNER)
                .build();
        pm.setId("pm000000-0000-0000-0000-000000000001");
        projectMemberRepository.save(pm);

        Map<String, Component> compMap = new HashMap<>();

        // Modules
        compMap.put("c-mod-orders", createComp(project, "c-mod-orders", "OrderManagementModule", ComponentType.MODULE, "Core order orchestration and lifecycle management module", Criticality.HIGH, "services/order-service"));
        compMap.put("c-mod-payments", createComp(project, "c-mod-payments", "PaymentProcessingModule", ComponentType.MODULE, "Secure PCI-compliant financial transaction processor", Criticality.CRITICAL, "services/payment-service"));
        compMap.put("c-mod-inventory", createComp(project, "c-mod-inventory", "InventoryModule", ComponentType.MODULE, "Stock tracking, reservations, and warehouse sync module", Criticality.MEDIUM, "services/inventory-service"));

        // APIs
        compMap.put("c-api-checkout", createComp(project, "c-api-checkout", "POST /api/v1/checkout", ComponentType.API, "Public checkout endpoint handling cart conversion to order", Criticality.CRITICAL, "controllers/CheckoutController.java"));
        compMap.put("c-api-payment", createComp(project, "c-api-payment", "POST /api/v1/payments/charge", ComponentType.API, "Internal payment processing and 3D-Secure webhook receiver", Criticality.CRITICAL, "controllers/PaymentWebhookController.java"));
        compMap.put("c-api-orders", createComp(project, "c-api-orders", "GET /api/v1/orders/{id}", ComponentType.API, "Customer order history and status lookup API", Criticality.HIGH, "controllers/OrderQueryController.java"));

        // Classes
        compMap.put("c-cls-order-ctrl", createComp(project, "c-cls-order-ctrl", "CheckoutController", ComponentType.CLASS, "HTTP presentation layer for cart checkout requests", Criticality.HIGH, "src/controllers/CheckoutController.java"));
        compMap.put("c-cls-order-svc", createComp(project, "c-cls-order-svc", "OrderService", ComponentType.CLASS, "Orchestrates validation, payments, inventory locks, and persistence", Criticality.CRITICAL, "src/services/OrderService.java"));
        compMap.put("c-cls-order-repo", createComp(project, "c-cls-order-repo", "OrderRepository", ComponentType.CLASS, "JPA repository managing order entities and financial ledger tables", Criticality.CRITICAL, "src/repositories/OrderRepository.java"));
        compMap.put("c-cls-pay-svc", createComp(project, "c-cls-pay-svc", "PaymentService", ComponentType.CLASS, "Payment authorization, charge capture, and refund processing", Criticality.CRITICAL, "src/services/PaymentService.java"));
        compMap.put("c-cls-pay-client", createComp(project, "c-cls-pay-client", "StripePaymentClient", ComponentType.CLASS, "External gateway integration client communicating with Stripe API", Criticality.HIGH, "src/clients/StripePaymentClient.java"));
        compMap.put("c-cls-inv-svc", createComp(project, "c-cls-inv-svc", "InventoryService", ComponentType.CLASS, "Stock reservation and SKU availability validation", Criticality.MEDIUM, "src/services/InventoryService.java"));
        compMap.put("c-cls-notif-worker", createComp(project, "c-cls-notif-worker", "NotificationWorker", ComponentType.CLASS, "Async queue consumer generating customer email receipts", Criticality.LOW, "src/workers/NotificationWorker.java"));
        compMap.put("c-cls-email-hlpr", createComp(project, "c-cls-email-hlpr", "EmailTemplateHelper", ComponentType.CLASS, "HTML template formatter for transaction receipts", Criticality.LOW, "src/utils/EmailTemplateHelper.java"));

        // Requirements
        compMap.put("c-req-pci-dss", createComp(project, "c-req-pci-dss", "REQ-PCI-101: PCI Tokenization", ComponentType.REQUIREMENT, "Strict zero plaintext credit card storage and TLS 1.3 tokenization", Criticality.CRITICAL, "docs/compliance/pci-dss.md"));
        compMap.put("c-req-idempotency", createComp(project, "c-req-idempotency", "REQ-FIN-102: Zero Double-Charge Guarantee", ComponentType.REQUIREMENT, "Idempotent request keys preventing duplicated financial charges", Criticality.CRITICAL, "docs/requirements/fin-idempotency.md"));
        compMap.put("c-req-audit-log", createComp(project, "c-req-audit-log", "REQ-AUD-103: Immutable Ledger Audit", ComponentType.REQUIREMENT, "Append-only ledger logging for accounting and regulatory audit", Criticality.HIGH, "docs/requirements/audit-logging.md"));

        // Tests
        compMap.put("c-tst-order-unit", createComp(project, "c-tst-order-unit", "OrderServiceTest", ComponentType.TEST, "Unit tests validating order creation, state changes, and exceptions", Criticality.HIGH, "test/services/OrderServiceTest.java"));
        compMap.put("c-tst-pay-unit", createComp(project, "c-tst-pay-unit", "PaymentServiceTest", ComponentType.TEST, "Unit tests for card tokenization, capture, and decline logic", Criticality.CRITICAL, "test/services/PaymentServiceTest.java"));
        compMap.put("c-tst-checkout-int", createComp(project, "c-tst-checkout-int", "CheckoutIntegrationTest", ComponentType.TEST, "Spring Boot integration test verifying HTTP checkout flow", Criticality.CRITICAL, "test/integration/CheckoutIntegrationTest.java"));
        compMap.put("c-tst-inv-unit", createComp(project, "c-tst-inv-unit", "InventoryServiceTest", ComponentType.TEST, "Tests checking stock reservation under concurrent access", Criticality.MEDIUM, "test/services/InventoryServiceTest.java"));
        compMap.put("c-tst-notif-unit", createComp(project, "c-tst-notif-unit", "EmailTemplateHelperTest", ComponentType.TEST, "Unit test verifying template token substitution and escaping", Criticality.LOW, "test/utils/EmailTemplateHelperTest.java"));
        compMap.put("c-tst-e2e-order", createComp(project, "c-tst-e2e-order", "E2EOrderPlacementSuite", ComponentType.TEST, "Complete regression suite checking end-to-end checkout & payment", Criticality.CRITICAL, "test/e2e/OrderPlacementE2ETest.java"));

        // Dependencies: A -> B means A depends on B
        createDep(project, "dep-01", compMap.get("c-api-checkout"), compMap.get("c-cls-order-ctrl"), "Checkout API endpoint routes to CheckoutController");
        createDep(project, "dep-02", compMap.get("c-cls-order-ctrl"), compMap.get("c-cls-order-svc"), "CheckoutController invokes OrderService.placeOrder()");
        createDep(project, "dep-03", compMap.get("c-cls-order-svc"), compMap.get("c-cls-order-repo"), "OrderService queries and persists Order entities");
        createDep(project, "dep-04", compMap.get("c-cls-order-svc"), compMap.get("c-cls-pay-svc"), "OrderService delegates payment processing to PaymentService");
        createDep(project, "dep-05", compMap.get("c-cls-order-svc"), compMap.get("c-cls-inv-svc"), "OrderService checks stock availability with InventoryService");
        createDep(project, "dep-06", compMap.get("c-cls-order-svc"), compMap.get("c-cls-notif-worker"), "OrderService dispatches order confirmation event to worker");
        createDep(project, "dep-07", compMap.get("c-cls-pay-svc"), compMap.get("c-cls-pay-client"), "PaymentService calls StripePaymentClient gateway");
        createDep(project, "dep-08", compMap.get("c-api-payment"), compMap.get("c-cls-pay-svc"), "Webhook API routes notifications to PaymentService");
        createDep(project, "dep-09", compMap.get("c-cls-notif-worker"), compMap.get("c-cls-email-hlpr"), "NotificationWorker calls EmailTemplateHelper to render HTML");
        createDep(project, "dep-10", compMap.get("c-api-orders"), compMap.get("c-cls-order-repo"), "Orders query API queries OrderRepository directly");
        createDep(project, "dep-11", compMap.get("c-cls-order-svc"), compMap.get("c-mod-orders"), "OrderService belongs to OrderManagementModule");
        createDep(project, "dep-12", compMap.get("c-cls-pay-svc"), compMap.get("c-mod-payments"), "PaymentService belongs to PaymentProcessingModule");
        createDep(project, "dep-13", compMap.get("c-cls-inv-svc"), compMap.get("c-mod-inventory"), "InventoryService belongs to InventoryModule");
        createDep(project, "dep-14", compMap.get("c-cls-pay-svc"), compMap.get("c-req-pci-dss"), "PaymentService satisfies PCI Tokenization requirement");
        createDep(project, "dep-15", compMap.get("c-cls-order-svc"), compMap.get("c-req-idempotency"), "OrderService implements Idempotency check requirement");
        createDep(project, "dep-16", compMap.get("c-cls-order-repo"), compMap.get("c-req-audit-log"), "OrderRepository satisfies Ledger Audit requirement");

        // Test Coverages
        createTestCov(project, "tc-01", compMap.get("c-tst-order-unit"), compMap.get("c-cls-order-svc"), "UNIT");
        createTestCov(project, "tc-02", compMap.get("c-tst-order-unit"), compMap.get("c-cls-order-repo"), "UNIT");
        createTestCov(project, "tc-03", compMap.get("c-tst-pay-unit"), compMap.get("c-cls-pay-svc"), "UNIT");
        createTestCov(project, "tc-04", compMap.get("c-tst-pay-unit"), compMap.get("c-cls-pay-client"), "UNIT");
        createTestCov(project, "tc-05", compMap.get("c-tst-checkout-int"), compMap.get("c-api-checkout"), "INTEGRATION");
        createTestCov(project, "tc-06", compMap.get("c-tst-checkout-int"), compMap.get("c-cls-order-ctrl"), "INTEGRATION");
        createTestCov(project, "tc-07", compMap.get("c-tst-checkout-int"), compMap.get("c-cls-order-svc"), "INTEGRATION");
        createTestCov(project, "tc-08", compMap.get("c-tst-inv-unit"), compMap.get("c-cls-inv-svc"), "UNIT");
        createTestCov(project, "tc-09", compMap.get("c-tst-notif-unit"), compMap.get("c-cls-email-hlpr"), "UNIT");
        createTestCov(project, "tc-10", compMap.get("c-tst-notif-unit"), compMap.get("c-cls-notif-worker"), "UNIT");
        createTestCov(project, "tc-11", compMap.get("c-tst-e2e-order"), compMap.get("c-api-checkout"), "E2E");
        createTestCov(project, "tc-12", compMap.get("c-tst-e2e-order"), compMap.get("c-cls-order-svc"), "E2E");
        createTestCov(project, "tc-13", compMap.get("c-tst-e2e-order"), compMap.get("c-cls-pay-svc"), "E2E");
        createTestCov(project, "tc-14", compMap.get("c-tst-e2e-order"), compMap.get("c-cls-inv-svc"), "E2E");

        log.info("Initialized CloudCommerce Enterprise Platform demo project with 15 components, 16 dependencies, and 14 test coverages.");
    }

    private Component createComp(Project p, String id, String name, ComponentType type, String desc, Criticality crit, String path) {
        Component c = Component.builder()
                .project(p)
                .name(name)
                .type(type)
                .description(desc)
                .criticality(crit)
                .sourcePath(path)
                .build();
        c.setId(id);
        return componentRepository.save(c);
    }

    private void createDep(Project p, String id, Component src, Component tgt, String desc) {
        Dependency dep = Dependency.builder()
                .project(p)
                .sourceComponent(src)
                .targetComponent(tgt)
                .dependencyType(DependencyType.RUNTIME)
                .description(desc)
                .build();
        dep.setId(id);
        dependencyRepository.save(dep);
    }

    private void createTestCov(Project p, String id, Component tst, Component tgt, String covType) {
        TestCoverage tc = TestCoverage.builder()
                .project(p)
                .testComponent(tst)
                .targetComponent(tgt)
                .coverageType(covType)
                .build();
        tc.setId(id);
        testCoverageRepository.save(tc);
    }
}
