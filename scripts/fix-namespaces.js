/**
 * Post-install script to fix older React Native libraries
 * that don't have namespace defined (required by AGP 8+)
 * and fix dynamic version dependencies
 */

const fs = require("fs");
const path = require("path");

const REACT_NATIVE_VERSION = "0.73.2";

const librariesToFix = [
  {
    name: "react-native-background-timer",
    namespace: "com.ocetnik.timer",
  },
  {
    name: "@react-native-community/datetimepicker",
    path: "@react-native-community/datetimepicker",
    namespace: "com.reactcommunity.rndatetimepicker",
  },
];

console.log("🔧 Fixing namespace for older libraries...");

librariesToFix.forEach(({ name, path: customPath, namespace }) => {
  const modulePath = customPath || name;
  const buildGradlePath = path.join(
    __dirname,
    "..",
    "node_modules",
    modulePath,
    "android",
    "build.gradle"
  );

  if (!fs.existsSync(buildGradlePath)) {
    console.log(`⚠️  ${name}: build.gradle not found, skipping`);
    return;
  }

  let content = fs.readFileSync(buildGradlePath, "utf8");
  let modified = false;

  // Check if namespace is already defined
  if (!content.includes("namespace")) {
    // Find the android { block and add namespace
    const androidBlockRegex = /android\s*\{/;
    if (androidBlockRegex.test(content)) {
      content = content.replace(
        androidBlockRegex,
        `android {\n    namespace "${namespace}"`
      );
      modified = true;
      console.log(`✅ ${name}: added namespace "${namespace}"`);
    }
  } else {
    console.log(`✅ ${name}: namespace already defined`);
  }

  // Fix dynamic react-native version (+ or 0.71.0-rc.0) to use explicit version
  if (
    content.includes("com.facebook.react:react-native:+") ||
    content.includes("com.facebook.react:react-native:0.71")
  ) {
    content = content.replace(
      /com\.facebook\.react:react-native:[^\s'"]+/g,
      `com.facebook.react:react-android:${REACT_NATIVE_VERSION}`
    );
    modified = true;
    console.log(`✅ ${name}: fixed react-native dependency version`);
  }

  if (modified) {
    fs.writeFileSync(buildGradlePath, content);
  }
});

// Also fix @react-native-clipboard/clipboard if it has the same issue
const clipboardPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@react-native-clipboard",
  "clipboard",
  "android",
  "build.gradle"
);

if (fs.existsSync(clipboardPath)) {
  let content = fs.readFileSync(clipboardPath, "utf8");
  let modified = false;

  if (
    content.includes("com.facebook.react:react-native:+") ||
    content.includes("com.facebook.react:react-native:0.71")
  ) {
    content = content.replace(
      /com\.facebook\.react:react-native:[^\s'"]+/g,
      `com.facebook.react:react-android:${REACT_NATIVE_VERSION}`
    );
    modified = true;
    console.log(
      `✅ @react-native-clipboard/clipboard: fixed react-native dependency version`
    );
  }

  if (modified) {
    fs.writeFileSync(clipboardPath, content);
  }
}

console.log("✨ Namespace fix complete!");
