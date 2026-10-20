-- =========================================================================
-- ChangeRipple: V2 Seed Demonstration Data
-- =========================================================================

-- 1. Default Admin User (username: admin, password: password123)
-- BCrypt hash for 'password123'
INSERT INTO users (id, username, email, password_hash, full_name, role)
VALUES (
    'u0000000-0000-0000-0000-000000000001',
    'admin',
    'admin@changeripple.io',
    '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.twOsFXVCvoq4i',
    'Platform Administrator',
    'ADMIN'
) ON DUPLICATE KEY UPDATE id=id;

-- 2. Demonstration Project: CloudCommerce Enterprise Platform
INSERT INTO projects (id, name, description, owner_id)
VALUES (
    'p0000000-0000-0000-0000-000000000001',
    'CloudCommerce Enterprise Platform',
    'Enterprise high-throughput e-commerce microservices ecosystem featuring orders, payments, inventory, and notifications.',
    'u0000000-0000-0000-0000-000000000001'
) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO project_members (id, project_id, user_id, role)
VALUES (
    'pm000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000001',
    'u0000000-0000-0000-0000-000000000001',
    'OWNER'
) ON DUPLICATE KEY UPDATE id=id;

-- 3. Components
-- Modules
INSERT INTO components (id, project_id, name, type, description, criticality, source_path) VALUES
('c-mod-orders', 'p0000000-0000-0000-0000-000000000001', 'OrderManagementModule', 'MODULE', 'Core order orchestration and lifecycle management module', 'HIGH', 'services/order-service'),
('c-mod-payments', 'p0000000-0000-0000-0000-000000000001', 'PaymentProcessingModule', 'MODULE', 'Secure PCI-compliant financial transaction processor', 'CRITICAL', 'services/payment-service'),
('c-mod-inventory', 'p0000000-0000-0000-0000-000000000001', 'InventoryModule', 'MODULE', 'Stock tracking, reservations, and warehouse sync module', 'MEDIUM', 'services/inventory-service');

-- APIs
INSERT INTO components (id, project_id, name, type, description, criticality, source_path) VALUES
('c-api-checkout', 'p0000000-0000-0000-0000-000000000001', 'POST /api/v1/checkout', 'API', 'Public checkout endpoint handling cart conversion to order', 'CRITICAL', 'controllers/CheckoutController.java'),
('c-api-payment', 'p0000000-0000-0000-0000-000000000001', 'POST /api/v1/payments/charge', 'API', 'Internal payment processing and 3D-Secure webhook receiver', 'CRITICAL', 'controllers/PaymentWebhookController.java'),
('c-api-orders', 'p0000000-0000-0000-0000-000000000001', 'GET /api/v1/orders/{id}', 'API', 'Customer order history and status lookup API', 'HIGH', 'controllers/OrderQueryController.java');

-- Classes
INSERT INTO components (id, project_id, name, type, description, criticality, source_path) VALUES
('c-cls-order-ctrl', 'p0000000-0000-0000-0000-000000000001', 'CheckoutController', 'CLASS', 'HTTP presentation layer for cart checkout requests', 'HIGH', 'src/controllers/CheckoutController.java'),
('c-cls-order-svc', 'p0000000-0000-0000-0000-000000000001', 'OrderService', 'CLASS', 'Orchestrates validation, payments, inventory locks, and persistence', 'CRITICAL', 'src/services/OrderService.java'),
('c-cls-order-repo', 'p0000000-0000-0000-0000-000000000001', 'OrderRepository', 'CLASS', 'JPA repository managing order entities and financial ledger tables', 'CRITICAL', 'src/repositories/OrderRepository.java'),
('c-cls-pay-svc', 'p0000000-0000-0000-0000-000000000001', 'PaymentService', 'CLASS', 'Payment authorization, charge capture, and refund processing', 'CRITICAL', 'src/services/PaymentService.java'),
('c-cls-pay-client', 'p0000000-0000-0000-0000-000000000001', 'StripePaymentClient', 'CLASS', 'External gateway integration client communicating with Stripe API', 'HIGH', 'src/clients/StripePaymentClient.java'),
('c-cls-inv-svc', 'p0000000-0000-0000-0000-000000000001', 'InventoryService', 'CLASS', 'Stock reservation and SKU availability validation', 'MEDIUM', 'src/services/InventoryService.java'),
('c-cls-notif-worker', 'p0000000-0000-0000-0000-000000000001', 'NotificationWorker', 'CLASS', 'Async queue consumer generating customer email receipts', 'LOW', 'src/workers/NotificationWorker.java'),
('c-cls-email-hlpr', 'p0000000-0000-0000-0000-000000000001', 'EmailTemplateHelper', 'CLASS', 'HTML template formatter for transaction receipts', 'LOW', 'src/utils/EmailTemplateHelper.java');

