import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/services/stock_service.dart';
import 'package:finance4people/services/stock_store.dart';
import 'package:finance4people/views/pages/account.dart';
import 'package:finance4people/views/pages/favourites.dart';
import 'package:finance4people/views/pages/home.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async{
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
      theme: ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: Colors.red,
        cardColor: const Color(0xFFF4F4F4),
        primaryColorDark: Colors.blueAccent
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);
  final String title;
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {

  static const List<Widget> _widgetOptions = <Widget>[
    Home(),
    Favourites(),
    Account()
  ];

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
    StockStore.categories = CategoriesContainer(categories: await StockService.getStocks());
  }
    

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.waterfall_chart),label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.star), label: "Favourites"),
          BottomNavigationBarItem(icon: Icon(Icons.account_circle), label: "Account"),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue,
        onTap: _onItemTapped,
        showSelectedLabels: false,
        showUnselectedLabels: false,
      ),
    );
  }
}
