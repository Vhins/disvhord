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
        console.debug('isTokenValid', isTokenValid)
        if (!isTokenValid) {
            this.router.navigate(['/login'])
            return false
        } else {
            return true
        }
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
                    console.debug(responseData.message)
                    return true
                }else{
                    console.debug(responseData.message)
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
