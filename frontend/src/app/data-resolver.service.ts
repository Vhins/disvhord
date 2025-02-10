import { Injectable } from '@angular/core';
import { InitializeAppApiService } from './initialize-app-api.service';
import { WebSocketService } from './web-socket.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataResolver {
    constructor(private initializeAppApiService: InitializeAppApiService, private webSocketService: WebSocketService, private ruoter: Router) {}

    async resolve(): Promise<boolean> {        
        const RESULT = await this.initializeAppApiService.get_basicUserInterfaceData()

        if (RESULT === true) {
            const STARTED = this.webSocketService.start()
            if (STARTED === true) return true
        } else {
            this.ruoter.navigate(['/login'])
        }
        return false
    }
}
