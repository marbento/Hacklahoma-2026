// plugins/withScreenTime.js
const {
  withEntitlementsPlist,
  withInfoPlist,
} = require("@expo/config-plugins");

function withScreenTime(config) {
  // Add iOS entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.family-controls"] = true;
    return config;
  });

  // Add iOS Info.plist usage description
  config = withInfoPlist(config, (config) => {
    config.modResults.NSFamilyControlsUsageDescription =
      config.modResults.NSFamilyControlsUsageDescription ||
      "We need access to screen time to help you track your productivity and achieve your goals.";
    return config;
  });

  return config;
}

module.exports = withScreenTime;
