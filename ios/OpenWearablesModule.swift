import ExpoModulesCore
import OpenWearablesHealthSDK

public class OpenWearablesModule: Module {
    public func definition() -> ModuleDefinition {
        Name("OpenWearablesHealthSDK")

        // MARK: - Callbacks (Events)
        Events("onLog", "onAuthError", "onAuthRecovered", "onAuthStateChanged")

        // MARK: - Lifecycle
        OnCreate {
            OpenWearablesHealthSDK.shared.onLog = { message in
                self.sendEvent("onLog", [
                    "message": message
                ])
            }

            OpenWearablesHealthSDK.shared.onAuthError = { statusCode, message in
                self.sendEvent("onAuthError", [
                    "statusCode": statusCode,
                    "message": message
                ])
            }

            // Gutsy fork — the native recovery ladder reports back through these two.
            OpenWearablesHealthSDK.shared.onAuthRecovered = { via in
                self.sendEvent("onAuthRecovered", [
                    "via": via
                ])
            }

            OpenWearablesHealthSDK.shared.onAuthStateChanged = { state in
                self.sendEvent("onAuthStateChanged", [
                    "state": state
                ])
            }
        }

        // MARK: - Configure
        Function("configure") { (host: String, customSyncURL: String?) in
            // customSyncURL is dropped — the iOS SDK's configure(host:) takes no such parameter.
            OpenWearablesHealthSDK.shared.configure(host: host)
        }

        // MARK: - Auth
        AsyncFunction("signIn") { (
            userId: String,
            accessToken: String?,
            refreshToken: String?,
            apiKey: String?,
            promise: Promise
        ) in
            OpenWearablesHealthSDK.shared.signIn(
                userId: userId,
                accessToken: accessToken,
                refreshToken: refreshToken,
                apiKey: apiKey
            )
            promise.resolve()
        }

        AsyncFunction("signOut") { (promise: Promise) in
            OpenWearablesHealthSDK.shared.signOut()
            promise.resolve()
        }

        Function("updateTokens") { (accessToken: String, refreshToken: String?) in
            OpenWearablesHealthSDK.shared.updateTokens(
                accessToken: accessToken,
                refreshToken: refreshToken
            )
        }

        Function("restoreSession") { () -> String? in
            return OpenWearablesHealthSDK.shared.restoreSession()
        }

        Function("isSessionValid") { () -> Bool in
            return OpenWearablesHealthSDK.shared.isSessionValid
        }

        // MARK: - Auth self-healing (Gutsy fork)
        Function("setRenewalCredential") { (url: String, token: String) in
            OpenWearablesHealthSDK.shared.setRenewalCredential(url: url, token: token)
        }

        Function("clearRenewalCredential") {
            OpenWearablesHealthSDK.shared.clearRenewalCredential()
        }

        Function("getAuthState") { () -> [String: Any?] in
            return OpenWearablesHealthSDK.shared.getAuthState()
        }

        AsyncFunction("ensureFreshSession") { (promise: Promise) in
            OpenWearablesHealthSDK.shared.ensureFreshSession { outcome in
                promise.resolve(outcome)
            }
        }

        // MARK: - HealthKit Authorization
        AsyncFunction("requestAuthorization") { (types: [String], promise: Promise) in
            let healthTypes = types.compactMap { HealthDataType(rawValue: $0) }
            OpenWearablesHealthSDK.shared.requestAuthorization(types: healthTypes) { success in
                promise.resolve(success)
            }
        }

        // MARK: - Sync
        Function("setSyncInterval") { (minutes: Double) in } // (not implemented in iOS SDK)

        AsyncFunction("startBackgroundSync") { (syncDaysBack: Int?, promise: Promise) in
            OpenWearablesHealthSDK.shared.startBackgroundSync(syncDaysBack: syncDaysBack) { started in
                promise.resolve(started)
            }
        }

        AsyncFunction("stopBackgroundSync") { (promise: Promise) in
            OpenWearablesHealthSDK.shared.stopBackgroundSync()
            promise.resolve()
        }

        AsyncFunction("resumeSync") { (promise: Promise) in
            OpenWearablesHealthSDK.shared.resumeSync { resumed in
                promise.resolve(resumed)
            }
        }

        Function("isSyncActive") { () -> Bool in
            return OpenWearablesHealthSDK.shared.isSyncActive
        }

        Function("getSyncStatus") { () -> [String: Any] in
            return OpenWearablesHealthSDK.shared.getSyncStatus()
        }

        Function("resetAnchors") {
            OpenWearablesHealthSDK.shared.resetAnchors()
        }

        Function("getStoredCredentials") { () -> [String: Any?] in
            var credentials = OpenWearablesHealthSDK.shared.getStoredCredentials()
            // The iOS SDK exposes no accessor for customSyncUrl — null until the native SDK adds one.
            // updateValue(_:forKey:) stores a null; subscript assignment would delete the key instead.
            credentials.updateValue(nil, forKey: "customSyncUrl")
            credentials.updateValue("apple", forKey: "provider")
            return credentials
        }

        // MARK: - Providers (iOS has exactly one: HealthKit)
        Function("getAvailableProviders") { () -> [[String: Any]] in
            return [
                ["id": "apple", "displayName": "Apple Health", "isAvailable": true]
            ]
        }

        Function("setProvider") { (providerId: String) -> Bool in
            return providerId == "apple"
        }

        // MARK: - Logs
        Function("setLogLevel") { (levelId: Int) in
            let level = OWLogLevel(rawValue: levelId) ?? .debug
            OpenWearablesHealthSDK.shared.setLogLevel(level)
        }

        Function("getLogLevel") { () -> Int in
            return OpenWearablesHealthSDK.shared.logLevel.rawValue
        }
    }
}
