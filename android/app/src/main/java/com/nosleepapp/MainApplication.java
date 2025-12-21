package com.nosleepapp;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.util.List;

/**
 * Main Application class for the NoSleep React Native Application.
 * 
 * This class is responsible for:
 * - Initializing the React Native runtime environment
 * - Registering native modules and packages (including DeviceLockPackage)
 * - Configuring React Native settings (debug mode, JS module name, etc.)
 * - Loading the SoLoader for native libraries
 * 
 * Native Module Registration:
 * - Auto-linked packages are loaded via PackageList
 * - Custom DeviceLockPackage is manually added for device lock functionality
 * 
 * @see ReactApplication
 * @see DeviceLockPackage
 */
public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here:
          packages.add(new DeviceLockPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
