import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: '../auth.components.css'
})
export class RegisterComponent {
    registerform!: FormGroup

    handleAlreadyInUse: boolean = false
    emailAlreadyInUse: boolean = false
    termsAccepted: boolean = false

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(){
        this.registerform = new FormGroup({
            user_handle: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(32), Validators.pattern('[a-zA-Z0-9_.-]*$')]),
            user_displayName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(32), Validators.pattern(/^[a-zA-Z0-9_.-]+( [a-zA-Z0-9_.-]+)*$/)]),
            user_email: new FormControl(null, [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]),
            user_password: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(64)])
        })
    }

    acceptTerms() {
        this.termsAccepted = !this.termsAccepted
    }
    
    async createAccount() {
        this.emailAlreadyInUse = false
        this.emailAlreadyInUse = false

        const success = await this.authService.tryCreateAccount(this.registerform.value)
        if (success.return) {
            this.router.navigate(['/login'])
        } else {
            if(success.code === 1){
                this.emailAlreadyInUse = true
            }else if(success.code === 2){
                this.handleAlreadyInUse = true
            }
        }
    }
}
