package expo.modules.openwearables

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.functions.Coroutine
import com.openwearables.health.sdk.*

public class OpenWearablesModule : Module() {
  public override fun definition() = ModuleDefinition {
    Name("OpenWearablesHealthSDK")

    // MARK: - Callbacks (Events)
    Events("onLog", "onAuthError", "onAuthRecovered", "onAuthStateChanged")

    // MARK: - Lifecycle
    OnCreate {
      OpenWearablesHealthSDK.initialize(appContext.reactContext!!)

      appContext.activityProvider?.currentActivity?.let { activity ->
        OpenWearablesHealthSDK.getInstance().setActivity(activity)
      }

      OpenWearablesHealthSDK.getInstance().logListener = { message ->
        sendEvent(
          "onLog",
          mapOf(
            "nativeConnectionGeneration" to OpenWearablesHealthSDK.getInstance().connectionGeneration(),
            "message" to message
          )
        )
      }

      OpenWearablesHealthSDK.getInstance().authErrorListener = { statusCode, message ->
        sendEvent(
          "onAuthError",
          mapOf(
            "statusCode" to statusCode,
            "nativeConnectionGeneration" to OpenWearablesHealthSDK.getInstance().connectionGeneration(),
            "message" to message
          )
        )
      }

      // Gutsy fork — the native recovery ladder reports back through these two.
      OpenWearablesHealthSDK.getInstance().authRecoveredListener = { via ->
        sendEvent("onAuthRecovered", mapOf("via" to via, "nativeConnectionGeneration" to OpenWearablesHealthSDK.getInstance().connectionGeneration()))
      }

      OpenWearablesHealthSDK.getInstance().authStateListener = { state ->
        sendEvent("onAuthStateChanged", mapOf("state" to state, "nativeConnectionGeneration" to OpenWearablesHealthSDK.getInstance().connectionGeneration()))
      }
    }

    OnActivityEntersForeground {
      appContext.activityProvider?.currentActivity?.let { activity ->
        OpenWearablesHealthSDK.getInstance().setActivity(activity)
      }

      OpenWearablesHealthSDK.getInstance().onForeground()
    }

    OnActivityEntersBackground {
      OpenWearablesHealthSDK.getInstance().onBackground()
    }

    OnActivityDestroys {
      OpenWearablesHealthSDK.getInstance().unregisterPermissionLauncher()
    }

    // MARK: - Configure
    Function("configure") { host: String, customSyncURL: String? ->
      OpenWearablesHealthSDK.getInstance().configure(host, customSyncURL)
    }

    // MARK: - Auth
    Function("invalidateConnection") { OpenWearablesHealthSDK.getInstance().invalidateConnection() }
    Function("connectionGeneration") { OpenWearablesHealthSDK.getInstance().connectionGeneration() }
    Function("deviceId") { OpenWearablesHealthSDK.getInstance().deviceId() }
    Function("installConnection") { generation: String, userId: String, access: String, refresh: String,
                                    renewalUrl: String?, renewalToken: String?, fresh: Boolean, deviceGeneration: String ->
      OpenWearablesHealthSDK.getInstance().installConnection(generation, userId, access, refresh, renewalUrl, renewalToken, fresh, deviceGeneration)
    }
    Function("signOutConnection") { generation: String ->
      OpenWearablesHealthSDK.getInstance().signOutConnection(generation)
    }

    AsyncFunction("signIn") Coroutine { userId: String, accessToken: String?, refreshToken: String?, apiKey: String? ->
      OpenWearablesHealthSDK.getInstance().signIn(
        userId,
        accessToken,
        refreshToken,
        apiKey
      )
    }

    AsyncFunction("signOut") Coroutine { _: Unit? ->
      OpenWearablesHealthSDK.getInstance().signOut()
    }

    Function("updateTokens") { accessToken: String, refreshToken: String? ->
      OpenWearablesHealthSDK.getInstance().updateTokens(
        accessToken,
        refreshToken
      )
    }

    Function("restoreSession") {
      OpenWearablesHealthSDK.getInstance().restoreSession()
    }

    Function("isSessionValid") {
      OpenWearablesHealthSDK.getInstance().isSessionValid()
    }

    // MARK: - Auth self-healing (Gutsy fork)
    Function("setRenewalCredential") { url: String, token: String ->
      OpenWearablesHealthSDK.getInstance().setRenewalCredential(url, token)
    }

    Function("clearRenewalCredential") {
      OpenWearablesHealthSDK.getInstance().clearRenewalCredential()
    }

    Function("getAuthState") {
      OpenWearablesHealthSDK.getInstance().getAuthState()
    }

    AsyncFunction("ensureFreshSession") Coroutine { _: Unit? ->
      return@Coroutine OpenWearablesHealthSDK.getInstance().ensureFreshSession()
    }

    // MARK: - Authorization
    AsyncFunction("requestAuthorization") Coroutine { types: List<String> ->
      return@Coroutine OpenWearablesHealthSDK.getInstance().requestAuthorization(types)
    }

    // MARK: - Sync
    Function("setSyncInterval") { minutes: Long ->
      OpenWearablesHealthSDK.getInstance().setSyncInterval(minutes)
    }

    AsyncFunction("startBackgroundSync") Coroutine { syncDaysBack: Int? ->
      // The native returns Unit and throws when it cannot start; iOS resolves false instead.
      try {
        OpenWearablesHealthSDK.getInstance().startBackgroundSync(syncDaysBack)
        return@Coroutine true
      } catch (e: IllegalStateException) {
        sendEvent("onLog", mapOf("message" to "Cannot start sync: ${e.message}"))
        return@Coroutine false
      }
    }

    AsyncFunction("stopBackgroundSync") Coroutine { _: Unit? ->
      OpenWearablesHealthSDK.getInstance().stopBackgroundSync()
    }

    AsyncFunction("resumeSync") Coroutine { _: Unit? ->
      // iOS resolves false when there is nothing to resume; the native here throws instead.
      try {
        OpenWearablesHealthSDK.getInstance().resumeSync()
        return@Coroutine true
      } catch (e: IllegalStateException) {
        sendEvent("onLog", mapOf("message" to "Cannot resume sync: ${e.message}"))
        return@Coroutine false
      }
    }

    Function("isSyncActive") {
      OpenWearablesHealthSDK.getInstance().isSyncActive()
    }

    Function("getSyncStatus") {
      OpenWearablesHealthSDK.getInstance().getSyncStatus()
    }

    Function("resetAnchors") {
      OpenWearablesHealthSDK.getInstance().resetAnchors()
    }

    Function("getStoredCredentials") {
      OpenWearablesHealthSDK.getInstance().getStoredCredentials()
    }

    // MARK: - Providers
    Function("getAvailableProviders") {
      OpenWearablesHealthSDK.getInstance().getAvailableProviders()
    }

    Function("setProvider") { providerId: String ->
      OpenWearablesHealthSDK.getInstance().setProvider(providerId)
    }

    // MARK: - Logs
    Function("setLogLevel") { levelId: Int ->
      val level = OWLogLevel.entries.getOrElse(levelId) {
          OWLogLevel.DEBUG
      }
      OpenWearablesHealthSDK.getInstance().logLevel = level
    }

    Function("getLogLevel") {
      OpenWearablesHealthSDK.getInstance().logLevel.ordinal
    }
  }
}
