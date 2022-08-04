// import 'package:finance4people/models/stock.dart';
// import 'package:finance4people/models/stock_category.dart';
// import 'package:flutter/material.dart';
// import 'package:finance4people/controllers/stock_controller.dart';

// class Home extends StatefulWidget {
//   const Home({Key? key}) : super(key: key);
//   @override
//   State<Home> createState() => _HomeState();
// }

// class _HomeState extends State<Home> {
//   late Future<List<StockCategory>> stockListFuture;

//   @override
//   void initState() {
//     super.initState();
//     stockListFuture = StockController.fetchStocks();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//         body: Padding(
//       padding: const EdgeInsets.all(15),
//       child: FutureBuilder<List<StockCategory>>(
//           future: stockListFuture,
//           builder: (context, snapshot) {
//             if (snapshot.hasData) {
//               var data = snapshot.data;
//               return ListView.builder(
//                 itemCount: data?.length,
//                 itemBuilder: (BuildContext context, int index) {
//                   return
//                      CategoriesContainer(
//                       title: data![index].title,
//                       stocks: data[index].stocks,
//                     );
//                 },
//               );
//             } else if (snapshot.hasError) {
//               return Text('${snapshot.error}');
//             }
//             return const Center(
//               child: CircularProgressIndicator(),
//             );
//           }),
//     ));
//   }
// }

// class CategoriesContainer extends StatelessWidget {
//   final String title;
//   final List<Stock> stocks;

//   const CategoriesContainer(
//       {Key? key, required this.title, required this.stocks})
//       : super(key: key);

//   @override
//   Widget build(BuildContext context) {
//     return SizedBox(
//       height: MediaQuery.of(context).size.width * 0.3,
//       child: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
//         Align(
//           alignment: Alignment.topLeft,
//           child: Text(title),
//         ),
//         Expanded(
//           child: ListView.builder(
//             shrinkWrap: true,
//             scrollDirection: Axis.horizontal,
//             itemCount: stocks.length,
//             itemBuilder: (BuildContext context, int index) {
//               return StockContainer(stock: stocks[index]);
//             },
//           ),
//         )
//       ]),
//     );
//   }
// }

import 'package:finance4people/models/stock.dart';
import 'package:finance4people/models/stock_category.dart';
import 'package:finance4people/view/generic/stock_container.dart';
import 'package:flutter/material.dart';
import 'package:finance4people/controllers/stock_controller.dart';

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  late Future<List<StockCategory>> stockListFuture;

  @override
  void initState() {
    super.initState();
    stockListFuture = StockController.fetchStocks();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Padding(
      padding: const EdgeInsets.all(15),
      child: FutureBuilder<List<StockCategory>>(
          future: stockListFuture,
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              var data = snapshot.data;
              return ListView.builder(
                itemCount: data?.length,
                itemBuilder: (BuildContext context, int index) {
                  return categoriesContainer(
                    data![index].title,
                    data[index].stocks,
                  );
                },
              );
            } else if (snapshot.hasError) {
              return Text('${snapshot.error}');
            }
            return const Center(
              child: CircularProgressIndicator(),
            );
          }),
    ));
  }

  Widget categoriesContainer(String title, List<Stock> stocks) {
    return SizedBox(
      height: MediaQuery.of(context).size.width * 0.4,
      child: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
        Align(
          alignment: Alignment.topLeft,
          child: Text(title)
        ),
        Expanded(
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: stocks.length,
            scrollDirection: Axis.horizontal,
            itemBuilder: (BuildContext context, int index) {
              return StockContainer(stock: stocks[index]);
            },
          ),
        )
      ]),
    );
  }
}

