import 'package:finance4people/services/auth_service.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:finance4people/views/utils/custom_snackbar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class Login extends StatelessWidget {
  final bool isLogged;

  const Login({Key? key, this.isLogged = false}) : super(key: key);

  @override
  Widget build(BuildContext context, [bool mounted = true]) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.35),
            LoginButton(
                name: "Google",
                color: Colors.white,
                textColor: Colors.black,
                logoSize: 0.065,
                onPressed: () async {
                  var auth = await AuthService().signInWithGoogle();
                  String message;
                  Color color;
                  if (auth == "Success") {
                      // ignore: use_build_context_synchronously
                      message = AppLocalizations.of(context)!.loginSuccess;
                      color = Colors.green;
                    if (!mounted) return;
                    CustomSnackBar.show(context, message, color);
                  } else if (auth == "Error") {
                    // ignore: use_build_context_synchronously
                      message = AppLocalizations.of(context)!.loginError;
                      color =  Colors.red;
                    if (!mounted) return;
                    CustomSnackBar.show(context, message, color);
                  }
                }),
            SizedBox(height: MediaQuery.of(context).size.height * 0.02),
            LoginButton(
                name: "Apple",
                color: Colors.black,
                textColor: Colors.white,
                logoSize: 0.065,
                onPressed: () async {
                  var auth = await AuthService().signInWithApple();
                  String message;
                  Color color;
                  if (auth == "Success") {
                      message = "Login completed successfully";
                      color = Colors.green;
                    if (!mounted) return;
                    CustomSnackBar.show(context, message, color);
                  } else if (auth == "Error") {
                      message = "Something went wrong, try again or skip login";
                      color =  Colors.red;
                    if (!mounted) return;
                    CustomSnackBar.show(context, message, color);
                  }
                }),
            SizedBox(height: MediaQuery.of(context).size.height * 0.02),
            TextButton(
              onPressed: () {
                AuthStore.hasAuth.value = true;
                // Navigator.pushNamed(context, "/home");
              },
              style: TextButton.styleFrom(
                shape: const BeveledRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(5))),
              ),
              child: Container(
                  padding: EdgeInsets.only(
                      left: MediaQuery.of(context).size.width * 0.08, top: MediaQuery.of(context).size.height * 0.02, bottom: MediaQuery.of(context).size.height * 0.02),
                  width: MediaQuery.of(context).size.width * 0.8,
                  child: Text(AppLocalizations.of(context)!.skipLogin, style: TextStyle(color: Theme.of(context).colorScheme.secondary))),
            ),
          ],
        ),
      ),
    );
  }
}

@immutable
class LoginButton extends StatelessWidget {
  final String name;
  final Color color;
  final Color textColor;
  final double logoSize;
  final VoidCallback onPressed;

  const LoginButton({Key? key, required this.color, required this.name, required this.textColor, required this.logoSize, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: MediaQuery.of(context).size.width * 0.8,
      height: MediaQuery.of(context).size.height * 0.06,
      child: FloatingActionButton.extended(
        // splashColor: Colors.transparent,
        // focusColor: Colors.transparent,
        backgroundColor: color,
        foregroundColor: Colors.black,
        label: Text(
          "${AppLocalizations.of(context)!.login} $name",
          style: TextStyle(color: textColor),
        ),
        icon: Image.asset(
          "assets/images/${name.toLowerCase()}.png",
          height: MediaQuery.of(context).size.width * logoSize,
        ),
        onPressed: onPressed,
      ),
    );
  }
}
