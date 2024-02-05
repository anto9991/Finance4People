class GoogleUser {
  String displayName;
  String email;
  String id;
  String idToken;
  String accessToken;

  GoogleUser({this.displayName = "", this.email = "", this.id = "", this.idToken = "", this.accessToken = ""});
  
  GoogleUser.fromJson(Map<String, dynamic> json)
      : id = json['_id'],
        idToken = json['idToken'],
        accessToken = json['accessToken'],
        displayName = json['displayName'],
        email = json['email'];

  static Map<String, dynamic> toJson(GoogleUser value) => {'_id': value.id, 'accessToken': value.accessToken, 'idToken': value.idToken, 'displayName': value.displayName, 'email': value.email};
}
