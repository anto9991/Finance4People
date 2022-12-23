import 'package:finance4people/models/google_user.dart';
import 'package:finance4people/models/user.dart';
import 'package:flutter/material.dart';

class AuthStore{
  static final AuthStore authStore = AuthStore._internal();

  factory AuthStore(){
    return authStore;
  }

  AuthStore._internal();

  static ValueNotifier<bool> hasAuth = ValueNotifier<bool>(false); // True if went through login page
  static bool isLogged = false; // False if has clicked on skip, true otherwise
  static String googleId = "";
  static GoogleUser gUser = GoogleUser();
  static User user = User();
}