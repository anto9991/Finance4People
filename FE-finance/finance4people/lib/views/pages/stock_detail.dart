import 'package:flutter/material.dart';

class StockDetail extends StatelessWidget {
  final String title;

  const StockDetail(
      {Key? key,
      required this.title})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.width * 0.4,
      child: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
        const Expanded(
          child: Text("Ciao")
        )
      ]),
    );
  }
}