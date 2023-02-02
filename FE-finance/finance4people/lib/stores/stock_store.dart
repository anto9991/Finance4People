import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/models/infographic.dart';
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
  static Map<String, Infographic> images = {
    "Greenblatt": GreenblattInfographic(),
    "Beta": BetaInfographic(),
    "Sharpe": SharpeInfographic(),
    "Whl52": Whl52Infographic(),
    "Analyst": AnalystInfographic(),
    "DividendPerShare": DividendPerShareInfographic(),
    "EPS": EPSInfographic(),
    "EV": EVInfographic(),
    "MarketCap": MarketCapInfographic(),
    "PE": PEInfographic(),
    "Volume": VolumeInfographic()
  };
}
