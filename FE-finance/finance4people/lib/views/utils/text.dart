import 'package:flutter/material.dart';

@immutable
class BoldAndPlain extends StatelessWidget {
  final String bold;
  final String plain;

  const BoldAndPlain({Key? key, required this.bold, required this.plain})
      : super(key: key);
  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: const TextStyle(
          fontSize: 14.0,
          color: Colors.black,
        ),
        children: <TextSpan>[
          TextSpan(
              text: "$bold: ",
              style: const TextStyle(fontWeight: FontWeight.bold)),
          TextSpan(text: plain),
        ],
      ),
    );
  }
}

class CustomTitle extends StatelessWidget {
  final String string;
  final double size;

  const CustomTitle({Key? key, required this.string, this.size = 1.0})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Text(string,
        style: DefaultTextStyle.of(context).style.apply(fontSizeFactor: size));
  }
}
