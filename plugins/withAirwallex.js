const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAirwallex(config) {
  return withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('airwallex.github.io/maven/release')) {
      config.modResults.contents = config.modResults.contents.replace(
        /allprojects\s*{\s*repositories\s*{/g,
        `allprojects {
        repositories {
            maven { url "https://airwallex.github.io/maven/release" }`
      );
    }
    return config;
  });
};
