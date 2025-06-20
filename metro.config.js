const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

let config = getDefaultConfig(__dirname);

// Firebase specific configuration for handling CJS modules and package exports
config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;

// NativeWind configuration
config = withNativeWind(config, { input: "./app/globals.css" });

module.exports = config;