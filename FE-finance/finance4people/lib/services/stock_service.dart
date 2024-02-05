import 'dart:convert';
import 'dart:io';

import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/models/stock.dart';
import 'package:finance4people/models/stock_category.dart';
import 'package:finance4people/stores/auth_store.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:http/http.dart' as http;
import 'env.dart' as env;

class StockService {
  static final StockService stockService = StockService._internal();

  factory StockService() {
    return stockService;
  }
  StockService._internal();

  static dynamic getStocks(String? categorization, bool? beta) async {
    if (beta != null) StockStore.betaSelected = beta;
    if (categorization != null) StockStore.selectedCatType = categorization;
    var res;
    if (StockStore.betaSelected) {
      if (StockStore.selectedCatType == "Greenblatt") {
        if (StockStore.categoriesGreenBlatt.categories.isEmpty) {
          res = await fetchFromBEStocks("Greenblatt", true).then((_) => StockStore.categoriesGreenBlatt);
        }
        res = StockStore.categoriesGreenBlatt;
      } else if (StockStore.selectedCatType == "Sharpe") {
        if (StockStore.categoriesSharpe.categories.isEmpty) {
          res = await fetchFromBEStocks("Sharpe", true).then((_) => StockStore.categoriesSharpe);
        }
        res = StockStore.categoriesSharpe;
      }
    } else {
      if (StockStore.selectedCatType == "Greenblatt") {
        if (StockStore.greenblattNoBeta.isEmpty) {
          res = await fetchFromBEStocks("Greenblatt", false).then((_) => StockStore.greenblattNoBeta);
        }
        res = StockStore.greenblattNoBeta;
      } else if (StockStore.selectedCatType == "Sharpe") {
        if (StockStore.sharpeNoBeta.isEmpty) {
          res = await fetchFromBEStocks("Sharpe", false).then((_) => StockStore.sharpeNoBeta);
        }
        res = StockStore.sharpeNoBeta;
      }
    }
    // This variable will be used to display the correct data in the views
    StockStore.data = res;
  }

  // List can be of stockCategory or just stocks
  static Future<void> fetchFromBEStocks(String categorization, bool beta) async {
    // Stopwatch mainStopwatch = Stopwatch()..start();
    try {
      StockStore.isLoading.value = true;
      // Stopwatch stopwatch1 = Stopwatch()..start();

      final queryParams = {'catType': categorization, 'beta': beta.toString()};
      final headers = {HttpHeaders.contentTypeHeader: 'application/json'};
      var response = await http.get(Uri.http(env.host, '/stocks', queryParams), headers: headers);
      // print("Request Time: ${stopwatch1.elapsed}");
      // stopwatch1.stop();
      Stopwatch stopwatch = Stopwatch()..start();

      if (response.statusCode == 200) {
        var responseJson = jsonDecode(response.body);
        var result = [];
        result = castStocks(beta, responseJson);

        setStore(categorization, beta, result);
      } else {
        print(response.statusCode);
        throw Exception('fetchFromBEStocks request has failed');
      }
      stopwatch.stop();
      print("Flutter parsing Time: ${stopwatch.elapsed}");
    } catch (error) {
      // if (mainStopwatch.elapsed < const Duration(seconds: 1)) {
      //   await Future.delayed(const Duration(seconds: 1));
      // }
      throw (Exception(error));
    } finally {
      StockStore.isLoading.value = false;
      // mainStopwatch.stop();
      // print("Total Time: ${mainStopwatch.elapsed}");
    }
  }

  static dynamic castStocks(bool beta, dynamic responseJson) {
    var result = [];
    // TODO: FIX problem: with apple auth userFavStocks array gets populated too late
    if (beta) {
      for (var category in responseJson) {
        StockCategory stockCatToAdd = StockCategory(title: category["title"], stocks: []);
        for (var stock in category["stocks"]) {
          Stock currStock = Stock.fromJson(stock);
          currStock.isFavourite.value = AuthStore.userFavStocks.contains(currStock.id);
          stockCatToAdd.stocks.add(currStock);
        }
        result.add(stockCatToAdd);
      }
    } else {
      for (var stock in responseJson) {
        result.add(Stock.fromJson(stock));
      }
    }
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

  static List getFavourites(List stocks) {
    List favsStocks = [];
    for (Stock stock in stocks) {
      if (stock.isFavourite.value) {
        favsStocks.add(stock);
      }
    }
    return favsStocks;
  }

  static Future<bool> setFavourite(String stockId, bool value) async {
    try {
      if (AuthStore.isLogged) {
        String user;
        String code;
        if (AuthStore.appleUser != null) {
          user = AuthStore.appleUser!.appleUserCredentials!.identityToken!;
          code = "A ${AuthStore.appleUser!.nonce}";
        } else if (AuthStore.gUser?.idToken != "") {
          user = AuthStore.gUser!.idToken;
          code = "G";
        } else {
          throw Exception("User should be logged");
        }

        var request = await http.post(
          Uri.http(env.host, '/stocks/$stockId/favourite'),
          headers: <String, String>{
            HttpHeaders.authorizationHeader: 'Bearer $user $code',
            HttpHeaders.contentTypeHeader: 'application/json; charset=UTF-8',
          },
          body: jsonEncode(<String, dynamic>{
            'value': value,
          }),
        );

        if (request.statusCode == 200) {
          return true;
        }
      }
      return false;
    } catch (error) {
      print(error);
      return false;
    }
  }
}
