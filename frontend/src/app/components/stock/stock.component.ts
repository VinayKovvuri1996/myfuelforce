import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { NavBrandComponent } from '../nav-brand/nav-brand.component';

@Component({
    selector: 'app-stock',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, NavBrandComponent],
    templateUrl: './stock.component.html',
    styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
    summary: any = { rows: [] };
    error = '';
    success = '';
    fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Power', 'XP95'];
    units = ['Litre', 'Kilogram', 'Cubic metre'];

    openingForm: FormGroup;
    receiptForm: FormGroup;

    constructor(private api: ApiService, private fb: FormBuilder) {
        this.openingForm = this.fb.group({
            fuel_type: ['Petrol', Validators.required],
            opening_quantity: [0, [Validators.required, Validators.min(0)]],
            capacity: [0, [Validators.min(0)]],
            unit: ['Litre', Validators.required],
            price_per_unit: [null, [Validators.required, Validators.min(0.01)]]
        });
        this.receiptForm = this.fb.group({
            fuel_type: ['Petrol', Validators.required],
            quantity: [0, [Validators.required, Validators.min(0.01)]],
            unit: ['Litre', Validators.required],
            note: ['']
        });
    }

    ngOnInit() {
        this.load();
    }

    load() {
        this.api.get('inventory/today').subscribe({
            next: (data) => { this.summary = data; this.error = ''; },
            error: (err) => { this.error = err?.error?.detail || 'Failed to load stock'; }
        });
    }

    saveOpening() {
        if (!this.openingForm.valid) return;
        const v = this.openingForm.value;
        this.api.post('inventory', {
            fuel_type: v.fuel_type,
            opening_quantity: v.opening_quantity,
            quantity: v.opening_quantity,
            capacity: v.capacity,
            unit: v.unit,
            price_per_unit: Number(v.price_per_unit)
        }).subscribe({
            next: () => {
                this.success = `Opening stock saved for ${v.fuel_type}`;
                this.load();
            },
            error: (err) => { this.error = err?.error?.detail || 'Could not save opening stock'; }
        });
    }

    addReceipt() {
        if (!this.receiptForm.valid) return;
        this.api.post('inventory/receipt', this.receiptForm.value).subscribe({
            next: () => {
                this.success = 'Tank receipt recorded';
                this.receiptForm.patchValue({ quantity: 0, note: '' });
                this.load();
            },
            error: (err) => { this.error = err?.error?.detail || 'Could not save receipt'; }
        });
    }
}
