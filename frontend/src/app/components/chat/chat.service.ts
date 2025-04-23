import { Injectable, Signal, signal } from "@angular/core";
import { InitializeAppApiService } from "../../initialize-app-api.service";
import { BehaviorSubject, single } from "rxjs";
import { NotificationsService } from "../../notifications.service";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    user_id: number //* personal userid
    chat_id!: number
    chat_user_id!: number
    chat_user_isFriend = signal<boolean | null>(null)
    chat_user_isBlocked!: boolean
    chat_user_friendRequestSend!: boolean
    chat_user_friendRequestSendAcceptOrDecline!: boolean
    users_info: {[key: number]: {id: number, name: string, img: string}} = {}

    constructor(private initializeAppApiService: InitializeAppApiService, private notificationsService: NotificationsService) {
        this.user_id = this.initializeAppApiService.user_interface.user_id
        this.setMyInfo()

        this.notificationsService.FriendAdded$.subscribe( data => {
            if (!data) return
            else if (data === this.chat_user_id) {
                this.chat_user_friendRequestSend = false
                this.chat_user_isFriend.set(true)
            }
        })
        this.notificationsService.FriendRemoved$.subscribe( data => {
            if (!data) return
            else if (data === this.chat_user_id) {
                this.chat_user_isFriend.set(false)
            }
        })
    }

    currentEditingMessageText$ = new BehaviorSubject<string>('')
    
    callThisChat$ = new BehaviorSubject<Boolean>(false)
    callThisChatNow(): void {
        this.callThisChat$.next(true)
    }


    setMyInfo() {
        this.users_info[this.user_id] = {
            id: this.user_id, 
            name: this.initializeAppApiService.user_interface.user_displayName, 
            img: this.initializeAppApiService.user_interface.user_logo
        }
    }

    setThisChatID(chat_id: number | string) {
        console.log('chat_id', chat_id)
        if (typeof chat_id === "number" && !isNaN(chat_id)) {
            this.chat_id = chat_id
            this.chat_user_id = this.initializeAppApiService.user_interface.chats.find(chat => chat.chat_id == this.chat_id)!.chat_user_id
            
            this.chat_user_isFriend.set(this.initializeAppApiService.user_interface.friends.some(user => user.user_id === this.chat_user_id))
            this.chat_user_isBlocked = this.initializeAppApiService.user_interface.blocked.some(user => user === this.chat_user_id)
            this.chat_user_friendRequestSend = this.initializeAppApiService.user_interface.friend_requests_sent.some(user => user === this.chat_user_id)
            this.chat_user_friendRequestSendAcceptOrDecline = this.initializeAppApiService.user_interface.notifications.friend_request.some(user => user.user_id === this.chat_user_id)
        } else {
            console.debug('chat personale')
        }
    }


    editingMessageMode = signal<boolean>(false)

    private _currentIDMessageEditing: number | null = null
    get currentIDMessageEditing(): number | null { return this._currentIDMessageEditing || null }
    set currentIDMessageEditing(bool: number) {
        this._currentIDMessageEditing = bool
    }


    allegatingLink = signal<boolean>(false)

    private _allegatedLink: string = ""
    get allegatedLink() { return this._allegatedLink }
    set allegatedLink(newLink: string) {
        this._allegatedLink = newLink
    }

    linkType(url: string | null | undefined): 'image' | 'video' | 'audio' | 'link' {
        if (!!url && ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp'].some(ext => url.endsWith(ext))) {
            return 'image'
        } else if(!!url && ['.mp4', '.webm', '.mov', '.mkv'].some(ext => url.endsWith(ext))) {
            return 'video'
        } else if(!!url && ['.mp3', '.ogg', '.wav', '.aac', '.flac'].some(ext => url.endsWith(ext))) {
            return 'audio'
        } else {
            return 'link'
        }
    }
}
