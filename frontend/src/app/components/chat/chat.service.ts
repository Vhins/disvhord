import { Injectable, signal } from "@angular/core";
import { InitializeAppApiService } from "../../initialize-app-api.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    user_id: number //* personal userid
    chat_id!: number
    chat_user_id!: number
    users_info: {[key: number]: {id: number, name: string, img: string}} = {}

    constructor(private initializeAppApiService: InitializeAppApiService) {
        this.user_id = this.initializeAppApiService.user_interface.user_id
        this.setMyInfo()
    }


    //todo:  !!!
    scrollDownNow = new BehaviorSubject<Boolean>(false)
    scrollDown(): void {
        this.scrollDownNow.next(false)
    }
    
    callThisChat = new BehaviorSubject<Boolean>(false)
    callThisChatNow(): void {
        this.callThisChat.next(true)
    }
    //!  !!!

    setMyInfo() {
        this.users_info[this.user_id] = {
            id: this.user_id, 
            name: this.initializeAppApiService.user_interface.user_displayName, 
            img: this.initializeAppApiService.user_interface.user_logo
        }
    }

    setThisChatID(chat_id: number | string) {
        if (typeof chat_id === "number") {
            this.chat_id = chat_id
            this.chat_user_id = this.initializeAppApiService.user_interface.chats.find(chat => chat.chat_id == this.chat_id)!.chat_user_id
        } else {
            console.debug('chat personale')
        }
    }


    
    protected _editingMessageMode: boolean = false
    get editingMessageMode() { return this._editingMessageMode }
    set editingMessageMode(bool: boolean) {
        this._editingMessageMode = bool
    }


    
    allegatingLink = signal<boolean>(false)

    private _allegatedLink: string = ""
    get allegatedLink() { return this._allegatedLink }
    set allegatedLink(newLink: string) {
        // if (!newLink.startsWith("http")) throw new Error('Invalid link')
        this._allegatedLink = newLink
    }
}
