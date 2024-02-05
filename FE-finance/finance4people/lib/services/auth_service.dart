import 'dart:convert';
import 'dart:io';

import 'package:finance4people/models/apple_user.dart';
import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/models/google_user.dart';
import 'package:finance4people/models/stock.dart';
import 'package:finance4people/models/stock_category.dart';
import 'package:finance4people/models/user.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
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

  Future<void> setAuthInSP(Object user) async {
    final preferences = await SharedPreferences.getInstance();
    if (user is GoogleUser) {
      String stringifiedUser = json.encode(GoogleUser.toJson(user));
      preferences.setString('gUser', stringifiedUser);
    } else if (user is AppleUser) {
      String stringifiedUser = json.encode(AppleUser.toJson(user));
      preferences.setString('aUser', stringifiedUser);
    }
  }

  Future<void> getAuthInSP() async {
    final preferences = await SharedPreferences.getInstance();
    String? stringifiedGUser = preferences.getString('gUser');
    if (stringifiedGUser != null) {
      GoogleUser gUser = GoogleUser.fromJson(json.decode(stringifiedGUser));
      AuthStore.gUser = gUser;
      AuthStore.hasAuth.value = true;
      AuthStore.displayName = gUser.displayName;
      AuthStore.isLogged = true;
    }
    String? stringifiedAUser = preferences.getString('aUser');
    if (stringifiedAUser != null) {
      AppleUser aUser = AppleUser.fromJson(json.decode(stringifiedAUser));
      AuthStore.appleUser = aUser;
      AuthStore.displayName = aUser.appleUserCredentials!.givenName;
      AuthStore.hasAuth.value = true;
      AuthStore.isLogged = true;
    }
  }

  Future<String> signInWithGoogle() async {
    try {
      return await _googleSignIn.signIn().then((res) {
        if (res != null) {
          return res.authentication.then((key) {
            return AuthStore.gUser =
                GoogleUser(displayName: res.displayName ?? "", email: res.email, id: res.id, idToken: key.idToken ?? "", accessToken: key.accessToken ?? "");
          }).then((value) async {
            if (value.idToken != "") {
              AuthStore.hasAuth.value = true;
              AuthStore.isLogged = true;
              AuthStore.displayName = value.displayName;
              await setAuthInSP(AuthStore.gUser!);
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
          scopes: scopes, webAuthenticationOptions: WebAuthenticationOptions(clientId: "finance4people-58004", redirectUri: Uri.parse("nous-fined.xyz")), nonce: nonce);
      AuthStore.appleUser = AppleUser();
      AuthStore.appleUser!.nonce = nonce;
      AuthStore.appleUser!.appleUserCredentials = credential;
      AuthStore.displayName = credential.givenName;
      await setAuthInSP(AuthStore.appleUser!);
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

  void clearStockStore() {
    StockStore.categoriesGreenBlatt = CategoriesContainer(categories: []);
    StockStore.favouritesBeta = CategoriesContainer(categories: []);
    StockStore.categoriesSharpe = CategoriesContainer(categories: []);
    StockStore.greenblattNoBeta = [];
    StockStore.favouritesNoBeta = [];
    StockStore.sharpeNoBeta = [];
  }

  Future<String> signOut() async {
    try {
      final preferences = await SharedPreferences.getInstance();
      preferences.clear();
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
      AuthStore.userFavStocks = [];
      clearStockStore();
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
          user = AuthStore.appleUser!.appleUserCredentials!.identityToken;
          code = "A ${AuthStore.appleUser!.nonce}";
        } else if (AuthStore.gUser?.idToken != "") {
          user = AuthStore.gUser!.idToken;
          code = "G";
        } else {
          throw Exception("User should be logged");
        }
        var response = await http.get(
          Uri.https(env.host, '/user'),
          headers: <String, String>{
            HttpHeaders.authorizationHeader: 'Bearer $user $code',
            HttpHeaders.contentTypeHeader: 'application/json; charset=UTF-8',
          },
        );
        if (response.statusCode == 200) {
          var responseJson = jsonDecode(response.body);
          AuthStore.user = User.fromJson(responseJson["user"]);
          AuthStore.userFavStocks = AuthStore.user.favourites;
          // StockStore.categoriesGreenBlatt.categories[0];
          // Sometimes when logged in with apple this request is slower than get stocks so you need to make sure that stocks are set as favourites
          refreshFavStocks(AuthStore.userFavStocks);
        }
      }
    } catch (error) {
      print(error);
    }
  }
}

void refreshFavStocks(List<dynamic> favs) {
  if (favs.isNotEmpty) {
    List<dynamic> categories = StockStore.categoriesGreenBlatt.categories;
    for (int i = 0; i < categories.length; i++) {
      for (int j = 0; j < (categories[i] as StockCategory).stocks.length; j++) {
        (categories[i] as StockCategory).stocks[j].isFavourite.value = favs.contains((categories[i] as StockCategory).stocks[j].id);
      }
    }
  }
}
