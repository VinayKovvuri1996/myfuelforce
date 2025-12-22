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
    users: any[] = []; // In a real app, fetch users
    shiftForm: FormGroup;

    constructor(private api: ApiService, private fb: FormBuilder) {
        this.shiftForm = this.fb.group({
            user_id: ['', Validators.required],
            start_time: [new Date().toISOString().slice(0, 16), Validators.required]
        });
    }

    ngOnInit() {
        // Mock users for now, ideally fetch from API
        this.users = [
            { id: 1, username: 'staff1' },
            { id: 2, username: 'staff2' }
        ];
        this.loadShifts();
    }

    loadShifts() {
        // Fetch all shifts or for the current logged in user's location
        // For now, assuming a global list or filtered by backend
        this.api.get('manpower/shifts').subscribe(data => {
            this.shifts = data;
        }, error => {
            console.error("Error loading shifts", error);
            // Fallback for demo if backend endpoint not ready
            this.shifts = [];
        });
    }

    startShift() {
        if (this.shiftForm.valid) {
            const payload = {
                ...this.shiftForm.value
            };
            this.api.post('manpower/shift/start', payload).subscribe(() => {
                this.loadShifts();
                this.shiftForm.reset({
                    start_time: new Date().toISOString().slice(0, 16)
                });
            });
        }
    }

    endShift(shiftId: number) {
        this.api.post(`manpower/shift/end/${shiftId}`, {}).subscribe(() => {
            this.loadShifts();
        });
    }
}
