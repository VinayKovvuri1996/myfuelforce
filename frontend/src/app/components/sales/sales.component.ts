import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './sales.component.html',
    styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
    sales: any[] = [];
    customers: any[] = [];
    salesForm: FormGroup;
    // Common Indian retail fuels + misc
    productTypes = ['Petrol', 'Diesel', 'CNG', 'Power', 'XP95', 'Other'];
    units = [
        { value: 'Litre', label: 'Litre (L)' },
        { value: 'Kilogram', label: 'Kilogram (kg)' },
        { value: 'Piece', label: 'Piece (pcs)' },
        { value: 'Cubic metre', label: 'Cubic metre (m³)' }
    ];
    showOtherFields = false;

    constructor(private api: ApiService, private fb: FormBuilder) {
        this.salesForm = this.fb.group({
            customer_id: ['', Validators.required],
            product_type: ['Petrol', Validators.required],
            custom_product_name: [''],
            unit: ['Litre', Validators.required],
            price_per_unit: [0, [Validators.required, Validators.min(0.01)]],
            quantity_sold: [0, [Validators.required, Validators.min(0.01)]],
            total_amount: [{ value: 0, disabled: true }]
        });
    }

    ngOnInit() {
        this.loadCustomers();
        this.loadSales();

        this.salesForm.get('product_type')?.valueChanges.subscribe(product => {
            this.salesForm.patchValue({ unit: this.defaultUnitFor(product) }, { emitEvent: false });
        });

        this.salesForm.valueChanges.subscribe(values => {
            this.calculateTotal(values);
            this.showOtherFields = values.product_type === 'Other';

            if (values.product_type !== 'Other') {
                this.salesForm.get('custom_product_name')?.setValidators(null);
            } else {
                this.salesForm.get('custom_product_name')?.setValidators(Validators.required);
            }
            this.salesForm.get('custom_product_name')?.updateValueAndValidity({ emitEvent: false });
        });
    }

    defaultUnitFor(product: string): string {
        switch (product) {
            case 'CNG':
                return 'Kilogram';
            case 'Other':
                return 'Piece';
            default:
                return 'Litre';
        }
    }

    loadCustomers() {
        this.api.get('customers').subscribe(data => {
            this.customers = data;
        });
    }

    loadSales() {
        this.api.get('sales').subscribe(data => {
            this.sales = data;
        });
    }

    calculateTotal(values: any) {
        const price = parseFloat(values.price_per_unit) || 0;
        const quantity = parseFloat(values.quantity_sold) || 0;
        const total = price * quantity;

        if (this.salesForm.get('total_amount')?.value !== total) {
            this.salesForm.patchValue({ total_amount: total }, { emitEvent: false });
        }
    }

    onSubmit() {
        if (this.salesForm.valid) {
            const formData = this.salesForm.getRawValue();
            this.api.post('sales', formData).subscribe(() => {
                this.loadSales();
                this.salesForm.reset({
                    product_type: 'Petrol',
                    unit: 'Litre',
                    price_per_unit: 0,
                    quantity_sold: 0,
                    total_amount: 0
                });
            });
        }
    }
}
