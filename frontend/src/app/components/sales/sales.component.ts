import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule, ActivatedRoute } from '@angular/router';

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
    stockRows: any[] = [];
    salesForm: FormGroup;
    selectedSale: any = null;
    productTypes = ['Petrol', 'Diesel', 'CNG', 'Power', 'XP95', 'Other'];
    units = [
        { value: 'Litre', label: 'Litre (L)' },
        { value: 'Kilogram', label: 'Kilogram (kg)' },
        { value: 'Piece', label: 'Piece (pcs)' },
        { value: 'Cubic metre', label: 'Cubic metre (m³)' }
    ];
    showOtherFields = false;
    error = '';
    success = '';
    saving = false;

    constructor(
        private api: ApiService,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        this.salesForm = this.fb.group({
            customer_id: ['', Validators.required],
            product_type: ['Petrol', Validators.required],
            custom_product_name: [''],
            unit: ['Litre', Validators.required],
            price_per_unit: [null, [Validators.required, Validators.min(0.01)]],
            quantity_sold: [null, [Validators.required, Validators.min(0.01)]],
            total_amount: [{ value: null, disabled: true }]
        });
    }

    ngOnInit() {
        this.loadCustomers();
        this.loadSales();
        this.loadStock();

        this.route.queryParams.subscribe(params => {
            if (params['customerId']) {
                this.salesForm.patchValue({ customer_id: params['customerId'] });
            }
        });

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

    customerName(id: number): string {
        const c = this.customers.find(x => x.id === id || String(x.id) === String(id));
        return c?.name || '—';
    }

    defaultUnitFor(product: string): string {
        switch (product) {
            case 'CNG': return 'Kilogram';
            case 'Other': return 'Piece';
            default: return 'Litre';
        }
    }

    loadCustomers() {
        this.api.get('customers').subscribe({
            next: (data) => { this.customers = Array.isArray(data) ? data : []; },
            error: () => { this.error = 'Could not load customers'; }
        });
    }

    loadSales() {
        this.api.get('sales').subscribe({
            next: (data) => { this.sales = Array.isArray(data) ? data : []; },
            error: () => { this.error = 'Could not load sales'; }
        });
    }

    loadStock() {
        this.api.get('inventory/today').subscribe({
            next: (data) => { this.stockRows = data?.rows || []; },
            error: () => { this.stockRows = []; }
        });
    }

    openDetails(sale: any) {
        this.selectedSale = sale;
    }

    closeDetails() {
        this.selectedSale = null;
    }

    calculateTotal(values: any) {
        const price = parseFloat(values.price_per_unit);
        const quantity = parseFloat(values.quantity_sold);
        if (isNaN(price) || isNaN(quantity)) {
            this.salesForm.patchValue({ total_amount: null }, { emitEvent: false });
            return;
        }
        const total = price * quantity;
        if (this.salesForm.get('total_amount')?.value !== total) {
            this.salesForm.patchValue({ total_amount: total }, { emitEvent: false });
        }
    }

    onSubmit() {
        if (!this.salesForm.valid) {
            this.error = 'Please fill customer, rate and quantity.';
            return;
        }
        this.saving = true;
        this.error = '';
        this.success = '';
        const formData = this.salesForm.getRawValue();
        this.api.post('sales', formData).subscribe({
            next: () => {
                this.saving = false;
                this.success = 'Sale saved.';
                this.loadSales();
                this.loadStock();
                this.salesForm.reset({
                    product_type: 'Petrol',
                    unit: 'Litre',
                    price_per_unit: null,
                    quantity_sold: null,
                    total_amount: null,
                    custom_product_name: '',
                    customer_id: ''
                });
            },
            error: (err) => {
                this.saving = false;
                this.error = typeof err?.error?.detail === 'string'
                    ? err.error.detail
                    : 'Could not save sale.';
            }
        });
    }
}
