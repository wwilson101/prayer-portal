const ONESIGNAL_APP_ID = '88c00dad-fbdc-4b65-9f12-6108c045c57e'

let _oneSignalInstance = null

export const initOneSignal = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null)

    if (_oneSignalInstance) return resolve(_oneSignalInstance)
    if (window.OneSignal?.initialized) {
      _oneSignalInstance = window.OneSignal
      return resolve(window.OneSignal)
    }

    const doInit = async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: false },
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: 'push',
                  autoPrompt: false,
                  text: {
                    actionMessage: 'Get notified when someone prays for you.',
                    acceptButton: 'Allow',
                    cancelButton: 'Not now',
                  },
                },
              ],
            },
          },
        })
        _oneSignalInstance = OneSignal
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
}

const getOneSignal = () => _oneSignalInstance || window.OneSignal || null

export const requestPushPermission = async () => {
  try {
    const OneSignal = getOneSignal()
    if (!OneSignal) return null
    await OneSignal.Slidedown.promptPush()
    const permission = await OneSignal.Notifications.permission
    if (!permission) return null
    const playerId = await OneSignal.User.PushSubscription.id
    return playerId || null
  } catch (err) {
    console.error('Push permission error:', err)
    return null
  }
}

export const getPlayerId = async () => {
  try {
    const OneSignal = getOneSignal()
    if (!OneSignal) return null
    const subscribed = await OneSignal.User.PushSubscription.optedIn
    if (!subscribed) return null
    return OneSignal.User.PushSubscription.id || null
  } catch {
    return null
  }
}

export const isPushSubscribed = async () => {
  try {
    const OneSignal = getOneSignal()
    if (!OneSignal) return false
    return !!(await OneSignal.User.PushSubscription.optedIn)
  } catch {
    return false
  }
}

export const optOutPush = async () => {
  try {
    const OneSignal = getOneSignal()
    if (!OneSignal) return
    await OneSignal.User.PushSubscription.optOut()
  } catch (err) {
    console.error('Push opt-out error:', err)
  }
}

export const optInPush = async () => {
  try {
    const OneSignal = getOneSignal()
    if (!OneSignal) return null
    await OneSignal.User.PushSubscription.optIn()
    return OneSignal.User.PushSubscription.id || null
  } catch (err) {
    console.error('Push opt-in error:', err)
    return null
  }
}
