import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    constructor(private router: Router) {}

    public async isLoggedIn(): Promise<boolean> {
        const isTokenValid: boolean = await this.checkTokenValidity()

        if (!isTokenValid) {
            this.router.navigate(['/login'])
            return false
        } else {
            return true
        }
    }

    
    public async tryCreateAccount(accountData: object): Promise<{return: boolean, code: number}> {
        const apiURL = `http://${environment.SERVER_IP}/userCreateAccount`
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accountData)
        }


        return await fetch(apiURL, request)
        .then(async response =>{
            const responseData = await response.json()
            if(response.ok){
                localStorage.setItem("privateToken", responseData.token)
                localStorage.setItem("user_id", responseData.id)
                return {return: true, code: 0}
            }else if(response.status === 400){
                if (responseData.message === 'account non creato, email gia registrata') {
                    return {return: false, code: 1}
                }else {
                    return {return: false, code: 2}
                }
            }
            
            return {return: false, code: 0}
        })
        .catch(error =>{
            console.error(error)
            return {return: false, code: 0}
        })
    }

    public async login(email: string, password: string): Promise<boolean>{
        const apiURL = `http://${environment.SERVER_IP}/userLogin`
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( { "email": email, "password": password } )
        }

        return fetch(apiURL, request)
        .then(async response =>{

            const responseData = await response.json()

            if(response.ok){    
                localStorage.setItem("privateToken", responseData.token)
                localStorage.setItem("user_id", responseData.id)
                return true
            }else{
                return false
            }
        })
        .catch(error => {     
            console.error(error)
            return false
        })
        
    }
    
    public async checkTokenValidity(): Promise<boolean> {
        const privateToken: string | null = localStorage.getItem("privateToken")
        const user_id: string | null = localStorage.getItem("user_id")
        
        if(privateToken != null && user_id != null){
            
            const apiURL = new URL(`http://${environment.SERVER_IP}/checkUserTokenValidity`)
            const request: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${privateToken}`
                },
                body: JSON.stringify( { "user_id": user_id } )
            }
            
            return await fetch(apiURL, request)
            .then(async response => {
                const responseData = await response.json()
                if(response.ok){
                    return true
                }else{
                    this.removeDataLocalStorage()
                    return false
                }
            })
        }
        
        
        this.removeDataLocalStorage()
        return false
    }
    
    public logout(): void{
        this.removeDataLocalStorage()
    }

    public removeDataLocalStorage(): void{
        localStorage.removeItem("privateToken")
        localStorage.removeItem("user_id")
    }
}
