class AuthStore{
  static final AuthStore authStore = AuthStore._internal();

  factory AuthStore(){
    return authStore;
  }

  AuthStore._internal();

  static bool withoutAuth = false;
}