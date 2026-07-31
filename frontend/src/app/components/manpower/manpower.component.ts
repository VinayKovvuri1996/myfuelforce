import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-manpower',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './manpower.component.html',
    styleUrls: ['./manpower.component.css']
})
export class ManpowerComponent implements OnInit {
    shifts: any[] = [];
    shiftForm: FormGroup;
    selectedShift: any = null;
    error = '';
    success = '';
    saving = false;

    constructor(private api: ApiService, private fb: FormBuilder) {
        this.shiftForm = this.fb.group({
            user_id: ['', Validators.required],
            start_time: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadShifts();
    }

    loadShifts() {
        this.api.get('manpower/shifts').subscribe({
            next: (data) => { this.shifts = Array.isArray(data) ? data : []; this.error = ''; },
            error: (err) => {
                this.error = err?.status === 401
                    ? 'Session expired. Please login again.'
                    : (err?.error?.detail || 'Could not load shifts');
                this.shifts = [];
            }
        });
    }

    openDetails(shift: any) {
        this.selectedShift = shift;
    }

    closeDetails() {
        this.selectedShift = null;
    }

    durationLabel(shift: any): string {
        if (!shift?.start_time) return '—';
        const start = new Date(shift.start_time).getTime();
        const end = shift.end_time ? new Date(shift.end_time).getTime() : Date.now();
        const mins = Math.max(0, Math.round((end - start) / 60000));
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }

    startShift() {
        if (!this.shiftForm.valid) {
            this.error = 'Enter employee name and start time.';
            return;
        }
        this.saving = true;
        this.error = '';
        const raw = this.shiftForm.value;
        const payload = {
            user_id: String(raw.user_id).trim(),
            start_time: raw.start_time ? new Date(raw.start_time).toISOString() : null
        };
        this.api.post('manpower/shift/start', payload).subscribe({
            next: () => {
                this.saving = false;
                this.success = 'Shift started';
                this.loadShifts();
                this.shiftForm.reset({ user_id: '', start_time: '' });
            },
            error: (err) => {
                this.saving = false;
                this.error = err?.status === 401
                    ? 'Session expired. Please login again.'
                    : (err?.error?.detail || 'Could not start shift');
            }
        });
    }

    endShift(shiftId: number, event?: Event) {
        event?.stopPropagation();
        this.api.post(`manpower/shift/end/${shiftId}`, {}).subscribe({
            next: () => {
                this.success = 'Shift ended';
                this.loadShifts();
                if (this.selectedShift?.id === shiftId) {
                    this.closeDetails();
                }
            },
            error: (err) => {
                this.error = err?.error?.detail || 'Could not end shift';
            }
        });
    }
}
