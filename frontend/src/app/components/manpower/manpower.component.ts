import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule } from '@angular/router';
import { NavBrandComponent } from '../nav-brand/nav-brand.component';

@Component({
    selector: 'app-manpower',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, NavBrandComponent],
    templateUrl: './manpower.component.html',
    styleUrls: ['./manpower.component.css']
})
export class ManpowerComponent implements OnInit {
    employees: any[] = [];
    shifts: any[] = [];
    roles: string[] = [
        'Manager',
        'Supervisor',
        'Cashier',
        'Pump Boy',
        'Sweeper',
        'Helper',
        'Driver',
        'Co-Driver'
    ];
    employeeForm: FormGroup;
    shiftForm: FormGroup;
    showEmployeeForm = true;
    selectedEmployee: any = null;
    selectedShift: any = null;
    error = '';
    success = '';
    savingEmployee = false;
    savingShift = false;

    constructor(private api: ApiService, private fb: FormBuilder) {
        this.employeeForm = this.fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            contact_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            date_of_joining: [''],
            address: [''],
            role: ['Helper', Validators.required]
        });
        this.shiftForm = this.fb.group({
            employee_id: ['', Validators.required],
            start_time: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadEmployees();
        this.loadShifts();
        this.api.get('manpower/roles').subscribe({
            next: (data) => {
                if (Array.isArray(data) && data.length) {
                    this.roles = data;
                }
            },
            error: () => { /* keep defaults */ }
        });
    }

    fullName(emp: any): string {
        if (!emp) return '—';
        return `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || '—';
    }

    activeEmployees(): any[] {
        return this.employees.filter(e => e.is_active !== false);
    }

    loadEmployees() {
        this.api.get('manpower/employees').subscribe({
            next: (data) => {
                this.employees = Array.isArray(data) ? data : [];
                this.error = '';
            },
            error: (err) => {
                this.error = err?.status === 401
                    ? 'Session expired. Please login again.'
                    : (err?.error?.detail || 'Could not load employees');
                this.employees = [];
            }
        });
    }

    loadShifts() {
        this.api.get('manpower/shifts').subscribe({
            next: (data) => { this.shifts = Array.isArray(data) ? data : []; },
            error: (err) => {
                this.error = err?.status === 401
                    ? 'Session expired. Please login again.'
                    : (err?.error?.detail || 'Could not load shifts');
                this.shifts = [];
            }
        });
    }

    toggleEmployeeForm() {
        this.showEmployeeForm = !this.showEmployeeForm;
        this.error = '';
        this.success = '';
        if (!this.showEmployeeForm) {
            this.employeeForm.reset({ role: 'Helper', first_name: '', last_name: '', contact_number: '', date_of_joining: '', address: '' });
        }
    }

    openEmployeeDetails(emp: any) {
        this.selectedEmployee = emp;
        this.selectedShift = null;
    }

    closeEmployeeDetails() {
        this.selectedEmployee = null;
    }

    openShiftDetails(shift: any) {
        this.selectedShift = shift;
        this.selectedEmployee = null;
    }

    closeShiftDetails() {
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

    saveEmployee() {
        if (!this.employeeForm.valid) {
            this.error = 'Enter first name, last name, role, and a 10-digit contact number.';
            return;
        }
        this.savingEmployee = true;
        this.error = '';
        this.success = '';
        const raw = this.employeeForm.value;
        const payload = {
            first_name: String(raw.first_name).trim(),
            last_name: String(raw.last_name).trim(),
            contact_number: raw.contact_number ? String(raw.contact_number).trim() : null,
            date_of_joining: raw.date_of_joining || null,
            address: raw.address ? String(raw.address).trim() : null,
            role: raw.role,
            is_active: true
        };
        this.api.post('manpower/employees', payload).subscribe({
            next: (created) => {
                this.savingEmployee = false;
                this.success = `Employee "${this.fullName(created)}" added.`;
                this.loadEmployees();
                this.employeeForm.reset({ role: 'Helper', first_name: '', last_name: '', contact_number: '', date_of_joining: '', address: '' });
                this.showEmployeeForm = true;
            },
            error: (err) => {
                this.savingEmployee = false;
                this.error = typeof err?.error?.detail === 'string'
                    ? err.error.detail
                    : 'Could not save employee';
            }
        });
    }

    startShift() {
        if (!this.shiftForm.valid) {
            this.error = 'Select an employee and start time.';
            return;
        }
        this.savingShift = true;
        this.error = '';
        this.success = '';
        const raw = this.shiftForm.value;
        const payload = {
            employee_id: Number(raw.employee_id),
            start_time: raw.start_time ? new Date(raw.start_time).toISOString() : null
        };
        this.api.post('manpower/shift/start', payload).subscribe({
            next: () => {
                this.savingShift = false;
                this.success = 'Shift started';
                this.loadShifts();
                this.shiftForm.reset({ employee_id: '', start_time: '' });
            },
            error: (err) => {
                this.savingShift = false;
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
                    this.closeShiftDetails();
                }
            },
            error: (err) => {
                this.error = err?.error?.detail || 'Could not end shift';
            }
        });
    }
}
