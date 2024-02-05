import 'dart:convert';

import 'package:finance4people/stores/auth_store.dart';
import 'package:flutter/cupertino.dart';
// import 'package:flutter/material.dart';

class Stock {
  final String id;
  String? name;
  String? symbol;
  String? sector;
  String? currency;
  String? country;
  String? industry;
  String? volume;
  String? trailingPE;
  String? forwardPE;
  String? trailingEPS;
  String? analystTargetPrice;
  String? beta;
  String? wh52;
  String? wl52;
  num? propertyPlantEquipment;
  num? earningYield;
  num? oneYearSharpeRatio;
  num? ebit;
  num? enterpriseValue;
  num? marketCap;
  num? returnOnCapital;
  num? totalCurrentAssets;
  num? totalCurrentLiabilities;
  ValueNotifier<bool> isFavourite;
  List<StockSeriesChart>? series20;
  List<StockSeriesChart>? series1;

  Stock({
    required this.id,
    this.symbol,
    this.name,
    this.currency,
    this.country,
    this.sector,
    this.industry,
    this.volume,
    this.trailingPE,
    this.forwardPE,
    this.marketCap,
    this.trailingEPS,
    this.analystTargetPrice,
    this.beta,
    this.enterpriseValue,
    this.returnOnCapital,
    this.ebit,
    this.totalCurrentAssets,
    this.totalCurrentLiabilities,
    this.wh52,
    this.wl52,
    this.propertyPlantEquipment,
    this.earningYield,
    this.oneYearSharpeRatio,
    required this.isFavourite,
    this.series20,
    this.series1
  });

  factory Stock.fromJson(Map<String, dynamic> json) {
    try {
      List<StockSeriesChart> parsedSeries20 = [];
      List<StockSeriesChart> parsedSeries1 = [];
      var length20 = json["series"]["y20_w"].length;
      var length1 = json["series"]["y1_d"].length;
      for (int i = 0; i < length20; i++) {
        var date = json["series"]["y20_w"][i]["timestamp"];
        var close = double.parse(json["series"]["y20_w"][i]["close"]);
        if (date != null) {
          parsedSeries20.add(StockSeriesChart(DateTime.fromMillisecondsSinceEpoch(date), close));
        }
        if(i < length1){
          var date = json["series"]["y1_d"][i]["timestamp"];
          var close = double.parse(json["series"]["y1_d"][i]["close"]);
          if (date != null) {
            parsedSeries1.add(StockSeriesChart(DateTime.fromMillisecondsSinceEpoch(date), close));
          } 
        }
        
      }

      return Stock(
          id: json['_id'],
          symbol: json['symbol'],
          name: json['name'],
          currency: json['currency'],
          country: json['country'],
          sector: json['sector'],
          industry: json['industry'],
          volume: json['volume'],
          trailingPE: json['trailingPE'],
          marketCap: json['marketCap'],
          forwardPE: json['forwardPE'],
          trailingEPS: json['trailingEPS'],
          analystTargetPrice: json['analystTargetPrice'],
          beta: json['beta'],
          enterpriseValue: json['enterpriseValue'],
          returnOnCapital: json['returnOnCapital'],
          ebit: json['ebit'],
          totalCurrentAssets: json['totalCurrentAssets'],
          totalCurrentLiabilities: json['totalCurrentLiabilities'],
          wh52: json['wh52'],
          wl52: json['wl52'],
          propertyPlantEquipment: json['propertyPlantEquipment'],
          earningYield: json['earningYield'],
          oneYearSharpeRatio: json['oneYearSharpeRatio'],
          isFavourite: ValueNotifier<bool>(AuthStore.isLogged ? AuthStore.user.favourites.contains(json["_id"]) : false),
          series20: parsedSeries20,
          series1: parsedSeries1
          );
    } catch (error) {
      throw (Exception(error));
    }
  }

  void setFavourite() {
    isFavourite.value = !isFavourite.value;
  }
}

class StockSeriesChart {
  StockSeriesChart(this.date, this.close);

  final DateTime date;
  final num close;
}
