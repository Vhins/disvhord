import { Injectable } from "@angular/core";
import { CallOption, MediaConnection, Peer } from 'peerjs'
import { WebSocketService } from "./web-socket.service";
import { BehaviorSubject } from "rxjs";
import { InitializeAppApiService } from "./initialize-app-api.service";

@Injectable({
    providedIn: 'root'
})
export class PeerService {
    peer: Peer | null = null
    permissionObtained: boolean = false
    originalMediaDevices: MediaStream | null = null

    _localStream: MediaStream | null = null
    get localStream() { return this._localStream }
    set localStream(localStream) {
        this._localStream = localStream
        this.localStream$.next(localStream)
    }
    videoEnabled: boolean = false
    audioEnabled: boolean = false
    screenshareEnabled: boolean = false

    callsID: Record<number, string> = {}
    callsID$ = new BehaviorSubject<Record<number, string>>({})
    currentCall: MediaConnection | null = null
    infoCall: {call_id: string, user_id: number, chat_user_id: number} | null = null

    localStream$ = new BehaviorSubject<MediaStream | null>(null)
    remoteStream$ = new BehaviorSubject<MediaStream | null>(null)

    constructor(private webSocketService: WebSocketService, private initalizeAppService: InitializeAppApiService) {
        this.webSocketService.on("personal_call_started").subscribe(async data => {
            this.addIncomingCall(data.sender, data.call_id)
            //todo: notification
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

    setFakeAudioAndStream() {
        this.localStream = new MediaStream([this.createEmptyAudioTrack(), this.createEmptyVideoTrack({ width: 640, height: 480 })])
    }

    async setAudioVideo() {
        const stream = this.originalMediaDevices
        if (stream) {
            this.localStream = stream
            this.audioEnabled = true
            this.videoEnabled = true
            if (this.currentCall) {
                this.sendNewTrack()
            }
        }
    }

    async setAudio() {
        const stream = this.originalMediaDevices
        if (stream) {
            this.localStream = new MediaStream([stream.getAudioTracks()[0], this.createEmptyVideoTrack({ width: 640, height: 480 })])
            this.audioEnabled = true
        }
    }

    async setVideo() {
        const stream = this.originalMediaDevices
        if (stream) {
            this.localStream = new MediaStream([this.createEmptyAudioTrack(), stream.getVideoTracks()[0]])
            this.videoEnabled = true
            if (this.currentCall) {
                this.sendNewTrack()
            }
        }
    }

    async setScreenshare() {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        if (stream) {
            this.localStream = stream
            this.screenshareEnabled = true
            if (this.currentCall) {
                this.sendNewTrack()
            }
        }
    }

    async turnOffCamera() {
        if (!this.localStream) return
        this.localStream = new MediaStream([this.localStream.getAudioTracks()[0], this.createEmptyVideoTrack({ width: 640, height: 480 })])
        this.sendNewTrack()
    }

    async turnOffScreenshare() {
        if (!this.localStream) return
        this.localStream = new MediaStream([this.localStream.getAudioTracks()[0], this.createEmptyVideoTrack({ width: 640, height: 480 })])
        this.sendNewTrack()
    }

    sendNewTrack() {
        if (!this.currentCall || !this.currentCall.peerConnection) return

        this.currentCall.peerConnection.getSenders().forEach((sender: RTCRtpSender) => {
            if (sender.track?.kind === "video" && this.localStream) { 
                sender.replaceTrack(this.localStream.getVideoTracks()[0])
            }
            if (sender.track?.kind === "audio" && this.localStream) {
                sender.replaceTrack(this.localStream.getAudioTracks()[0])
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

    startCall(chat_user_id: number) {        
        if (!this.peer) return false

        if (this.currentCall) {
            this.ExitCall()
        } else {
            this.setAudio()
        }

        if (!this.localStream) return false

        this.peer.on('call', call => {
            this.currentCall = call
            this.listenToCallEvents()

            call.answer(this.localStream!)
        })

        this.webSocketService.emit('start_personal_call', {receiver: chat_user_id, sender: this.initalizeAppService.user_interface.user_id, call_id: this.peer.id})

        return true
    }

    enterCall(user_id: number): boolean {
        const call_id = this.callsID[user_id]

        if(!this.peer || !call_id) return false
        
        if (this.currentCall) {
            this.ExitCall()
        } else {
            this.setAudio()
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
    }

    ExitCall() { 
        if (this.currentCall) {
            this.currentCall.close()
            this.currentCall = null
        }
    }

    createEmptyVideoTrack({ width, height }: { width: number, height: number }) {
        const canvas = Object.assign(document.createElement('canvas'), { width, height })
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.fillStyle = "violet"
        ctx.fillRect(0, 0, width, height)
        const videoTrack = canvas.captureStream().getVideoTracks()[0]
        return Object.assign(videoTrack, { enabled: true })
    }

    createEmptyAudioTrack() {
        const ctx = new AudioContext()
        const oscillator = ctx.createOscillator()
        const destination = ctx.createMediaStreamDestination()
        oscillator.connect(destination)
        const audioTrack = destination.stream.getAudioTracks()[0]
        return Object.assign(audioTrack, { enabled: false })
    }
}
