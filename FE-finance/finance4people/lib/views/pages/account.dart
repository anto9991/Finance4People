import 'package:finance4people/services/auth_service.dart';
import 'package:finance4people/stores/app_store.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:finance4people/views/utils/view_scaffold.dart';
import 'package:flutter/material.dart';

class Account extends StatefulWidget {
  const Account({Key? key}) : super(key: key);
  @override
  State<Account> createState() => _AccountState();
}

class _AccountState extends State<Account> {
  @override
  Widget build(BuildContext context) {
    return ViewScaffold(
        //TODO internationalize
        viewName: "Account & Settings",
        child: Center(
            child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            if (AuthStore.isLogged) ...[
              AccountButton(
                  text: "Logout",
                  icon: const Icon(Icons.logout),
                  onPressed: (() {
                    AuthService.authService.signOut();
                  }))
            ] else ...[
              AccountButton(
                  text: "Login",
                  icon: const Icon(Icons.login),
                  onPressed: (() {
                    AuthStore.hasAuth.value = false;
                  }))
            ],
            ValueListenableBuilder(
                valueListenable: AppStore.themeMode,
                builder: ((_, value, __) => AccountButton(
                    text: "Switch theme",
                    icon: AppStore.themeMode.value == ThemeMode.light ? const Icon(Icons.mode_night_outlined) : const Icon(Icons.wb_sunny_outlined),
                    onPressed: (() {
                      AppStore.themeMode.value = value == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
                    })))),
            AccountButton(text: "Some other settings", onPressed: (() => "ciao")),
          ],
        )));
  }
}

class AccountButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final Icon? icon;

  const AccountButton({Key? key, required this.onPressed, required this.text, this.icon}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.grey[300]!))),
        child: Row(
          children: [
            SizedBox(
                width: MediaQuery.of(context).size.width * 0.1,
                height: MediaQuery.of(context).size.height * 0.05,
                child: Icon(icon?.icon, color: Theme.of(context).textTheme.headline5?.color)),
            Expanded(child: Text(text, style: const TextStyle(fontSize: 15.0))),
            SizedBox(
                width: MediaQuery.of(context).size.width * 0.1,
                height: MediaQuery.of(context).size.height * 0.05,
                child: Icon(
                  Icons.arrow_forward_ios,
                  color: Theme.of(context).textTheme.headline5?.color,
                ))
          ],
        ),
      ),
    );
    // return ElevatedButton(
    //   onPressed: () {
    //     Navigator.push(
    //       context,
    //       MaterialPageRoute(builder: (context) => const Account()),
    //     );
    //   },
    //   child: const Text('Account'),
    // );
  }
}
