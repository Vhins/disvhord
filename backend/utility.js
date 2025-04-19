export function sanitizeMessage(message) {
    return message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/g, '')
}