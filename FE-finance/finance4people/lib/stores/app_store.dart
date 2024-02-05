import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppStore {
  static final AppStore appStore = AppStore._internal();

  factory AppStore() {
    return appStore;
  }

  AppStore._internal();

  // static ValueNotifier<bool> hasAuth = ValueNotifier<bool>(false); // True if went through login page
  // static User user = User();
  static ValueNotifier<ThemeMode> themeMode = ValueNotifier<ThemeMode>(ThemeMode.dark);
  static Locale locale = const Locale('en');

  static void setTheme(String? mode) async {
    final prefs = await SharedPreferences.getInstance();
    if (mode != null && mode != '') {
      // Set required theme and update local storage
      if (mode == "light") {
        prefs.setString('theme', mode);
        themeMode.value = ThemeMode.light;
      } else if (mode == "dark") {
        prefs.setString('theme', mode);
        themeMode.value = ThemeMode.dark;
      }
    } else {
      // Check the local storage and set that or default
      String? theme = prefs.getString('theme');
      themeMode = theme == "dark" ? ValueNotifier<ThemeMode>(ThemeMode.dark) : ValueNotifier<ThemeMode>(ThemeMode.light);
    }
  }
}
