import 'dart:convert';

import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/models/stock.dart';
import 'package:finance4people/models/stock_category.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class StockService {
  static final host = DotEnv().env['HOST'];
  static final StockService stockService = StockService._internal();

  factory StockService() {
    return stockService;
  }
  StockService._internal();

  // List can be of stockCategory or just stocks
  static Future<void> getStocks() async {
    try {
      Stopwatch stopwatch1 = Stopwatch()..start();
      StockStore.isLoading.value = true;
      var response = await http.get(Uri.http('localhost:3000', '/stocks'));
      var responseJson = jsonDecode(response.body);
      List<StockCategory> result = [];
      print("Request Time: ${stopwatch1.elapsed}");
      stopwatch1.stop();
      if(response.statusCode == 200){
        Stopwatch stopwatch = Stopwatch()..start();
        for(var category in responseJson){
          StockCategory stockCatToAdd = StockCategory(title: category["title"], stocks: []);
          for(var stock in category["stocks"]){
            stockCatToAdd.stocks.add(Stock.fromJson(stock));
          }
          result.add(stockCatToAdd);
        }
        print("Flutter parsing Time: ${stopwatch.elapsed}");
        stopwatch.stop();
        StockStore.categories = CategoriesContainer(categories: result);
      }else{
        throw Exception('getStocks request has failed');
      }
    } catch (error) {
      throw (Exception(error));
    } finally {
      StockStore.isLoading.value = false;
    }
  }

  static Future<CategoriesContainer> getFavourites() async {
    try {
      StockStore.isLoading.value = true;
      CategoriesContainer stockStore = StockStore.categories;
      CategoriesContainer result = CategoriesContainer(categories: []);
      int index = 0;

      for (var category in stockStore.categories) {
        result.categories.add(StockCategory(title: category.title, stocks: []));
        for (var stock in category.stocks) {
          if (stock.isFavourite.value) {
            result.categories.elementAt(index).stocks.add(stock);
          }
        }
        index++;
      }
      return result;
    } catch (error) {
      throw (Exception(error));
    } finally {
      StockStore.isLoading.value = false;
    }
  }
  // static Future<List<StockCategory>> oldGetStocks() async {
  //   try {
  //     StockStore.isLoading.value = true;
  //     // await Future.delayed(Duration(seconds: 3));
  //     var stocks = [
  //       StockCategory.fromJson({
  //         "title": "Category 1",
  //         "stocks": [
  //           Stock.fromJson({"name": "Apple", "ticker": "AAPL", "value": 200})
  //         ]
  //       }),
  //       StockCategory.fromJson({
  //         "title": "Category 2",
  //         "stocks": [
  //           Stock.fromJson({"name": "Tesla1", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla2", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla3", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla4", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla5", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla6", "ticker": "TSLA", "value": 700})
  //         ]
  //       }),
  //       StockCategory.fromJson({
  //         "title": "Category 3",
  //         "stocks": [
  //           Stock.fromJson({"name": "Apple", "ticker": "AAPL", "value": 200})
  //         ]
  //       }),
  //       StockCategory.fromJson({
  //         "title": "Category 4",
  //         "stocks": [
  //           Stock.fromJson({"name": "Tesla1", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla2", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla3", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla4", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla5", "ticker": "TSLA", "value": 700}),
  //           Stock.fromJson({"name": "Tesla6", "ticker": "TSLA", "value": 700})
  //         ]
  //       })
  //     ];
  //     // final response = await http.get(Uri.parse('some-url'));

  //     // if(response.statusCode == 200){
  //     //   return Stock.fromJson(jsonDecode(response.body));
  //     // }else{
  //     //   throw Exception('FetchAlbum request has failed');
  //     // }
  //     return stocks;
  //   } catch (error) {
  //     throw (Exception(error));
  //   } finally {
  //     StockStore.isLoading.value = false;
  //   }
  // }
}
