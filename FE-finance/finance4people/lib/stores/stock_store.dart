import 'package:finance4people/models/categories_container.dart';
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
  static int keyStatsIndex = 0;
  // Data storage properties
  static ValueNotifier<bool> isLoading = ValueNotifier<bool>(true);
  static CategoriesContainer categoriesGreenBlatt = CategoriesContainer(categories: []);
  static CategoriesContainer favouritesBeta = CategoriesContainer(categories: []);
  static CategoriesContainer categoriesSharpe = CategoriesContainer(categories: []);
  static List<dynamic> greenblattNoBeta = [];
  static List<dynamic> favouritesNoBeta = [];
  static List<dynamic> sharpeNoBeta = [];
  static dynamic data;
}
