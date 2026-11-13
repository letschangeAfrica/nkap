export const WELCOME_KEY = 'nkap-welcome-done'

export function welcomeDone() {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1'
  } catch {
    return false
  }
}

export function setWelcomeDone(done = true) {
  try {
    if (done) localStorage.setItem(WELCOME_KEY, '1')
    else localStorage.removeItem(WELCOME_KEY)
  } catch {
    /* storage blocked: the welcome simply shows again next time */
  }
}
