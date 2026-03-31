const ONESIGNAL_APP_ID = '88c00dad-fbdc-4b65-9f12-6108c045c57e'

let _initialized = false
let _initPromise = null

const getOneSignal = () => window.OneSignalDeferred ? window.OneSignal : null

export const initOneSignal = () => {
  if (_initPromise) return _initPromise

  _initPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null)

    if (_initialized && window.OneSignal) return resolve(window.OneSignal)

    const doInit = async (OneSignal) => {
      try {
        if (!_initialized) {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: { enable: false },
            autoRegister: false,
            autoResubscribe: false,
          })
          _initialized = true
        }
        resolve(OneSignal)
      } catch (err) {
        console.error('OneSignal init error:', err)
        resolve(null)
      }
    }

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(doInit)

    if (!document.getElementById('onesignal-sdk')) {
      const script = document.createElement('script')
      script.id = 'onesignal-sdk'
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.defer = true
      document.head.appendChild(script)
    } else if (window.OneSignal) {
      doInit(window.OneSignal)
    }
  })

  return _initPromise
}

const waitForPlayerId = (OneSignal, timeoutMs = 8000) => {
  return new Promise((resolve) => {
    const start = Date.now()
    const poll = () => {
      const id = OneSignal.User?.PushSubscription?.id
      if (id) return resolve(id)
      if (Date.now() - start > timeoutMs) return resolve(null)
      setTimeout(poll, 300)
    }
    poll()
  })
}

export const requestPushPermission = async () => {
  try {
    if (!('Notification' in window)) return null

    const current = Notification.permission
    if (current === 'denied') return null

    if (current !== 'granted') {
      const result = await Notification.requestPermission()
      if (result !== 'granted') return null
    }

    const OneSignal = await initOneSignal()
    if (!OneSignal) return null

    await OneSignal.User.PushSubscription.optIn()

    const playerId = await waitForPlayerId(OneSignal)
    return playerId || null
  } catch (err) {
    console.error('Push permission error:', err)
    return null
  }
}

export const getPlayerId = async () => {
  try {
    const OneSignal = window.OneSignal
    if (!OneSignal) return null
    const subscribed = OneSignal.User?.PushSubscription?.optedIn
    if (!subscribed) return null
    return OneSignal.User.PushSubscription.id || null
  } catch {
    return null
  }
}

export const isPushSubscribed = async () => {
  try {
    if (Notification.permission !== 'granted') return false
    const OneSignal = window.OneSignal
    if (!OneSignal) return false
    return !!(OneSignal.User?.PushSubscription?.optedIn)
  } catch {
    return false
  }
}

export const optOutPush = async () => {
  try {
    const OneSignal = window.OneSignal
    if (!OneSignal) return
    await OneSignal.User.PushSubscription.optOut()
  } catch (err) {
    console.error('Push opt-out error:', err)
  }
}

export const optInPush = async () => {
  try {
    const OneSignal = await initOneSignal()
    if (!OneSignal) return null
    await OneSignal.User.PushSubscription.optIn()
    const playerId = await waitForPlayerId(OneSignal)
    return playerId || null
  } catch (err) {
    console.error('Push opt-in error:', err)
    return null
  }
}
