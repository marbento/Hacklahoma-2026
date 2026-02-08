const {
  withEntitlementsPlist,
  withInfoPlist,
} = require("@expo/config-plugins");

function withScreenTime(config) {
  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.family-controls"] = true;
    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.NSFamilyControlsUsageDescription =
      "We need access to screen time to help you track your productivity and achieve your goals.";
    return config;
  });

  return config;
}

module.exports = withScreenTime;
