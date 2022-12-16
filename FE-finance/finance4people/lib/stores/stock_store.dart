import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/models/stock.dart';
import 'package:flutter/material.dart';

class StockStore {
  static final StockStore stockStore = StockStore._internal();

  factory StockStore() {
    return stockStore;
  }

  StockStore._internal();

  // View driven properties
  static String selectedCatType = catTypes[0];
  static List<String> catTypes = ["Greenblatt", "Sharpe"];
  static bool betaSelected = true;
  // Data storage properties
  static ValueNotifier<bool> isLoading = ValueNotifier<bool>(true);
  static CategoriesContainer categoriesGreenBlatt = CategoriesContainer(categories: []);
  static CategoriesContainer favouritesGreenBlatt = CategoriesContainer(categories: []);
  static CategoriesContainer categoriesSharpe = CategoriesContainer(categories: []);
  static CategoriesContainer favouritesSharpe = CategoriesContainer(categories: []);
  static List<Stock> greenblattNoBeta = [];
  static List<Stock> favouritesGreenblattNoBeta = [];
  static List<Stock> sharpeNoBeta = [];
  static List<Stock> favouritesSharpeNoBeta = [];
}
