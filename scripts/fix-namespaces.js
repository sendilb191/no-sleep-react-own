/**
 * Post-install script to fix older React Native libraries
 * that don't have namespace defined (required by AGP 8+)
 */

const fs = require("fs");
const path = require("path");

const librariesToFix = [
  {
    name: "react-native-background-timer",
    namespace: "com.ocetnik.timer",
  },
];

console.log("🔧 Fixing namespace for older libraries...");

librariesToFix.forEach(({ name, namespace }) => {
  const buildGradlePath = path.join(
    __dirname,
    "..",
    "node_modules",
    name,
    "android",
    "build.gradle"
  );

  if (!fs.existsSync(buildGradlePath)) {
    console.log(`⚠️  ${name}: build.gradle not found, skipping`);
    return;
  }

  let content = fs.readFileSync(buildGradlePath, "utf8");

  // Check if namespace is already defined
  if (content.includes("namespace")) {
    console.log(`✅ ${name}: namespace already defined`);
    return;
  }

  // Find the android { block and add namespace
  const androidBlockRegex = /android\s*\{/;
  if (androidBlockRegex.test(content)) {
    content = content.replace(
      androidBlockRegex,
      `android {\n    namespace "${namespace}"`
    );
    fs.writeFileSync(buildGradlePath, content);
    console.log(`✅ ${name}: added namespace "${namespace}"`);
  } else {
    console.log(`⚠️  ${name}: couldn't find android block`);
  }
});

console.log("✨ Namespace fix complete!");
