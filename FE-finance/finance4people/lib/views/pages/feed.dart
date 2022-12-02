import 'package:finance4people/services/auth_service.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class Feed extends StatelessWidget {
  final bool isLogged;

  const Feed({Key? key, this.isLogged = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
                  SnackBar snackBar;
                  if(auth == "Success"){
                    snackBar = const SnackBar(
                        content: Text("Login completed successfully"),
                        backgroundColor: Colors.green,
                      );
                      ScaffoldMessenger.of(context).showSnackBar(snackBar);
                  }else if(auth == "Error"){
                    snackBar = const SnackBar(
                        content: Text("Something went wrong, try again or skip login"),
                        backgroundColor: Colors.red,
                      );
                      ScaffoldMessenger.of(context).showSnackBar(snackBar);
                  }
                  
                }),
            SizedBox(height: MediaQuery.of(context).size.height * 0.02),
            LoginButton(
                name: "Apple",
                color: Colors.black,
                textColor: Colors.white,
                logoSize: 0.065,
                onPressed: () {
                  print("Apple");
                }),
            SizedBox(height: MediaQuery.of(context).size.height * 0.02),
            TextButton(
              onPressed: () {
                AuthStore.hasAuth.value = true;
                // Navigator.pushNamed(context, "/home");
              },
              style: TextButton.styleFrom(
                shape: const BeveledRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(5))),
              ),
              child: Container(
                  padding: EdgeInsets.only(
                      left: MediaQuery.of(context).size.width * 0.08,
                      top: MediaQuery.of(context).size.height * 0.02,
                      bottom: MediaQuery.of(context).size.height * 0.02),
                  width: MediaQuery.of(context).size.width * 0.8,
                  child: Text(AppLocalizations.of(context)!.skipLogin)),
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

  const LoginButton(
      {Key? key,
      required this.color,
      required this.name,
      required this.textColor,
      required this.logoSize,
      required this.onPressed})
      : super(key: key);

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
