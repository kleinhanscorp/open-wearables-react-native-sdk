import {
  ConfigPlugin,
  withEntitlementsPlist,
  withInfoPlist,
} from "expo/config-plugins";

export interface OpenWearablesIOSPluginProps {
  healthShareUsage?: string;
  healthUpdateUsage?: string;
}

const withOpenWearablesIOS: ConfigPlugin<OpenWearablesIOSPluginProps> = (
  config,
  options = {}
) => {
  const {
    healthShareUsage = "Allow access to your health data.",
    healthUpdateUsage = "",
  } = options;

  // Add HealthKit entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.healthkit"] = true;
    config.modResults["com.apple.developer.healthkit.background-delivery"] =
      true;
    return config;
  });

  // Add Info.plist usage descriptions & BGTask identifiers
  config = withInfoPlist(config, (config) => {
    config.modResults["NSHealthShareUsageDescription"] = healthShareUsage;
    if (healthUpdateUsage && healthUpdateUsage.length > 0) {
      config.modResults["NSHealthUpdateUsageDescription"] = healthUpdateUsage;
    } else {
      delete config.modResults["NSHealthUpdateUsageDescription"];
    }

    config.modResults["UIBackgroundModes"] = ["fetch", "processing"];

    config.modResults["BGTaskSchedulerPermittedIdentifiers"] = [
      "com.openwearables.healthsdk.task.refresh",
      "com.openwearables.healthsdk.task.process",
    ];

    return config;
  });

  return config;
};

export default withOpenWearablesIOS;
