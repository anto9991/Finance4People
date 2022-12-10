import 'dart:convert';

import 'package:flutter/material.dart';

class Stock {
  final String name;
  final String ticker;
  final String sector;
  final String currency;
  // These two are in fact JSON objects but since there's no interest in parsing them here they'll stay string
  final String keyStats;
  List<StockSeriesChart> series;
  ValueNotifier<bool> isFavourite;

  Stock(
      {required this.name, required this.ticker, required this.sector, required this.currency, required this.keyStats, required this.series, required this.isFavourite});

  factory Stock.fromJson(Map<String, dynamic> json) {
    try {
      List<StockSeriesChart> parsedSeries = [];
      var length = json["series"][0]["y5_wk1"]["close"].length;
      //TODO get from be daily with 1 year
      for (int i = (length~/2)+100; i < length; i++) {
        var date = json["series"][0]["y5_wk1"]["timestamp"][i];
        var close = json["series"][0]["y5_wk1"]["close"][i];
        if(date != null && close != null){
          parsedSeries.add(StockSeriesChart(DateTime.fromMillisecondsSinceEpoch(date * 1000), close));
        }
      }

      return Stock(
          name: json['name'],
          ticker: json['ticker'],
          currency: json['currency'],
          sector: json['sector'],
          keyStats: jsonEncode(json['keyStatistics']),
          series: parsedSeries,
          isFavourite: ValueNotifier<bool>(json['isFavourite'] ?? false));
    } catch (error) {
      throw (Exception(error));
    }
  }

  void setFavourite() {
    isFavourite.value = !isFavourite.value;
  }

  // List<StockSeriesChart> parseSeries(String json) {
  //   var decodedStock = jsonDecode(json);
  //   var data = decodedStock["series"][0]["y5_wk1"];
  //   print("Printing data: $data");
  //   List<StockSeriesChart> chartData = [];

  //   for (var i = 0; i < data["timestamp"].length; i++) {
  //     chartData.add(StockSeriesChart(DateTime.fromMillisecondsSinceEpoch(data["timestamp"][i] * 1000), data["close"][i]));
  //   }
  //   return chartData;
  // }
}

class StockSeriesChart {
  StockSeriesChart(this.date, this.close);

  final DateTime date;
  final num close;
}
