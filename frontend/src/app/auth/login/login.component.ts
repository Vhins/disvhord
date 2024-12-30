import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: '../auth.components.css'
})
export class LoginComponent {

    constructor(private ruoter: Router, private authService: AuthService) {}

    loginform!: FormGroup
    wrongPasswordOrEmail: boolean = false

    ngOnInit(){
        this.loginform = new FormGroup({
            user_email: new FormControl(null, [Validators.required, Validators.email]),
            user_password: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(64)])
        })
    }

    async login(){
        if(await this.authService.login(this.loginform.value.user_email, this.loginform.value.user_password)){
            this.ruoter.navigate(['/app'])
        }else{
            this.wrongPasswordOrEmail = true
        }
    }
}
