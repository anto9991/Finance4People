import 'package:finance4people/services/stock_service.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:finance4people/views/pages/favourites.dart';
import 'package:finance4people/views/pages/feed.dart';
import 'package:finance4people/views/pages/login.dart';
import 'package:finance4people/views/pages/stock/home.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

void main() async {
  await DotEnv().load();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
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
        themeMode: ThemeMode.system,
        darkTheme: ThemeData(
            textTheme: const TextTheme(
              bodyText1: TextStyle(color: Color(0xfff5be49)),
              bodyText2: TextStyle(color: Colors.white),
            ),
            brightness: Brightness.dark,
            colorScheme: const ColorScheme.dark(
              primary: Color(0xff004a98),
              primaryContainer: Color(0xff011c50),
              secondary: Color(0xfff5be49),
              secondaryContainer: Color(0xfff6dfc8),
              // background: Color(0xff2b2b2b)
            ),
            shadowColor: const Color(0xfff5be49),
            selectedRowColor: const Color(0xfff5be49),
            cardColor: const Color(0xff004a98),
            scaffoldBackgroundColor: const Color(0xff011c50),
            dividerColor: const Color(0xfff5be49)),
        theme: ThemeData(
          textTheme: const TextTheme(
              bodyText1: TextStyle(color: Color(0xff004a98)),
              bodyText2: TextStyle(color: Colors.black),
            ),
            brightness: Brightness.light,
            colorScheme: const ColorScheme.light(
                primary: Color(0xff004a98), primaryContainer: Color(0xff011c50), secondary: Color(0xfff5be49), secondaryContainer: Color(0xfff6dfc8)),
            cardColor: Colors.white,
            shadowColor: Colors.black38,
            selectedRowColor: const Color(0xff004a98),
            dividerColor: const Color(0xfff5be49),
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
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  static const List<Widget> _widgetOptions = <Widget>[Home(), Favourites(), Feed(), Login()];

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
    await StockService.getStocks();
  }

  @override
  Widget build(BuildContext context) {
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
              BottomNavigationBarItem(icon: Icon(Icons.explore), label: "Feed"),
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

  // @override
  // Widget build(BuildContext context) {
  //   return Scaffold(
  //     body: Center(
  //       child: _widgetOptions.elementAt(_selectedIndex),
  //     ),
  //     bottomNavigationBar: BottomNavigationBar(
  //       items: const <BottomNavigationBarItem>[
  //         //TODO internationalize
  //         BottomNavigationBarItem(icon: Icon(Icons.waterfall_chart), label: "Home"),
  //         BottomNavigationBarItem(icon: Icon(Icons.star), label: "Favourites"),
  //         BottomNavigationBarItem(icon: Icon(Icons.explore), label: "Feed"),
  //         BottomNavigationBarItem(icon: Icon(Icons.account_circle), label: "Account"),
  //       ],
  //       currentIndex: _selectedIndex,
  //       selectedItemColor: Theme.of(context).colorScheme.primary,
  //       onTap: _onItemTapped,
  //       showSelectedLabels: true,
  //       // backgroundColor: Theme.of(context).scaffoldBackgroundColor,
  //       // type: BottomNavigationBarType.fixed,
  //       showUnselectedLabels: true,
  //       unselectedItemColor: Colors.grey,
  //     ),
  //   );
  // }
}
