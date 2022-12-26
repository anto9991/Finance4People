import 'package:flutter/material.dart';

class AppStore{
  static final AppStore appStore = AppStore._internal();

  factory AppStore(){
    return appStore;
  }

  AppStore._internal();

  // static ValueNotifier<bool> hasAuth = ValueNotifier<bool>(false); // True if went through login page
  // static User user = User();
  static ValueNotifier<ThemeMode> themeMode = ValueNotifier<ThemeMode>(ThemeMode.light);
}