const AUTH_TOKEN_KEY = 'tenali-auth-token'
const AUTH_USER_KEY = 'tenali-auth-user'
const AUTH_EVENT = 'tenali-auth-change'


function authGetToken() { 
    try { 
        return localStorage.getItem(AUTH_TOKEN_KEY) || null 
    } catch (e) { 
        console.error(e.stack)
        return null 
    } 
}

function authGetUser() { 
    try { 
        return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null') 
    } catch (e) {
        console.error(e.stack) 
        return null 
    } 
}


function authSet(token, user) {
    try {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    } catch (e) {
        console.error(e.stack)
    }
    try { 
        window.dispatchEvent(new Event(AUTH_EVENT)) 
    } catch (e) {
        console.error(e.stack)
    }
}
function authClear() {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(AUTH_USER_KEY)
    } catch (e) {
        console.error(e.stack)
    }
    try { window.dispatchEvent(new Event(AUTH_EVENT)) } catch (e) {
        console.error(e.stack)
    }
}

export { AUTH_EVENT, AUTH_TOKEN_KEY, AUTH_USER_KEY, authClear, authGetToken, authGetUser, authSet }

