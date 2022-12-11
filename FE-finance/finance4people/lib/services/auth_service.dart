import 'package:finance4people/models/google_user.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  static final AuthService authService = AuthService._internal();

  factory AuthService() {
    return authService;
  }
  AuthService._internal();

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    // Optional clientId
    // clientId: '479882132969-9i9aqik3jfjd7qhci1nqf0bm2g71rm1u.apps.googleusercontent.com',
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
            print("printing idToken: ${value.idToken}");
            if (value.idToken != "") {
              AuthStore.hasAuth.value = true;
              AuthStore.isLogged = true;
              return "Success";
            } else {
              return "Error";
            }
          });
        } else {
          return "Error";
        }
      });
    } catch (error) {
      print(error);
      return "Error";
    }
  }

  Future<String> signOutGoogle() async {
    try {
      await _googleSignIn.signOut();
      AuthStore.isLogged = false;
      AuthStore.hasAuth.value = false;
      AuthStore.gUser = GoogleUser();
      return "Success";
    } catch (error) {
      print(error);
      return "Error";
    }
  }
}
