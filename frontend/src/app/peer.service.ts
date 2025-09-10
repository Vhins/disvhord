import { Injectable } from "@angular/core";
import { MediaConnection, Peer } from 'peerjs'
import { WebSocketService } from "./web-socket.service";
import { BehaviorSubject } from "rxjs";
import { InitializeAppApiService } from "./initialize-app-api.service";
import { NotificationsService } from "./notifications.service";

@Injectable({
    providedIn: 'root'
})
export class PeerService {
    private peer: Peer | null = null
    protected permissionObtained: boolean = false
    private originalMediaDevices: MediaStream | null = null

    private _localStream: MediaStream | null = null
    get localStream() { return this._localStream }
    set localStream(localStream) {
        this._localStream = localStream
        this.localStream$.next(localStream)
    }
    streamVideoTrack: 'camera' | 'screenshare' | null = null
    cameraEnabled: boolean = false
    audioEnabled: boolean = true
    // screenshareEnabled: boolean = false

    readonly callsID: Record<number, string> = {}
    readonly callsID$ = new BehaviorSubject<Record<number, string>>({})
    private currentCall: MediaConnection | null = null
    infoCall: {call_id: string, user_id: number, chat_user_id: number} | null = null

    readonly localStream$ = new BehaviorSubject<MediaStream | null>(null)
    readonly remoteStream$ = new BehaviorSubject<MediaStream | null>(null)
    readonly closeCall$ = new BehaviorSubject<boolean | null>(null)
    
    constructor(private webSocketService: WebSocketService, private initalizeAppService: InitializeAppApiService, private notificationsService: NotificationsService) {
        this.notificationsService.incomingCall$.subscribe( data => {
            if (!data) return
            this.addIncomingCall(data.sender, data.call_id)
        })
    }

    connectToPeerServer(): boolean {
        try {
            const my_user_id = this.initalizeAppService.user_interface.user_id.toString()
            this.peer = new Peer(my_user_id, { host: 'localhost', port: 3331, path: 'peerjs', secure: false }) // port: 443  secure: true  host: server_ip
            return true
        }
        catch {
            return false
        }
    }

    async requestVideoAudioPermission(): Promise<boolean> {
        try {
            this.originalMediaDevices = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            this.permissionObtained = true
            return true
        } catch {
            this.permissionObtained = false
            return false
        }
    }


    async setAudioVideo() {
        const stream = this.originalMediaDevices
        if (stream) {
            this.localStream = stream
            this.localStream.getAudioTracks()[0].enabled = this.audioEnabled
            this.localStream.getVideoTracks()[0].enabled = this.cameraEnabled
            if (this.currentCall) {
                this.sendNewTrack('video')
            }
        }
    }

    async toggleCamera(toggle: boolean) {
        if (this.localStream) {
            if (toggle === true && this.originalMediaDevices) {
                this.streamVideoTrack = 'camera'
                this.localStream = this.originalMediaDevices
            } else {
                this.streamVideoTrack = null
            }
            this.localStream.getVideoTracks()[0].enabled = toggle
        }
        this.cameraEnabled = toggle
    }
    async toggleAudio(toggle: boolean) {
        if (this.localStream) { 
            this.localStream.getAudioTracks()[0].enabled = toggle
        }
        this.cameraEnabled = toggle
    }
    // async toggleScreenshare(toggle: boolean) {
    //     if (this.localStream) {
    //         if (toggle === true) {
    //             this.streamVideoTrack = 'screenshare'
    //             this.localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
    //         } else {
    //             this.localStream = this.originalMediaDevices
    //             if (this.cameraEnabled) {
    //                 this.streamVideoTrack = 'camera'
    //             } else {
    //                 this.streamVideoTrack = 'camera'
    //             }
    //             this.streamVideoTrack = null
    //         }

    //         this.localStream!.getVideoTracks()[0].enabled = toggle
    //         this.sendNewTrack('video')
    //     }
    //     this.screenshareEnabled = toggle
    // }

    sendNewTrack(type: 'video' | 'audio') {
        if (!this.currentCall || !this.currentCall.peerConnection) return

        this.currentCall.peerConnection.getSenders().forEach((sender: RTCRtpSender) => {
            if (sender.track?.kind === type && this.localStream) { 
                sender.replaceTrack(type === 'video' ? this.localStream.getVideoTracks()[0] : this.localStream.getAudioTracks()[0])
            }
        })
    }


    addIncomingCall(user_id: number, call_id: string) {
        this.callsID[user_id] = call_id
        this.callsID$.next(this.callsID)
        console.debug('chiamata da questo utente!', user_id)
    }

    removeOutgoingCall(user_id: number) {
        delete this.callsID[user_id]
        this.callsID$.next(this.callsID)
        console.debug('rimossa chiamata da utente!', user_id)
    }

    startCall(chat_user_id: number, user_name: string, user_logo: string): boolean {        
        if (!this.peer) return false

        if (this.currentCall) {
            this.ExitCall()
        } else {
            this.setAudioVideo()
        }

        if (!this.localStream) return false

        this.peer.on('call', call => {
            this.currentCall = call
            this.listenToCallEvents()

            call.answer(this.localStream!)
        })

        this.webSocketService.emit('start_personal_call', {receiver: chat_user_id, sender: this.initalizeAppService.user_interface.user_id, call_id: this.peer.id, name: user_name, logo: user_logo})
        this.webSocketService.on('personal_call_not_started')

        return true
    }

    enterCall(user_id: number): boolean {
        const call_id = this.callsID[user_id]

        if(!this.peer || !call_id) return false
        
        if (this.currentCall) {
            this.ExitCall()
        } else {
            this.setAudioVideo()
        }

        const options = {
            constraints: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true,
            },
            sdpTransform: (sdp: string) => {
                return sdp.replace(
                    'a=fmtp:111 minptime=10;useinbandfec=1',
                    'a=fmtp:111 ptime=5;useinbandfec=1;stereo=1;maxplaybackrate=48000;maxaveragebitrat=128000;sprop-stereo=1',
                )
            },
        }
        this.currentCall = this.peer.call(call_id, this.localStream!, options)
        this.listenToCallEvents()

        return true
    }

    listenToCallEvents() {
        if (!this.currentCall) return

        this.currentCall.on('error', error => { console.error('error', error) })    
        this.currentCall.on('stream', remoteStream => { this.remoteStream$.next(remoteStream) })
        this.currentCall.on('close', () => { console.debug('chiamata terminata') })

        this.webSocketService.on('closed_personal_call').subscribe(call => {
            this.closeCall$.next(true)
        })
    }

    ExitCall() {
        if (this.currentCall) {
            this.webSocketService.emit('close_personal_call', this.infoCall?.chat_user_id)
            this.currentCall.close()
            this.currentCall = null
        }
    }

}
