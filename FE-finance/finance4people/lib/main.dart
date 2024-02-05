import 'package:finance4people/services/auth_service.dart';
import 'package:finance4people/stores/app_store.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:finance4people/views/pages/account.dart';
import 'package:finance4people/views/pages/favourites.dart';
import 'package:finance4people/views/pages/login.dart';
import 'package:finance4people/views/pages/stock/home.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
// import 'package:shared_preferences/shared_preferences.dart';
// import 'package:finance4people/views/pages/feed.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final preferences = await SharedPreferences.getInstance();
  runApp(MyApp(preferences: preferences));
}

class MyApp extends StatelessWidget {
  final SharedPreferences preferences;
  const MyApp({Key? key, required this.preferences}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    String theme = preferences.getString('theme') ?? '';
    AppStore.setTheme(theme);
    AuthService.authService.getAuthInSP();
    return ValueListenableBuilder<ThemeMode>(
        valueListenable: AppStore.themeMode,
        builder: (_, value, __) {
          return MaterialApp(
              title: 'Flutter Demo',
              debugShowCheckedModeBanner: false,
              localizationsDelegates: const [
                AppLocalizations.delegate,
                GlobalMaterialLocalizations.delegate,
                GlobalWidgetsLocalizations.delegate,
                GlobalCupertinoLocalizations.delegate,
              ],
              supportedLocales: const [
                Locale('en', ''), // English, no country code
                Locale('it', ''), // Spanish, no country code
              ],
              // themeMode: ThemeMode.dark,
              themeMode: value,
              // Palette colori Alessandro
              darkTheme: ThemeData(
                  brightness: Brightness.dark,
                  textTheme: const TextTheme(
                    headline5: TextStyle(color: Color(0xffF2CB55)),
                    bodyText1: TextStyle(color: Color(0xffF2CB55)),
                    bodyText2: TextStyle(color: Colors.white),
                    headline1: TextStyle(color: Colors.white),
                  ),
                  colorScheme: const ColorScheme.dark(
                    primary: Color(0xff49A642),
                    primaryContainer: Color(0xff042623),
                    secondary: Color(0xffF2CB55),
                    secondaryContainer: Color(0xfff6dfc8),
                    // background: Color(0xff2b2b2b)
                  ),
                  shadowColor: const Color(0xffF2CB55),
                  selectedRowColor: const Color(0xffF2CB55),
                  cardColor: const Color(0xff042623),
                  scaffoldBackgroundColor: const Color(0xff042623),
                  dividerColor: const Color(0xffF2CB55)),
              theme: ThemeData(
                  brightness: Brightness.light,
                  textTheme: const TextTheme(
                    headline5: TextStyle(color: Color(0xff49A642)),
                    bodyText1: TextStyle(color: Color(0xff49A642)),
                    bodyText2: TextStyle(color: Colors.black),
                    headline1: TextStyle(color: Color(0xff49A642)),
                  ),
                  colorScheme: const ColorScheme.light(
                      primary: Color(0xff49A642), 
                      primaryContainer: Color(0xff042623), 
                      secondary: Color(0xffF2CB55), 
                      secondaryContainer: Color(0xfff6dfc8)
                    ),
                  cardColor: Colors.white,
                  shadowColor: Colors.black38,
                  selectedRowColor: const Color(0xff49A642),
                  dividerColor: const Color(0xffF2CB55),
                  scaffoldBackgroundColor: Colors.grey[100]),
              home: Scaffold(
                body: ValueListenableBuilder(
                    valueListenable: AuthStore.hasAuth,
                    builder: ((context, value, _) {
                      if (value == false) {
                        return const Login();
                      } else {
                        return const MyHomePage();
                      }
                    })),
              ));
        });
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  static const List<Widget> _widgetOptions = <Widget>[Home(), Favourites(), Account()];
  // static const List<Widget> _widgetOptions = <Widget>[Home(), Favourites(), Feed(), Account()];

  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      _asyncDataLoading();
    });
  }

  _asyncDataLoading() async {
    await AuthService().getBEUser();
  }

  @override
  Widget build(BuildContext context) {
    // Startup settings
    Locale locale = Localizations.localeOf(context);
    AppStore.locale = locale;
    return Scaffold(
      body: SafeArea(child: _widgetOptions.elementAt(_selectedIndex)),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          borderRadius: const BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
          boxShadow: [
            BoxShadow(color: Theme.of(context).shadowColor, spreadRadius: 0, blurRadius: 10),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
          child: BottomNavigationBar(
            items: const <BottomNavigationBarItem>[
              //TODO internationalize
              BottomNavigationBarItem(icon: Icon(Icons.waterfall_chart), label: "Home"),
              BottomNavigationBarItem(icon: Icon(Icons.star), label: "Favourites"),
              // BottomNavigationBarItem(icon: Icon(Icons.explore), label: "Feed"),
              BottomNavigationBarItem(icon: Icon(Icons.account_circle), label: "Account"),
            ],
            currentIndex: _selectedIndex,
            selectedItemColor: Theme.of(context).selectedRowColor,
            onTap: _onItemTapped,
            showSelectedLabels: true,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            type: BottomNavigationBarType.fixed,
            showUnselectedLabels: true,
            unselectedItemColor: Colors.grey,
          ),
        ),
      ),
    );
  }
}
