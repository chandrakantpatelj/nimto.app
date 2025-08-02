-- UserRole Dummy Data for Prisma
-- Run this script in your PostgreSQL database to add user roles

INSERT INTO "UserRole" (id, slug, name, description, "isTrashed", "createdAt", "isProtected", "isDefault") VALUES
-- System Roles (Protected)
(gen_random_uuid(), 'owner', 'Owner', 'System owner with full administrative access and control over all features.', false, NOW(), true, false),
(gen_random_uuid(), 'admin', 'Administrator', 'Administrator with full access to manage the system, users, and configurations.', false, NOW(), true, false),

-- Management Roles
(gen_random_uuid(), 'manager', 'Manager', 'Manager with permissions to oversee team operations, manage resources, and view reports.', false, NOW(), false, false),
(gen_random_uuid(), 'analyst', 'Analyst', 'Data analyst with access to view reports, analytics, and business intelligence data.', false, NOW(), false, false),

-- Operational Roles
(gen_random_uuid(), 'staff', 'Staff', 'Staff member with limited access to specific operational tasks and customer support.', false, NOW(), false, false),
(gen_random_uuid(), 'support', 'Support', 'Support team member responsible for handling customer queries, tickets, and technical issues.', false, NOW(), false, false),
(gen_random_uuid(), 'moderator', 'Moderator', 'Content moderator with permissions to review and manage user-generated content.', false, NOW(), false, false),

-- Technical Roles
(gen_random_uuid(), 'developer', 'Developer', 'Developer with technical access to API endpoints and system integrations.', false, NOW(), false, false),
(gen_random_uuid(), 'tester', 'Tester', 'Quality assurance tester with access to test features and report bugs.', false, NOW(), false, false),

-- Business Roles
(gen_random_uuid(), 'vendor', 'Vendor', 'Vendor with access to manage their own products, inventory, and order fulfillment.', false, NOW(), false, false),

-- User Roles
(gen_random_uuid(), 'customer', 'Customer', 'Registered customer with access to purchase products, view orders, and manage their profile.', false, NOW(), false, true), -- DEFAULT ROLE
(gen_random_uuid(), 'guest', 'Guest', 'Unauthenticated user with limited access to view public content and browse products.', false, NOW(), false, false)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "isProtected" = EXCLUDED."isProtected",
  "isDefault" = EXCLUDED."isDefault",
  "updatedAt" = NOW();

-- Verify the default role exists
SELECT 
  id, 
  slug, 
  name, 
  "isDefault",
  "isProtected"
FROM "UserRole" 
WHERE "isDefault" = true;