-- Requirements
INSERT INTO components (id, project_id, name, type, description, criticality, source_path) VALUES
('c-req-pci-dss', 'p0000000-0000-0000-0000-000000000001', 'REQ-PCI-101: PCI Tokenization', 'REQUIREMENT', 'Strict zero plaintext credit card storage and TLS 1.3 tokenization', 'CRITICAL', 'docs/compliance/pci-dss.md'),
('c-req-idempotency', 'p0000000-0000-0000-0000-000000000001', 'REQ-FIN-102: Zero Double-Charge Guarantee', 'REQUIREMENT', 'Idempotent request keys preventing duplicated financial charges', 'CRITICAL', 'docs/requirements/fin-idempotency.md'),
('c-req-audit-log', 'p0000000-0000-0000-0000-000000000001', 'REQ-AUD-103: Immutable Ledger Audit', 'REQUIREMENT', 'Append-only ledger logging for accounting and regulatory audit', 'HIGH', 'docs/requirements/audit-logging.md');

-- Tests
INSERT INTO components (id, project_id, name, type, description, criticality, source_path) VALUES
('c-tst-order-unit', 'p0000000-0000-0000-0000-000000000001', 'OrderServiceTest', 'TEST', 'Unit tests validating order creation, state changes, and exceptions', 'HIGH', 'test/services/OrderServiceTest.java'),
('c-tst-pay-unit', 'p0000000-0000-0000-0000-000000000001', 'PaymentServiceTest', 'TEST', 'Unit tests for card tokenization, capture, and decline logic', 'CRITICAL', 'test/services/PaymentServiceTest.java'),
('c-tst-checkout-int', 'p0000000-0000-0000-0000-000000000001', 'CheckoutIntegrationTest', 'TEST', 'Spring Boot integration test verifying HTTP checkout flow', 'CRITICAL', 'test/integration/CheckoutIntegrationTest.java'),
('c-tst-inv-unit', 'p0000000-0000-0000-0000-000000000001', 'InventoryServiceTest', 'TEST', 'Tests checking stock reservation under concurrent access', 'MEDIUM', 'test/services/InventoryServiceTest.java'),
('c-tst-notif-unit', 'p0000000-0000-0000-0000-000000000001', 'EmailTemplateHelperTest', 'TEST', 'Unit test verifying template token substitution and escaping', 'LOW', 'test/utils/EmailTemplateHelperTest.java'),
('c-tst-e2e-order', 'p0000000-0000-0000-0000-000000000001', 'E2EOrderPlacementSuite', 'TEST', 'Complete regression suite checking end-to-end checkout & payment', 'CRITICAL', 'test/e2e/OrderPlacementE2ETest.java');

