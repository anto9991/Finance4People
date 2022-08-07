import 'package:finance4people/models/stock.dart';
import 'package:finance4people/models/stock_category.dart';
import 'package:finance4people/services/stock_service.dart';
import 'package:finance4people/views/utils/containers.dart';
import 'package:flutter/material.dart';

class Favourites extends StatefulWidget {
  const Favourites({Key? key}) : super(key: key);
  @override
  State<Favourites> createState() => _FavouritesState();
}

class _FavouritesState extends State<Favourites> {
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
                  List<Stock> favourites = [];
                  for (var stock in data![index].stocks){
                    if (stock.isFavourite){
                      favourites.add(stock);
                    }
                  }
                  return CategoryContainer(
                    title: data[index].title,
                    stocks: favourites,
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
    // return Scaffold(
    //     body: Padding(
    //   padding: const EdgeInsets.all(15),
    //   child: FutureBuilder<List<StockCategory>>(
    //       future: stockListFuture,
    //       builder: (context, snapshot) {
    //         if (snapshot.hasData) {
    //           List<Stock> favourites = [];
    //           for (var stockList in snapshot.data!) {
    //             for (var stock in stockList.stocks) {
    //               favourites.add(stock);
    //             }
    //           }
    //           return ListView.builder(
    //             itemCount: favourites.length,
    //             itemBuilder: (context, index) {
    //               return StockContainer(stock: favourites.elementAt(index));
    //             },
    //           );
    //         } else if (snapshot.hasError) {
    //           return Text('${snapshot.error}');
    //         }
    //         return const Center(
    //           child: CircularProgressIndicator(),
    //         );
    //       }),
    // ));
  }
}
