import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';
import { NavBrandComponent } from '../nav-brand/nav-brand.component';
import { firstValueFrom, timeout, TimeoutError as RxTimeoutError } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, NavBrandComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    loading = true;
    error = '';
    ops: any = null;

    constructor(private authService: AuthService, private api: ApiService) { }

    ngOnInit() {
        this.refresh();
    }

    async refresh() {
        this.loading = true;
        this.error = '';
        this.ops = null;
        try {
            this.ops = await firstValueFrom(this.api.get('sales/ops-today').pipe(timeout(20000)));
        } catch (err: any) {
            this.ops = null;
            if (err instanceof RxTimeoutError || err?.name === 'TimeoutError') {
                this.error = 'Dashboard timed out. Tap Refresh.';
            } else {
                this.error = typeof err?.error?.detail === 'string'
                    ? err.error.detail
                    : 'Could not load dashboard.';
            }
        } finally {
            this.loading = false;
        }
    }

    inr(amount: number | undefined | null): string {
        const n = Number(amount || 0);
        return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    qty(amount: number | undefined | null): string {
        const n = Number(amount || 0);
        return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    maxHourlyBills(): number {
        const series = this.ops?.hourly || [];
        return Math.max(1, ...series.map((d: any) => Number(d.bills || 0)));
    }

    hourBarHeight(bills: number): number {
        return Math.max(2, (Number(bills || 0) / this.maxHourlyBills()) * 100);
    }

    hourLabel(h: number): string {
        const ampm = h >= 12 ? 'pm' : 'am';
        const hr = h % 12 === 0 ? 12 : h % 12;
        return `${hr}${ampm}`;
    }

    logout() {
        this.authService.logout();
    }
}
