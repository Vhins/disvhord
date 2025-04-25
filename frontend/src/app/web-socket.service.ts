import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
    private readonly SOCKET: Socket = io(environment.WEBSOCKET_IP)

    start(): boolean {
        const privateToken = localStorage.getItem("privateToken") || null
        if (!privateToken) return false

        this.SOCKET.emit('connected', privateToken)
        return true
    }

    emit(eventName: string, data: any): void {
        const socketEvent = this.SOCKET.emit(eventName, data)
        //todo: show error message  --  socketEvent.connected
    }

    on(eventName: string): Observable<any> {
        return new Observable(observer => {
            this.SOCKET.on(eventName, (data: any) => {
                observer.next(data)
            })
    
            return () => {
                this.SOCKET.off(eventName)
            }
        })
    }

}
