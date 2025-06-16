
export { ClientesManagement } from './ClientesManagement';
export { PlanosManagement } from './PlanosManagement';
export { AssinaturasManagement } from './AssinaturasManagement';
export { AnalyticsManagement } from './AnalyticsManagement';
export { OnboardingManagement } from './OnboardingManagement';
export { SuperAdminDashboard } from './SuperAdminDashboard';
export { AuditLog } from './AuditLog';
export { SecurityAuditView } from './SecurityAuditView';

// Component aliases for backward compatibility
export { ClientesManagement as GestaoClientes } from './ClientesManagement';
export { PlanosManagement as GestaoPlanos } from './PlanosManagement';
export { AssinaturasManagement as GestaoAssinaturas } from './AssinaturasManagement';
export { AnalyticsManagement as GestaoAnalytics } from './AnalyticsManagement';
export { OnboardingManagement as GestaoOnboarding } from './OnboardingManagement';

// Add default export for the main SaaS management component
export { SuperAdminDashboard as default } from './SuperAdminDashboard';
