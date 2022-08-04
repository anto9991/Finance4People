import 'package:finance4people/models/stock.dart';

class StockCategory{
  final String title;
  final List<Stock> stocks;

  StockCategory({
    required this.title,
    required this.stocks
  });

  factory StockCategory.fromJson(Map<String, dynamic> json){
    return StockCategory(
      title: json['title'],
      stocks: json['stocks']
    );
  }
}