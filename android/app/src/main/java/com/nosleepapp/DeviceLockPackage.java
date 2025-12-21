package com.nosleepapp;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.Collections;
import java.util.List;

/**
 * React Native Package that registers the DeviceLock native module.
 * 
 * This package is responsible for:
 * - Creating and providing the DeviceLockModule instance to React Native
 * - Registering native modules that can be accessed from JavaScript
 * 
 * Registration:
 * - Added to the packages list in MainApplication.java
 * - Automatically loaded when React Native initializes
 * 
 * JavaScript Access:
 * - import { NativeModules } from 'react-native';
 * - const { DeviceLock } = NativeModules;
 * 
 * @see DeviceLockModule
 * @see MainApplication#getPackages()
 */
public class DeviceLockPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Collections.singletonList(new DeviceLockModule(reactContext));
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
