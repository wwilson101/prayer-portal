const ONESIGNAL_APP_ID = '88c00dad-fbdc-4b65-9f12-6108c045c57e'

export const initOneSignal = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null)

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
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
        resolve(OneSignal)
      } catch (err) {
        console.error('OneSignal init error:', err)
        resolve(null)
      }
    })

    if (!document.getElementById('onesignal-sdk')) {
      const script = document.createElement('script')
      script.id = 'onesignal-sdk'
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.defer = true
      document.head.appendChild(script)
    }
  })
}

export const requestPushPermission = async () => {
  try {
    const OneSignal = window.OneSignal
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
    const OneSignal = window.OneSignal
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
    const OneSignal = window.OneSignal
    if (!OneSignal) return false
    return !!(await OneSignal.User.PushSubscription.optedIn)
  } catch {
    return false
  }
}
