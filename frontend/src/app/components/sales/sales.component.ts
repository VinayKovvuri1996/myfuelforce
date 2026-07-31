import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule, ActivatedRoute } from '@angular/router';

const MEMORY_KEY = 'fuelforce_sales_field_memory';

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './sales.component.html',
    styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit, OnDestroy {
    sales: any[] = [];
    customers: any[] = [];
    employees: any[] = [];
    stockRows: any[] = [];
    salesForm: FormGroup;
    selectedSale: any = null;
    productTypes = ['Petrol', 'Diesel', 'CNG', 'Power', 'XP95', 'Other'];
    paymentModes = ['Credit', 'Cash', 'Cheque', 'Bank Transfer', 'RTGS', 'PhonePe', 'GPay'];
    units = [
        { value: 'Litre', label: 'Litre (L)' },
        { value: 'Kilogram', label: 'Kilogram (kg)' },
        { value: 'Piece', label: 'Piece (pcs)' },
        { value: 'Cubic metre', label: 'Cubic metre (m³)' }
    ];
    /** Suggestions remembered from earlier entries + sales history */
    memory: Record<string, string[]> = {
        bill_number: [],
        custom_product_name: [],
        supervisor_signed: [],
        transaction_ref: [],
        cheque_number: []
    };
    showOtherFields = false;
    showChequeFields = false;
    showTxnFields = false;
    error = '';
    success = '';
    saving = false;
    private refreshTimer: ReturnType<typeof setInterval> | null = null;

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
            bill_made_by: ['', Validators.required],
            advance_cash: [0],
            payment_mode: ['Credit', Validators.required],
            cheque_number: [''],
            transaction_ref: ['']
        });
    }

    ngOnInit() {
        this.loadMemory();
        this.loadCustomers();
        this.loadEmployees();
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

        this.salesForm.get('payment_mode')?.valueChanges.subscribe(mode => {
            this.updatePaymentFieldRules(mode);
        });
        this.updatePaymentFieldRules(this.salesForm.value.payment_mode);

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

        // Keep manpower dropdown fresh while page is open
        this.refreshTimer = setInterval(() => this.loadEmployees(), 20000);
    }

    ngOnDestroy() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }

    @HostListener('window:focus')
    onWindowFocus() {
        this.loadEmployees();
        this.loadSales();
    }

    employeeOptions(): { label: string; value: string }[] {
        return this.employees
            .filter(e => e.is_active !== false)
            .map(e => {
                const name = `${e.first_name || ''} ${e.last_name || ''}`.trim();
                const role = e.role ? ` (${e.role})` : '';
                return { label: `${name}${role}`, value: name };
            })
            .filter(x => x.value);
    }

    suggestionsFor(field: string): string[] {
        const fromMemory = this.memory[field] || [];
        const fromSales = this.sales
            .map(s => (s?.[field] ? String(s[field]).trim() : ''))
            .filter(Boolean);
        return Array.from(new Set([...fromMemory, ...fromSales])).slice(0, 30);
    }

    customerName(id: number): string {
        const c = this.customers.find(x => x.id === id || String(x.id) === String(id));
        return c?.name || '—';
    }

    isSettledMode(mode: string): boolean {
        return !!mode && mode !== 'Credit';
    }

    defaultUnitFor(product: string): string {
        switch (product) {
            case 'CNG': return 'Kilogram';
            case 'Other': return 'Piece';
            default: return 'Litre';
        }
    }

    updatePaymentFieldRules(mode: string) {
        this.showChequeFields = mode === 'Cheque';
        this.showTxnFields = ['Bank Transfer', 'RTGS', 'PhonePe', 'GPay', 'Cheque', 'Cash'].includes(mode);

        const chequeCtrl = this.salesForm.get('cheque_number');
        const txnCtrl = this.salesForm.get('transaction_ref');

        if (mode === 'Cheque') {
            chequeCtrl?.setValidators([Validators.required]);
        } else {
            chequeCtrl?.clearValidators();
        }

        if (['Bank Transfer', 'RTGS', 'PhonePe', 'GPay'].includes(mode)) {
            txnCtrl?.setValidators([Validators.required]);
        } else {
            txnCtrl?.clearValidators();
        }

        chequeCtrl?.updateValueAndValidity({ emitEvent: false });
        txnCtrl?.updateValueAndValidity({ emitEvent: false });
    }

    loadMemory() {
        try {
            const raw = localStorage.getItem(MEMORY_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            Object.keys(this.memory).forEach(k => {
                if (Array.isArray(parsed?.[k])) {
                    this.memory[k] = parsed[k].filter((x: any) => typeof x === 'string' && x.trim()).slice(0, 30);
                }
            });
        } catch {
            /* ignore */
        }
    }

    rememberFields(values: Record<string, any>) {
        const keys = Object.keys(this.memory);
        keys.forEach(k => {
            const v = values[k] != null ? String(values[k]).trim() : '';
            if (!v) return;
            const list = [v, ...(this.memory[k] || []).filter(x => x !== v)];
            this.memory[k] = list.slice(0, 30);
        });
        try {
            localStorage.setItem(MEMORY_KEY, JSON.stringify(this.memory));
        } catch {
            /* ignore */
        }
    }

    loadCustomers() {
        this.api.get('customers').subscribe({
            next: (data) => { this.customers = Array.isArray(data) ? data : []; },
            error: () => { this.error = 'Could not load customers'; }
        });
    }

    loadEmployees() {
        this.api.get('manpower/employees').subscribe({
            next: (data) => { this.employees = Array.isArray(data) ? data : []; },
            error: () => { /* keep previous list */ }
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
            this.error = 'Please fill required sale, staff and payment fields.';
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
            cheque_number: formData.cheque_number ? String(formData.cheque_number).trim() : null,
            transaction_ref: formData.transaction_ref ? String(formData.transaction_ref).trim() : null,
            bill_date: formData.bill_date || null
        };
        this.api.post('sales', payload).subscribe({
            next: () => {
                this.saving = false;
                this.success = 'Sale saved.';
                this.rememberFields(payload);
                this.loadSales();
                this.loadStock();
                this.loadEmployees();
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
                    payment_mode: 'Credit',
                    cheque_number: '',
                    transaction_ref: ''
                });
                this.updatePaymentFieldRules('Credit');
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
