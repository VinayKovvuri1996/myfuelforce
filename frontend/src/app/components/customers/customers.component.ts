import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule } from '@angular/router';
import { timeout, firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
    customers: any[] = [];
    customerForm: FormGroup;
    showForm = false;
    selectedCustomer: any = null;
    error = '';
    success = '';
    saving = false;
    loading = false;

    constructor(private api: ApiService, private fb: FormBuilder) {
        this.customerForm = this.fb.group({
            name: ['', Validators.required],
            transport_company: ['', Validators.required],
            address: ['', Validators.required],
            phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            email: ['', [Validators.required, Validators.email]],
            contact_person: ['', Validators.required],
            contact_person_details: ['']
        });
    }

    ngOnInit() {
        this.loadCustomers();
    }

    async loadCustomers() {
        this.loading = true;
        this.error = '';
        try {
            const data = await firstValueFrom(
                this.api.get('customers').pipe(timeout({ first: 15000 }))
            );
            this.customers = Array.isArray(data) ? data : [];
        } catch (err: any) {
            this.customers = [];
            if (err?.name === 'TimeoutError') {
                this.error = 'Loading timed out. Please refresh.';
            } else if (err?.status === 401) {
                this.error = 'Session expired. Please login again.';
            } else {
                this.error = typeof err?.error?.detail === 'string'
                    ? err.error.detail
                    : 'Could not load customers.';
            }
        } finally {
            this.loading = false;
        }
    }

    openDetails(customer: any, event?: Event) {
        event?.stopPropagation();
        this.selectedCustomer = customer;
    }

    closeDetails() {
        this.selectedCustomer = null;
    }

    onSubmit() {
        if (!this.customerForm.valid) {
            this.error = 'Please fill all required fields (10-digit mobile, valid email).';
            return;
        }
        this.saving = true;
        this.error = '';
        this.success = '';
        this.api.post('customers', this.customerForm.value).subscribe({
            next: (created) => {
                this.saving = false;
                this.success = `Customer "${created?.name || 'saved'}" added.`;
                if (created?.id) {
                    this.customers = [created, ...this.customers.filter(c => c.id !== created.id)];
                }
                this.loadCustomers();
                this.customerForm.reset({ contact_person_details: '' });
                this.showForm = false;
            },
            error: (err) => {
                this.saving = false;
                this.error = typeof err?.error?.detail === 'string'
                    ? err.error.detail
                    : 'Could not save customer. Please try again.';
            }
        });
    }

    toggleForm() {
        this.showForm = !this.showForm;
        this.error = '';
        this.success = '';
    }
}
