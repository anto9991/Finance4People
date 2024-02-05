import 'package:sign_in_with_apple/sign_in_with_apple.dart';

class AppleUser {
  String? nonce;
  AuthorizationCredentialAppleID? appleUserCredentials;

  AppleUser({this.nonce = "", this.appleUserCredentials});

  AppleUser.fromJson(Map<String, dynamic> json)
      : nonce = json['nonce'],
        appleUserCredentials = AuthorizationCredentialAppleID(
            userIdentifier: json['userIdentifier'] ?? "",
            givenName: json['givenName'] ?? "",
            familyName: json['familyName'] ?? "",
            authorizationCode: json['authorizationCode'] ?? "",
            email: json['email'] ?? "",
            identityToken: json['identityToken'] ?? "",
            state: json['state'] ?? "");

  static Map<String, dynamic> toJson(AppleUser value) => {
        'nonce': value.nonce,
        'userIdentifier': value.appleUserCredentials!.userIdentifier,
        'givenName': value.appleUserCredentials!.givenName,
        'familyName': value.appleUserCredentials!.familyName,
        'authorizationCode': value.appleUserCredentials!.authorizationCode,
        'email': value.appleUserCredentials!.email,
        'identityToken': value.appleUserCredentials!.identityToken,
        'state': value.appleUserCredentials!.state,
      };
}
