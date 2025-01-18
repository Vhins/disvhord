import { Injectable } from "@angular/core";
import { Peer } from 'peerjs'
import { CallComponent } from "./components/call/call.component";

@Injectable({
    providedIn: 'root'
})
export class PeerService {
    peer!: Peer

    localStream!: any
    videoEnabled: any = true
    audioEnabled: any = true
    currentCall!: any
    stream!: any

    callComponent!: CallComponent

    constructor() {
        this.startConnection()
    }

    setCallComponent(component: CallComponent) {
        this.callComponent = component
    }


    startConnection() {
        console.log('connecting to peer server')
        this.peer = new Peer('', { host: '82.50.57.175', port: 80, secure: false }) // port: 443  secure: true

        this.peer.on('open', id => {
            console.log('id peer:', id)
        })
    }

    async requestPermission() {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        this.localStream = this.stream
        this.callComponent.localStream.srcObject = this.stream

        this.peer.on('call', call => {
            call.answer(this.stream)
            this.currentCall = call

            // call.on('stream', remoteStream => {
            // this.callComponent.remoteStream.srcObject = remoteStream
            // })
        })
    }

    startCall(callid: any) {
        const peerId = callid
        const call = this.peer.call(peerId, this.stream)
        this.currentCall = call;
        call.on('stream', remoteStream => {
            this.callComponent.remoteStream.srcObject = remoteStream
        })
    }

    stopCall() {
        if (this.currentCall) {
            this.currentCall.close()
            this.currentCall = null
            this.callComponent.remoteStream.srcObject = null
            alert('disconnesso');
        } else {
            alert('nessuna chiamata');
        }
      }

}
