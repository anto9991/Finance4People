import 'dart:convert';
import 'dart:io';

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
  static Future<void> fetchFromBEStocks(String categorization, bool beta) async {
    Stopwatch mainStopwatch = Stopwatch()..start();
    print("calling BE");
    try {
      StockStore.isLoading.value = true;
      Stopwatch stopwatch1 = Stopwatch()..start();
      
      final queryParams = {
        'catType': categorization, 
        'beta': beta.toString()
      };
      final headers = {
        HttpHeaders.contentTypeHeader: 'application/json'
      };

      var response = await http.get(Uri.http('localhost:3000', '/stocks', queryParams), headers: headers);
      print("Request Time: ${stopwatch1.elapsed}");
      stopwatch1.stop();
      Stopwatch stopwatch = Stopwatch()..start();

      if (response.statusCode == 200) {
        var responseJson = jsonDecode(response.body);
        var result = [];
        result = castStocks(beta, responseJson);

        setStore(categorization, beta, result);
      } else {
        throw Exception('fetchFromBEStocks request has failed');
      }
      stopwatch.stop();
      print("Flutter parsing Time: ${stopwatch.elapsed}");
    } catch (error) {
      if(mainStopwatch.elapsed < const Duration(seconds: 1)){
        print("make await");
        await Future.delayed(const Duration(seconds: 1));
      }
      throw (Exception(error));
    } finally {
      StockStore.isLoading.value = false;
      mainStopwatch.stop();
      print("Total Time: ${mainStopwatch.elapsed}");
    }
  }

  static dynamic castStocks(bool beta, dynamic responseJson) {
    var result = [];
    if (beta) {
      for (var category in responseJson) {
        StockCategory stockCatToAdd = StockCategory(title: category["title"], stocks: []);
        for (var stock in category["stocks"]) {
          stockCatToAdd.stocks.add(Stock.fromJson(stock));
        }
        result.add(stockCatToAdd);
      }
    } else {}
    return result;
  }

  static void setStore(String categorization, bool beta, dynamic data) {
    if (categorization == "Greenblatt") {
      if (beta) {
        StockStore.categoriesGreenBlatt = CategoriesContainer(categories: data);
      } else {
        StockStore.greenblattNoBeta = data;
      }
    } else if (categorization == "Sharpe") {
      if (beta) {
        StockStore.categoriesSharpe = CategoriesContainer(categories: data);
      } else {
        StockStore.sharpeNoBeta = data;
      }
    }
  }

  static Future<CategoriesContainer> getFavourites() async {
    try {
      StockStore.isLoading.value = true;
      CategoriesContainer stockStore = StockStore.categoriesGreenBlatt;
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

  static Future<dynamic> getStocks() async {
    if (StockStore.betaSelected) {
      if (StockStore.selectedCatType == "Greenblatt") {
        if (StockStore.categoriesGreenBlatt.categories.isEmpty) {
          await fetchFromBEStocks("Greenblatt", true).then((value) => StockStore.categoriesGreenBlatt);
        }
        return StockStore.categoriesGreenBlatt;
      } else if (StockStore.selectedCatType == "Sharpe") {
        if (StockStore.categoriesSharpe.categories.isEmpty) {
          await fetchFromBEStocks("Sharpe", true).then((value) => StockStore.categoriesSharpe);
        }
        return StockStore.categoriesSharpe;
      }
    } else {
      if (StockStore.selectedCatType == "Greenblatt") {
        if (StockStore.greenblattNoBeta.isEmpty) {
          await fetchFromBEStocks("Greenblatt", false).then((value) => StockStore.greenblattNoBeta);
        }
        return StockStore.greenblattNoBeta;
      } else if (StockStore.selectedCatType == "Sharpe") {
        if (StockStore.sharpeNoBeta.isEmpty) {
          await fetchFromBEStocks("Sharpe", false).then((value) => StockStore.sharpeNoBeta);
        }
        return StockStore.sharpeNoBeta;
      }
    }
  }
}
