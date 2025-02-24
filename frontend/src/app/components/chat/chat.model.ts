export interface Messages {
    content: string, 
    sender: number, 
    receiver: number, 
    message_id: number, 
    timestamp: number, 
    attachments: string | null
}

export interface api_ChatInfoMessages {
    chatMessages: Messages[], 
    chatInfo: {
        user_id: number, 
        user_displayName: string, 
        user_logo: string
    }
}

export interface MessageData {
    sender: number, 
    receiver: number, 
    content?: string, 
    chat_id: number, 
    attachments?: string
}
