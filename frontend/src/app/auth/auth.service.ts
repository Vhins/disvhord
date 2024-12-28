import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    IP: string
    
    constructor(private router: Router) {
        this.IP = "localhost:3333"
    }

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
        const apiURL = `http://${this.IP}/userCreateAccount`
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
            console.debug('Errore client fetch: ', error)
            return {return: false, code: 0}
        })
    }

    public async checkTokenValidity(): Promise<boolean> {
        const privateToken: string | null = localStorage.getItem("privateToken")
        const user_id: string | null = localStorage.getItem("user_id")
        
        if(privateToken != null && user_id != null){

            const apiURL = new URL(`http://${this.IP}/checkUserTokenValidity`)
            const request: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify( { "privateToken": privateToken, "user_id": user_id } )
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

    public removeDataLocalStorage(): void{
        localStorage.removeItem("privateToken")
        localStorage.removeItem("user_id")
    }
}
