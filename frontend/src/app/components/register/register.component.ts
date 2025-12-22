import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { INDIA_DATA, State, District, Mandal } from '../../data/india-data';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    error: string = '';
    successMessage: string = '';
    generatedId: string = '';

    states: State[] = INDIA_DATA;
    districts: District[] = [];
    mandals: Mandal[] = [];
    showOtherMandal: boolean = false;

    constructor(
        private fb: FormBuilder,
        private api: ApiService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            retail_outlet_name: ['', Validators.required],
            home_address: ['', Validators.required],
            state: ['', Validators.required],
            city: ['', Validators.required], // Keeping city as text or could be dropdown too, user asked for State->District->Mandal
            district: ['', Validators.required],
            mandal: ['', Validators.required],
            other_mandal: [''], // For manual entry
            village: [''], // Optional
            zipcode: ['', Validators.required],
            phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            contact_person: ['', Validators.required],
            supervisor: ['', Validators.required],
            role: ['dealer']
        });
    }

    ngOnInit() {
        // Watch for State changes
        this.registerForm.get('state')?.valueChanges.subscribe(stateName => {
            this.districts = [];
            this.mandals = [];
            this.registerForm.patchValue({ district: '', mandal: '', other_mandal: '' });

            const selectedState = this.states.find(s => s.name === stateName);
            if (selectedState) {
                this.districts = selectedState.districts;
            }
        });

        // Watch for District changes
        this.registerForm.get('district')?.valueChanges.subscribe(districtName => {
            this.mandals = [];
            this.registerForm.patchValue({ mandal: '', other_mandal: '' });

            const selectedDistrict = this.districts.find(d => d.name === districtName);
            if (selectedDistrict) {
                this.mandals = selectedDistrict.mandals;
            }
        });

        // Watch for Mandal changes
        this.registerForm.get('mandal')?.valueChanges.subscribe(mandalName => {
            if (mandalName === 'Other') {
                this.showOtherMandal = true;
                this.registerForm.get('other_mandal')?.setValidators([Validators.required]);
            } else {
                this.showOtherMandal = false;
                this.registerForm.get('other_mandal')?.clearValidators();
                this.registerForm.get('other_mandal')?.setValue('');
            }
            this.registerForm.get('other_mandal')?.updateValueAndValidity();
        });
    }

    onSubmit() {
        if (this.registerForm.valid) {
            const formData = this.registerForm.value;

            // Use other_mandal if "Other" is selected
            if (formData.mandal === 'Other') {
                formData.mandal = formData.other_mandal;
            }
            // Remove temporary field
            delete formData.other_mandal;

            this.api.post('auth/register', formData).subscribe({
                next: (response: any) => {
                    this.generatedId = response.id;
                    this.successMessage = `Registration successful! Your Dealer ID is: ${this.generatedId}`;
                    this.registerForm.reset();
                    this.showOtherMandal = false;
                },
                error: (err) => {
                    this.error = err.error.detail || 'Registration failed';
                }
            });
        } else {
            this.registerForm.markAllAsTouched();
        }
    }
}
