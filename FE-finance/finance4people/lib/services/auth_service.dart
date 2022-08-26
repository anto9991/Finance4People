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


  Future<void> signInWithGoogle() async {
    try {
    GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
    print(googleUser);
    } catch (error) {
      print(error);
    }
  }
}
