package com.nosleepapp;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

/**
 * Main Activity for the NoSleep React Native Application.
 * 
 * This is the entry point Activity that hosts the React Native application.
 * It extends ReactActivity which handles:
 * - Loading and displaying the React Native JavaScript bundle
 * - Managing the React Native lifecycle
 * - Bridging between Android and React Native
 * 
 * The main component name "NoSleepApp" must match the component registered
 * in the JavaScript entry point (index.js or App.js).
 * 
 * @see ReactActivity
 * @see MainApplication
 */
public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "NoSleepApp";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }
}
