import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CustomerPortalComponent } from './features/customer-portal/customer-portal.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';
import { CustomerCreateComponent } from './features/customers/customer-create/customer-create.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductCreateComponent } from './features/products/product-create/product-create.component';
import { PolicyListComponent } from './features/policies/policy-list/policy-list.component';
import { PolicyCreateComponent } from './features/policies/policy-create/policy-create.component';
import { ClaimListComponent } from './features/claims/claim-list/claim-list.component';
import { ClaimCreateComponent } from './features/claims/claim-create/claim-create.component';
import { PaymentListComponent } from './features/payments/payment-list/payment-list.component';
import { PaymentCreateComponent } from './features/payments/payment-create/payment-create.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Entry Authentication Routes
  { 
    path: 'login', 
    component: LoginComponent, 
    title: 'Sign In - InsurEdge Portal' 
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    title: 'Customer Registration - InsurEdge' 
  },

  // Authenticated Shell Application Layout
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        pathMatch: 'full', 
        redirectTo: 'dashboard' 
      },
      // Dashboard
      { 
        path: 'dashboard', 
        component: DashboardComponent, 
        title: 'Dashboard - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'READ_ONLY'] }
      },
      // Customer Portal
      { 
        path: 'portal', 
        component: CustomerPortalComponent, 
        title: 'Portal - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['CUSTOMER', 'ADMIN'] }
      },
      // User Management
      { 
        path: 'admin/users', 
        component: UserManagementComponent, 
        title: 'Users - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      // Customers
      { 
        path: 'customers', 
        component: CustomerListComponent, 
        title: 'Customers - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CUSTOMER_SERVICE'] }
      },
      { 
        path: 'customers/new', 
        component: CustomerCreateComponent, 
        title: 'Register Customer - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CUSTOMER_SERVICE'] }
      },
      // Products
      { 
        path: 'products', 
        component: ProductListComponent, 
        title: 'Products - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'UNDERWRITER'] }
      },
      { 
        path: 'products/new', 
        component: ProductCreateComponent, 
        title: 'New Product - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'UNDERWRITER'] }
      },
      // Policies
      { 
        path: 'policies', 
        component: PolicyListComponent, 
        title: 'Policies - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'UNDERWRITER'] }
      },
      { 
        path: 'policies/new', 
        component: PolicyCreateComponent, 
        title: 'Issue Policy - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'UNDERWRITER'] }
      },
      // Claims
      { 
        path: 'claims', 
        component: ClaimListComponent, 
        title: 'Claims - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CLAIMS_OFFICER'] }
      },
      { 
        path: 'claims/new', 
        component: ClaimCreateComponent, 
        title: 'New Claim - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CLAIMS_OFFICER', 'CUSTOMER'] }
      },
      // Payments
      { 
        path: 'payments', 
        component: PaymentListComponent, 
        title: 'Payments - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'FINANCE_OFFICER'] }
      },
      { 
        path: 'payments/new', 
        component: PaymentCreateComponent, 
        title: 'Record Payment - InsurEdge',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'FINANCE_OFFICER'] }
      }
    ]
  },

  // Fallback
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];
