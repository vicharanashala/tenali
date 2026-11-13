import { useEffect, useState } from "react"
import CONFIG from "../config"
import { AUTH_EVENT, authClear, authGetUser, authSet } from "../utils/authHelper"

function useAuth() {
    const [user, setUser] = useState(authGetUser)
    useEffect(() => {
        const onChange = () => setUser(authGetUser())
        window.addEventListener(AUTH_EVENT, onChange)
        window.addEventListener('storage', onChange)
        return () => {
        window.removeEventListener(AUTH_EVENT, onChange)
        window.removeEventListener('storage', onChange)
        }
    }, [])
    const login = async (username, password) => {
        const r = await fetch(`${CONFIG.api}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        })
        if (!r.ok) {
        const err = await r.json().catch(() => ({ error: 'login failed' }))
        throw new Error(err.error || `login failed (HTTP ${r.status})`)
        }
        const data = await r.json()
        authSet(data.token, data.user)
        setUser(data.user)
        return data.user
    }
    const logout = () => { authClear(); setUser(null) }
    return { user, login, logout }
}

export default useAuth