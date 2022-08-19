import 'package:flutter/material.dart';

class Stock {
  final String name;
  final String ticker;
  final int value;
  ValueNotifier<bool> isFavourite = ValueNotifier<bool>(false);

  Stock({
    required this.name, 
    required this.ticker, 
    required this.value,
    required this.isFavourite
  });

  factory Stock.fromJson(Map<String, dynamic> json){
    try{
      return Stock(
      name: json['name'],
      ticker: json['ticker'],
      value: json['value'],
      isFavourite: ValueNotifier<bool>(json['isFavourite']?? false) 
    );
    }catch(error){
      throw(Exception(error));
    } 
  }

  void setFavourite(){
    isFavourite.value = !isFavourite.value;
  }
}