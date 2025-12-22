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
        this.api.get('customers').subscribe(data => {
            this.customers = data;
        });
    }

    onSubmit() {
        if (this.customerForm.valid) {
            this.api.post('customers', this.customerForm.value).subscribe(() => {
                this.loadCustomers();
                this.customerForm.reset();
                this.showForm = false;
            });
        }
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }
}
