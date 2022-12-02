import 'package:finance4people/models/categories_container.dart';
import 'package:flutter/material.dart';

class StockStore {
  static final StockStore stockStore = StockStore._internal();

  factory StockStore() {
    return stockStore;
  }

  StockStore._internal();

  //Properties
  static String selectedCatType = catTypes[0];
  static List<String> catTypes = ["Greenblatt", "Sharpe"];
  static ValueNotifier<bool> isLoading = ValueNotifier<bool>(false);
  static CategoriesContainer categories = CategoriesContainer(categories: []);
  static CategoriesContainer favourites = CategoriesContainer(categories: []);
}
