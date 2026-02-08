package expo.modules.screentime

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class ScreenTimeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ScreenTime")

    AsyncFunction("requestAuthorization") { promise: Promise ->
      try {
        if (hasUsageStatsPermission()) {
          promise.resolve(mapOf("status" to "approved"))
        } else {
          val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          appContext.reactContext?.startActivity(intent)
          
          promise.resolve(mapOf("status" to "notDetermined"))
        }
      } catch (e: Exception) {
        promise.reject("AUTH_ERROR", "Failed to request authorization: ${e.message}", e)
      }
    }

    AsyncFunction("checkAuthorizationStatus") { promise: Promise ->
      try {
        val status = if (hasUsageStatsPermission()) "approved" else "denied"
        promise.resolve(mapOf("status" to status))
      } catch (e: Exception) {
        promise.reject("CHECK_ERROR", "Failed to check authorization: ${e.message}", e)
      }
    }

    AsyncFunction("getAppUsage") { startTime: Double, endTime: Double, promise: Promise ->
      try {
        if (!hasUsageStatsPermission()) {
          promise.reject("PERMISSION_ERROR", "Usage stats permission not granted", null)
          return@AsyncFunction
        }

        val usageStatsManager = appContext.reactContext
          ?.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

        val stats = usageStatsManager.queryUsageStats(
          UsageStatsManager.INTERVAL_DAILY,
          startTime.toLong(),
          endTime.toLong()
        )

        val result = mutableMapOf<String, Any>()

        stats.forEach { stat ->
          if (stat.totalTimeInForeground > 0) {
            result[stat.packageName] = mapOf(
              "packageName" to stat.packageName,
              "timeInForeground" to stat.totalTimeInForeground.toDouble(),
              "lastTimeUsed" to stat.lastTimeUsed.toDouble()
            )
          }
        }

        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("USAGE_ERROR", "Failed to get app usage: ${e.message}", e)
      }
    }
  }

  private val appContext
    get() = requireNotNull(this.appContext)

  private fun hasUsageStatsPermission(): Boolean {
    val appOps = appContext.reactContext
      ?.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

    val mode = appOps.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),
      appContext.reactContext?.packageName ?: ""
    )

    return mode == AppOpsManager.MODE_ALLOWED
  }
}
