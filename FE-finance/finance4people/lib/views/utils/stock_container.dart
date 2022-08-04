import 'package:finance4people/models/stock.dart';
import 'package:flutter/material.dart';

class StockContainer extends StatelessWidget {
  final Stock stock;
  const StockContainer({Key? key, required this.stock}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.all(5),
        child: Container(
            decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(5)),
            width: MediaQuery.of(context).size.width * 0.5,
            child: Padding(
              padding: const EdgeInsets.all(5),
              child:  Column(
              children: <Widget>[
                Align(
                  alignment: Alignment.topLeft,
                  child:
                      Text("${stock.name} (${stock.ticker}): ${stock.value}USD"),
                ),
              ],
            ),
            )));
  }
}