-- 4. Dependencies
-- Convention: A -> B means "A depends on B"
-- When B is modified, A is affected (reverse traversal B <- A)
INSERT INTO dependencies (id, project_id, source_component_id, target_component_id, dependency_type, description) VALUES
('dep-01', 'p0000000-0000-0000-0000-000000000001', 'c-api-checkout', 'c-cls-order-ctrl', 'RUNTIME', 'Checkout API endpoint routes to CheckoutController'),
('dep-02', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-ctrl', 'c-cls-order-svc', 'RUNTIME', 'CheckoutController invokes OrderService.placeOrder()'),
('dep-03', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-svc', 'c-cls-order-repo', 'RUNTIME', 'OrderService queries and persists Order entities'),
('dep-04', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-svc', 'c-cls-pay-svc', 'RUNTIME', 'OrderService delegates payment processing to PaymentService'),
('dep-05', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-svc', 'c-cls-inv-svc', 'RUNTIME', 'OrderService checks stock availability with InventoryService'),
('dep-06', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-svc', 'c-cls-notif-worker', 'RUNTIME', 'OrderService dispatches order confirmation event to worker'),
('dep-07', 'p0000000-0000-0000-0000-000000000001', 'c-cls-pay-svc', 'c-cls-pay-client', 'RUNTIME', 'PaymentService calls StripePaymentClient gateway'),
('dep-08', 'p0000000-0000-0000-0000-000000000001', 'c-api-payment', 'c-cls-pay-svc', 'RUNTIME', 'Webhook API routes notifications to PaymentService'),
('dep-09', 'p0000000-0000-0000-0000-000000000001', 'c-cls-notif-worker', 'c-cls-email-hlpr', 'RUNTIME', 'NotificationWorker calls EmailTemplateHelper to render HTML'),
('dep-10', 'p0000000-0000-0000-0000-000000000001', 'c-api-orders', 'c-cls-order-repo', 'RUNTIME', 'Orders query API queries OrderRepository directly'),
('dep-11', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-svc', 'c-mod-orders', 'RUNTIME', 'OrderService belongs to OrderManagementModule'),
('dep-12', 'p0000000-0000-0000-0000-000000000001', 'c-cls-pay-svc', 'c-mod-payments', 'RUNTIME', 'PaymentService belongs to PaymentProcessingModule'),
('dep-13', 'p0000000-0000-0000-0000-000000000001', 'c-cls-inv-svc', 'c-mod-inventory', 'RUNTIME', 'InventoryService belongs to InventoryModule'),
('dep-14', 'p0000000-0000-0000-0000-000000000001', 'c-cls-pay-svc', 'c-req-pci-dss', 'RUNTIME', 'PaymentService satisfies PCI Tokenization requirement'),
('dep-15', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-svc', 'c-req-idempotency', 'RUNTIME', 'OrderService implements Idempotency check requirement'),
('dep-16', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-repo', 'c-req-audit-log', 'RUNTIME', 'OrderRepository satisfies Ledger Audit requirement');

-- 5. Test Coverages (Explicit Test -> Runtime Component coverage)
INSERT INTO test_coverages (id, project_id, test_component_id, target_component_id, coverage_type) VALUES
('tc-01', 'p0000000-0000-0000-0000-000000000001', 'c-tst-order-unit', 'c-cls-order-svc', 'UNIT'),
('tc-02', 'p0000000-0000-0000-0000-000000000001', 'c-tst-order-unit', 'c-cls-order-repo', 'UNIT'),
('tc-03', 'p0000000-0000-0000-0000-000000000001', 'c-tst-pay-unit', 'c-cls-pay-svc', 'UNIT'),
('tc-04', 'p0000000-0000-0000-0000-000000000001', 'c-tst-pay-unit', 'c-cls-pay-client', 'UNIT'),
('tc-05', 'p0000000-0000-0000-0000-000000000001', 'c-tst-checkout-int', 'c-api-checkout', 'INTEGRATION'),
('tc-06', 'p0000000-0000-0000-0000-000000000001', 'c-tst-checkout-int', 'c-cls-order-ctrl', 'INTEGRATION'),
('tc-07', 'p0000000-0000-0000-0000-000000000001', 'c-tst-checkout-int', 'c-cls-order-svc', 'INTEGRATION'),
('tc-08', 'p0000000-0000-0000-0000-000000000001', 'c-tst-inv-unit', 'c-cls-inv-svc', 'UNIT'),
('tc-09', 'p0000000-0000-0000-0000-000000000001', 'c-tst-notif-unit', 'c-cls-email-hlpr', 'UNIT'),
('tc-10', 'p0000000-0000-0000-0000-000000000001', 'c-tst-notif-unit', 'c-cls-notif-worker', 'UNIT'),
('tc-11', 'p0000000-0000-0000-0000-000000000001', 'c-tst-e2e-order', 'c-api-checkout', 'E2E'),
('tc-12', 'p0000000-0000-0000-0000-000000000001', 'c-tst-e2e-order', 'c-cls-order-svc', 'E2E'),
('tc-13', 'p0000000-0000-0000-0000-000000000001', 'c-tst-e2e-order', 'c-cls-pay-svc', 'E2E'),
('tc-14', 'p0000000-0000-0000-0000-000000000001', 'c-tst-e2e-order', 'c-cls-order-repo', 'E2E');

-- 6. Pre-seeded Change Requests for instant testing
INSERT INTO change_requests (id, project_id, changed_component_id, title, description, category, severity, status, author_id) VALUES
('cr000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'c-cls-order-repo', 'CR-101: Order Entity Schema Refactoring for Multi-Currency', 'Refactor Order persistence entity to support fractional multi-currency balances and VAT isolation. Modifies column constraints.', 'DATA_MODEL_CHANGE', 'CRITICAL', 'COMPLETED', 'u0000000-0000-0000-0000-000000000001'),
('cr000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'c-cls-pay-svc', 'CR-102: Stripe v2 API Upgrade & Webhook Signature Update', 'Update PaymentService interface signatures and token validation for modern payment gateway SDK.', 'INTERFACE_CHANGE', 'HIGH', 'PENDING', 'u0000000-0000-0000-0000-000000000001'),
('cr000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'c-cls-email-hlpr', 'CR-103: Fix Notification Receipt UTF-8 Charset Bug', 'Patch string encoder in EmailTemplateHelper to properly escape special unicode currency symbols in receipts.', 'LOGIC_CHANGE', 'LOW', 'PENDING', 'u0000000-0000-0000-0000-000000000001');

-- 7. Pre-seeded Analysis Run for CR-101 (Demonstration Benchmark)
INSERT INTO analysis_runs (
    id, change_request_id, project_id, status, overall_risk_score, overall_risk_band,
    total_affected_components, direct_affected_count, transitive_affected_count, max_impact_depth,
    candidate_test_count, selected_test_count, test_suite_reduction_percent, test_coverage_percent,
    uncovered_component_count, algorithm_version
) VALUES (
    'ar000000-0000-0000-0000-000000000001',
    'cr000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000001',
    'COMPLETED',
    84.5,
    'CRITICAL',
    5,
    2,
    3,
    3,
    4,
    2,
    50.0,
    100.0,
    0,
    'v1.0-bfs-greedy'
);

-- Pre-seeded Impact Results for CR-101
INSERT INTO impact_results (
    id, analysis_run_id, component_id, impact_type, depth, shortest_path_json,
    downstream_dependents_count, risk_score, risk_band, criticality_factor,
    proximity_factor, blast_radius_factor, category_factor, severity_factor,
    critical_req_bonus, explanation
) VALUES
('ir-01', 'ar000000-0000-0000-0000-000000000001', 'c-cls-order-svc', 'DIRECT', 1, '["c-cls-order-svc", "c-cls-order-repo"]', 3, 92.0, 'CRITICAL', 100.0, 100.0, 60.0, 15.0, 15.0, 15.0, 'OrderService directly calls OrderRepository. Changing repository entity definitions may cause runtime mapping or transaction rollback failures.'),
('ir-02', 'ar000000-0000-0000-0000-000000000001', 'c-api-orders', 'DIRECT', 1, '["c-api-orders", "c-cls-order-repo"]', 0, 78.0, 'HIGH', 65.0, 100.0, 20.0, 15.0, 15.0, 0.0, 'Orders query API directly accesses repository projections. Query contracts will be affected.'),
('ir-03', 'ar000000-0000-0000-0000-000000000001', 'c-cls-order-ctrl', 'TRANSITIVE', 2, '["c-cls-order-ctrl", "c-cls-order-svc", "c-cls-order-repo"]', 2, 74.0, 'HIGH', 65.0, 60.0, 40.0, 15.0, 15.0, 15.0, 'CheckoutController transitively depends on OrderRepository via OrderService.'),
('ir-04', 'ar000000-0000-0000-0000-000000000001', 'c-api-checkout', 'TRANSITIVE', 3, '["c-api-checkout", "c-cls-order-ctrl", "c-cls-order-svc", "c-cls-order-repo"]', 0, 71.0, 'HIGH', 100.0, 35.0, 10.0, 15.0, 15.0, 15.0, 'Public Checkout REST API affected 3 hops away through order submission pipeline.'),
('ir-05', 'ar000000-0000-0000-0000-000000000001', 'c-mod-orders', 'TRANSITIVE', 2, '["c-mod-orders", "c-cls-order-svc", "c-cls-order-repo"]', 0, 62.0, 'HIGH', 65.0, 60.0, 0.0, 15.0, 15.0, 0.0, 'OrderManagementModule package stability impacted by repository schema mutation.');

-- Pre-seeded Selected Tests for CR-101 (Greedy vs Basic comparison)
INSERT INTO selected_tests (id, analysis_run_id, test_component_id, selection_strategy, selection_rank, covered_components_json, selection_reason) VALUES
('st-01', 'ar000000-0000-0000-0000-000000000001', 'c-tst-e2e-order', 'GREEDY', 1, '["c-api-checkout", "c-cls-order-svc", "c-cls-order-repo"]', 'Maximum coverage: covers 3 affected components including public API and core service'),
('st-02', 'ar000000-0000-0000-0000-000000000001', 'c-tst-checkout-int', 'GREEDY', 2, '["c-cls-order-ctrl"]', 'Covers remaining uncovered affected presentation controller CheckoutController');
