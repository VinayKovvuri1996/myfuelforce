import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule } from '@angular/router';

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
    showForm: boolean = false;
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

    loadCustomers() {
        this.loading = true;
        this.api.get('customers').subscribe({
            next: (data) => {
                this.customers = Array.isArray(data) ? data : [];
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.error = err?.error?.detail || 'Failed to load customers';
            }
        });
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
                // Show immediately even before reload finishes
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
