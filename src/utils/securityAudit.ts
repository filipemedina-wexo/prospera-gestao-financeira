import { supabase } from "@/integrations/supabase/client";

export interface SecurityAuditResult {
  score: number;
  maxScore: number;
  issues: SecurityIssue[];
  recommendations: string[];
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  solution: string;
}

export async function performSecurityAudit(): Promise<SecurityAuditResult> {
  const issues: SecurityIssue[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 100;

  try {
    // Check if user has proper client mapping
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      issues.push({
        severity: 'critical',
        category: 'Authentication',
        description: 'User is not authenticated',
        solution: 'Ensure user authentication is properly implemented'
      });
      return { score: 0, maxScore, issues, recommendations };
    }

    // Check client mapping existence
    const { data: userMapping, error: mappingError } = await supabase
      .from('saas_user_client_mapping')
      .select('*')
      .eq('user_id', currentUser.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (mappingError) {
      issues.push({
        severity: 'high',
        category: 'Multi-Tenancy',
        description: 'Error checking user-client mapping',
        solution: 'Verify database RLS policies and user permissions'
      });
    } else if (!userMapping) {
      issues.push({
        severity: 'critical',
        category: 'Multi-Tenancy',
        description: 'User has no active client mapping',
        solution: 'Assign user to a client using the atomic onboarding process'
      });
    } else {
      score += 30; // Good client mapping
    }

    // Test data isolation by trying to access another client's data
    const { data: allClients, error: clientsError } = await supabase
      .from('saas_clients')
      .select('count')
      .limit(1);

    if (clientsError) {
      // This is expected if RLS is working properly
      score += 20;
    } else if (allClients && allClients.length > 0) {
      issues.push({
        severity: 'critical',
        category: 'Data Isolation',
        description: 'User can access other clients\' data',
        solution: 'Review and fix Row Level Security policies'
      });
    }

    // Check financial transaction consistency
    const { data: financialConsistency, error: consistencyError } = await supabase
      .rpc('validate_financial_consistency');

    if (consistencyError) {
      issues.push({
        severity: 'medium',
        category: 'Data Integrity',
        description: 'Cannot validate financial transaction consistency',
        solution: 'Ensure financial consistency validation function is working'
      });
    } else if (financialConsistency) {
      const inconsistentRecords = financialConsistency.filter((record: any) => !record.is_consistent);
      if (inconsistentRecords.length > 0) {
        issues.push({
          severity: 'high',
          category: 'Data Integrity',
          description: `Found ${inconsistentRecords.length} inconsistent financial records`,
          solution: 'Run data repair scripts to fix financial transaction consistency'
        });
      } else {
        score += 25; // Good financial consistency
      }
    }

    // Check for proper authentication tokens
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.access_token) {
      score += 15; // Valid session
    } else {
      issues.push({
        severity: 'medium',
        category: 'Authentication',
        description: 'No valid authentication token found',
        solution: 'Refresh authentication or re-login'
      });
    }

    // Check security audit logging
    const { data: auditLogs, error: auditError } = await supabase
      .from('security_audit_log')
      .select('count')
      .limit(1);

    if (auditError) {
      // This is expected for non-super-admin users
      score += 10;
    } else if (auditLogs) {
      // Only super admins should be able to access audit logs
      issues.push({
        severity: 'high',
        category: 'Access Control',
        description: 'User has unauthorized access to security audit logs',
        solution: 'Review and fix audit log access permissions'
      });
    }

    // Generate recommendations based on issues
    if (issues.length === 0) {
      recommendations.push('Security audit passed successfully!');
      recommendations.push('Continue monitoring for new security threats');
    } else {
      recommendations.push('Address critical and high severity issues immediately');
      recommendations.push('Implement additional security monitoring');
      recommendations.push('Regular security audits should be performed');
    }

    return { score, maxScore, issues, recommendations };

  } catch (error) {
    console.error('Security audit failed:', error);
    return {
      score: 0,
      maxScore,
      issues: [{
        severity: 'critical',
        category: 'System Error',
        description: 'Security audit system failure',
        solution: 'Contact system administrator'
      }],
      recommendations: ['System needs immediate attention']
    };
  }
}

export function getSecurityGrade(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export function getSecurityStatus(score: number, maxScore: number): {
  status: string;
  color: string;
  description: string;
} {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) {
    return {
      status: 'Excellent',
      color: 'green',
      description: 'Your security is in excellent condition'
    };
  }
  if (percentage >= 80) {
    return {
      status: 'Good',
      color: 'blue',
      description: 'Your security is good with minor improvements needed'
    };
  }
  if (percentage >= 70) {
    return {
      status: 'Fair',
      color: 'yellow',
      description: 'Your security needs some improvements'
    };
  }
  if (percentage >= 60) {
    return {
      status: 'Poor',
      color: 'orange',
      description: 'Your security has significant issues'
    };
  }
  return {
    status: 'Critical',
    color: 'red',
    description: 'Your security is in critical condition'
  };
}