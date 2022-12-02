import 'package:finance4people/models/google_user.dart';
import 'package:flutter/material.dart';

class AuthStore{
  static final AuthStore authStore = AuthStore._internal();

  factory AuthStore(){
    return authStore;
  }

  AuthStore._internal();

  static ValueNotifier<bool> hasAuth = ValueNotifier<bool>(false); // Either is really logged or just skipped login
  static String googleId = "";
  static GoogleUser gUser = GoogleUser();
}