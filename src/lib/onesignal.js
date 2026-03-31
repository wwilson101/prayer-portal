const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID

let _initialized = false
let _initPromise = null

const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

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

const withTimeout = (promise, ms, fallback = null) => {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

const waitForPlayerId = (OneSignal, timeoutMs = 10000) => {
  return new Promise((resolve) => {
    const start = Date.now()
    const poll = () => {
      const id = OneSignal.User?.PushSubscription?.id
      if (id) return resolve(id)
      if (Date.now() - start > timeoutMs) return resolve(null)
      setTimeout(poll, 400)
    }
    poll()
  })
}

export const requestPushPermission = async () => {
  try {
    const ios = isIOS()
    const pwa = isPWA()

    if (ios && !pwa) {
      return null
    }

    const OneSignal = await withTimeout(initOneSignal(), 10000, null)
    if (!OneSignal) return null

    if (!ios) {
      if (!('Notification' in window)) return null
      const current = Notification.permission
      if (current === 'denied') return null

      if (current !== 'granted') {
        const result = await withTimeout(
          Notification.requestPermission(),
          15000,
          'default'
        )
        if (result !== 'granted') return null
      }
    }

    await withTimeout(OneSignal.User.PushSubscription.optIn(), 10000, null)

    const playerId = await waitForPlayerId(OneSignal, 10000)
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
    const ios = isIOS()
    if (!ios && Notification.permission !== 'granted') return false
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
    await withTimeout(OneSignal.User.PushSubscription.optOut(), 5000, null)
  } catch (err) {
    console.error('Push opt-out error:', err)
  }
}

export const optInPush = async () => {
  try {
    const OneSignal = await withTimeout(initOneSignal(), 10000, null)
    if (!OneSignal) return null
    await withTimeout(OneSignal.User.PushSubscription.optIn(), 10000, null)
    const playerId = await waitForPlayerId(OneSignal, 10000)
    return playerId || null
  } catch (err) {
    console.error('Push opt-in error:', err)
    return null
  }
}

export { isIOS, isPWA }
