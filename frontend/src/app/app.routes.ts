import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomersComponent } from './components/customers/customers.component';
import { SalesComponent } from './components/sales/sales.component';
import { ManpowerComponent } from './components/manpower/manpower.component';
import { StockComponent } from './components/stock/stock.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth';

const authGuard = () => {
    const authService = inject(AuthService);
    if (authService.isAuthenticated()) {
        return true;
    }
    authService.logout();
    return false;
};

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'customers', component: CustomersComponent, canActivate: [authGuard] },
    { path: 'sales', component: SalesComponent, canActivate: [authGuard] },
    { path: 'stock', component: StockComponent, canActivate: [authGuard] },
    { path: 'manpower', component: ManpowerComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
