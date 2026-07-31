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
    paymentModes = ['Credit', 'Paid'];
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
        const today = new Date().toISOString().slice(0, 10);
        this.salesForm = this.fb.group({
            customer_id: ['', Validators.required],
            product_type: ['Petrol', Validators.required],
            custom_product_name: [''],
            unit: ['Litre', Validators.required],
            price_per_unit: [null, [Validators.required, Validators.min(0.01)]],
            quantity_sold: [null, [Validators.required, Validators.min(0.01)]],
            total_amount: [{ value: null, disabled: true }],
            bill_number: [''],
            bill_date: [today, Validators.required],
            supervisor_signed: [''],
            bill_made_by: [''],
            advance_cash: [0],
            payment_mode: ['Credit', Validators.required]
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
            this.error = 'Please fill required sale and bill fields.';
            return;
        }
        this.saving = true;
        this.error = '';
        this.success = '';
        const formData = this.salesForm.getRawValue();
        const payload = {
            ...formData,
            customer_id: Number(formData.customer_id),
            advance_cash: Number(formData.advance_cash || 0),
            bill_number: formData.bill_number ? String(formData.bill_number).trim() : null,
            supervisor_signed: formData.supervisor_signed ? String(formData.supervisor_signed).trim() : null,
            bill_made_by: formData.bill_made_by ? String(formData.bill_made_by).trim() : null,
            bill_date: formData.bill_date || null
        };
        this.api.post('sales', payload).subscribe({
            next: () => {
                this.saving = false;
                this.success = 'Sale saved.';
                this.loadSales();
                this.loadStock();
                const today = new Date().toISOString().slice(0, 10);
                this.salesForm.reset({
                    product_type: 'Petrol',
                    unit: 'Litre',
                    price_per_unit: null,
                    quantity_sold: null,
                    total_amount: null,
                    custom_product_name: '',
                    customer_id: '',
                    bill_number: '',
                    bill_date: today,
                    supervisor_signed: '',
                    bill_made_by: '',
                    advance_cash: 0,
                    payment_mode: 'Credit'
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
