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
            return AuthStore.gUser = GoogleUser(
                displayName: res.displayName ?? "",
                email: res.email,
                id: res.id,
                token: key.idToken ?? "");
          }).then((value) {
            if (value.token != "") {
              AuthStore.hasAuth.value = true;
              return "Success";
            } else {
              return "False";
            }
          });
        }else {
          return "False";
        }
      });
    } catch (error) {
      print(error);
      return "Error";
    }
  }
}
