import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/services/stock_service.dart';
import 'package:finance4people/services/stock_store.dart';
import 'package:finance4people/views/pages/account.dart';
import 'package:finance4people/views/pages/favourites.dart';
import 'package:finance4people/views/pages/home.dart';
import 'package:flutter/material.dart';

void main() {
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
//import 'package:finance4people/models/stock.dart';
// import 'package:finance4people/services/stock_store.dart';
// import 'package:flutter/material.dart';

// class StockContainer extends StatefulWidget {
//   final Stock stock;
//   final int catIndex;
//   final int stockIndex;

//   const StockContainer(
//       {Key? key,
//       required this.stock,
//       required this.stockIndex,
//       required this.catIndex})
//       : super(key: key);

//   @override
//   State<StockContainer> createState() => _StockContainerState();
// }

// class _StockContainerState extends State<StockContainer> {
//   @override
//   Widget build(BuildContext context) {
//     Stock stock = StockStore.categories.categories.elementAt(widget.catIndex).stocks.elementAt(widget.stockIndex);
//     return SizedBox(
//       height: MediaQuery.of(context).size.width * 0.3,
//       child: Padding(
//           padding: const EdgeInsets.all(5),
//           child: Container(
//               decoration: BoxDecoration(
//                   color: Theme.of(context).cardColor,
//                   borderRadius: BorderRadius.circular(5)),
//               width: MediaQuery.of(context).size.width * 0.5,
//               child: Padding(
//                 padding: const EdgeInsets.all(5),
//                 child: Column(
//                   children: <Widget>[
//                     Align(
//                       alignment: Alignment.topLeft,
//                       child: Text(
//                           "${widget.stock.name} (${widget.stock.ticker}): ${widget.stock.value}USD"),
//                     ),
//                     ValueListenableBuilder(
//                         valueListenable: stock.isFavourite,
//                         builder: ((context, value, _) {
//                           print(value);
//                           return IconButton(
//                               onPressed: () {
//                                 stock.setFavourite();
//                               },
//                               icon: value == true
//                                   ? const Icon(Icons.star)
//                                   : const Icon(Icons.star_border_outlined));
//                         }))
//                   ],
//                 ),
//               ))),
//     );
//   }
// }

// class CategoryContainer extends StatelessWidget {
//   final String title;
//   final List<Stock> stocks;

//   final int catIndex;

//   const CategoryContainer(
//       {Key? key,
//       required this.title,
//       required this.catIndex,
//       required this.stocks})
//       : super(key: key);

//   @override
//   Widget build(BuildContext context) {
//     return SizedBox(
//       height: MediaQuery.of(context).size.width * 0.4,
//       child: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
//         Align(alignment: Alignment.topLeft, child: Text(title)),
//         Expanded(
//           child: ListView.builder(
//             shrinkWrap: true,
//             itemCount: stocks.length,
//             scrollDirection: Axis.horizontal,
//             itemBuilder: (BuildContext context, int index) {
//               return StockContainer(
//                 stock: stocks[index],
//                 catIndex: catIndex,
//                 stockIndex: index,
//               );
//             },
//           ),
//         )
//       ]),
//     );
//   }
// }
