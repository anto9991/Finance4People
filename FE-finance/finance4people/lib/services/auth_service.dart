import 'dart:convert';
import 'dart:io';

import 'package:finance4people/models/google_user.dart';
import 'package:finance4people/models/user.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import './env.dart' as env;
import "dart:math" as math;

class AuthService {
  static final AuthService authService = AuthService._internal();

  factory AuthService() {
    return authService;
  }
  AuthService._internal();

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: <String>[
      'email',
      'https://www.googleapis.com/auth/contacts.readonly',
    ],
  );

  Future<String> signInWithGoogle() async {
    try {
      return await _googleSignIn.signIn().then((res) {
        if (res != null) {
          return res.authentication.then((key) {
            return AuthStore.gUser = GoogleUser(displayName: res.displayName ?? "", email: res.email, id: res.id, idToken: key.idToken ?? "");
          }).then((value) {
            if (value.idToken != "") {
              AuthStore.hasAuth.value = true;
              AuthStore.isLogged = true;
              return "Success";
            } else {
              return "Error";
            }
          });
        } else {
          return "";
        }
      });
    } catch (error) {
      print(error);
      return "Error";
    }
  }

  Future<String> signInWithApple() async {
    try {
      var rnd = math.Random();
      var values = List<int>.generate(32, (i) => rnd.nextInt(256));
      var nonce = base64Encode(values).replaceAll(RegExp('[=/+]'), '');

      var scopes = [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ];

      final credential = await SignInWithApple.getAppleIDCredential(
          scopes: scopes,
          webAuthenticationOptions: WebAuthenticationOptions(clientId: "finance4people-58004", redirectUri: kIsWeb ? Uri.parse("some url") : Uri.parse("Some other url")),
          nonce: nonce);
      print("Credentials $credential");
      AuthStore.nonce = nonce;
      AuthStore.appleUser = credential;
      AuthStore.hasAuth.value = true;
      AuthStore.isLogged = true;
      return "Success";
    } catch (err) {
      print("Printing error: $err");
      return "Error";
    }
  }

  Future<String> signOutGoogle() async {
    try {
      await _googleSignIn.signOut();
      return "Success";
    } catch (error) {
      print(error);
      return "Error";
    }
  }

  Future<String> signOut() async {
    try {
      String gSignOut = await signOutGoogle();
      if (gSignOut == "Error") {
        throw Error();
      }
      AuthStore.isLogged = false;
      AuthStore.hasAuth.value = false;
      AuthStore.gUser = GoogleUser();
      AuthStore.user = User();
      AuthStore.appleUser = null;
      AuthStore.googleId = "";
      return "Success";
    } catch (error) {
      print(error);
      return "Error";
    }
  }

  Future<void> getBEUser() async {
    try {
      if (AuthStore.isLogged) {
        var user;
        var code;
        if (AuthStore.appleUser != null) {
          user = AuthStore.appleUser!.identityToken;
          code = "A ${AuthStore.nonce}";
        } else if (AuthStore.gUser.idToken != "") {
          user = AuthStore.gUser.idToken;
          code = "G";
        } else {
          throw Exception("User should be logged");
        }
        var response = await http.get(
          Uri.http(env.host, '/user'),
          headers: <String, String>{
            HttpHeaders.authorizationHeader: 'Bearer $user $code',
            HttpHeaders.contentTypeHeader: 'application/json; charset=UTF-8',
          },
        );
        if (response.statusCode == 200) {
          var responseJson = jsonDecode(response.body);
          AuthStore.user = User.fromJson(responseJson["user"]);
        }
      }
    } catch (error) {
      print(error);
    }
  }
}
