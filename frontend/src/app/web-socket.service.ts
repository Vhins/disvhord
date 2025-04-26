import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
    private readonly SOCKET: Socket = io(environment.WEBSOCKET_IP)
    private readonly ruoter: Router = inject(Router)

    start(): boolean {
        const privateToken = localStorage.getItem("privateToken") || null
        if (!privateToken) return false

        this.SOCKET.emit('connected', privateToken)
        return true
    }

    emit(eventName: string, data: any): void {
        const socketEvent = this.SOCKET.emit(eventName, data)
        if (socketEvent.connected === false) {
            this.ruoter.navigate(['/'])
        }
    }

    on(eventName: string): Observable<any> {
        return new Observable(observer => {
            const handler = (data: any) => observer.next(data)
            this.SOCKET.on(eventName, handler)
    
            return () => this.SOCKET.off(eventName, handler)
        })
    }

}
