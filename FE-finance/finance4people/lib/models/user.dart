class User {
  String id;
  String email;
  String name;
  String locale;
  String picture;
  List<dynamic> favourites;

  User({
    this.id = "",
    this.email = "",
    this.name = "",
    this.locale = "",
    this.picture = "",
    this.favourites = const [],
  });

  factory User.fromJson(Map<String, dynamic> json) {
      return User(
        id : json["_id"] ?? "",
        email : json["email"] ?? "",
        name : json["name"] ?? "",
        locale : json["locale"] ?? "",
        picture : json["picture"] ?? "",
        favourites : json["favourites"] ?? []
      );
  }
}
