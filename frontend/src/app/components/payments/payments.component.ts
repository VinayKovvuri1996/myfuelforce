import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
    loading = true;
    error = '';
    analytics: any = null;

    constructor(private authService: AuthService, private api: ApiService) { }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.loading = true;
        this.error = '';
        this.api.get('sales/analytics').subscribe({
            next: (data) => {
                this.analytics = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = err?.error?.detail || 'Could not load payment reports';
                this.loading = false;
            }
        });
    }

    inr(amount: number | undefined | null): string {
        const n = Number(amount || 0);
        return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    maxDaily(): number {
        const series = this.analytics?.daily_last_30 || [];
        return Math.max(1, ...series.map((d: any) => Number(d.amount || 0)));
    }

    barHeight(amount: number): number {
        return Math.max(2, (Number(amount || 0) / this.maxDaily()) * 100);
    }

    logout() {
        this.authService.logout();
    }
}
