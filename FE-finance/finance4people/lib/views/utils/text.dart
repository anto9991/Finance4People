import 'package:flutter/material.dart';

@immutable
class BoldAndPlain extends StatelessWidget {
  final String bold;
  final String plain;
  final double fontSize;

  const BoldAndPlain({Key? key, required this.bold, required this.plain, this.fontSize = 14.0}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return RichText(
      overflow: TextOverflow.ellipsis,
      text: TextSpan(
        style: TextStyle(
          fontSize: fontSize,
          color: Theme.of(context).textTheme.bodyMedium!.color,
        ),
        children: <TextSpan>[
          TextSpan(text: bold == "" ? "" : "$bold: ", style: const TextStyle(fontWeight: FontWeight.bold)),
          TextSpan(text: plain),
        ],
      ),
    );
  }
}

class BoldAndPlainSpaceBetween extends StatelessWidget {
  final Widget? widget;
  final String bold;
  final String plain;
  final double fontSize;

  const BoldAndPlainSpaceBetween({Key? key, required this.bold, required this.plain, this.fontSize = 14.0, this.widget}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        if (widget != null) ...[
          Wrap(
            children: [
              Text(
                "$bold:",
                style: TextStyle(
                  fontSize: fontSize,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).textTheme.bodyMedium!.color,
                ),
              ),
              widget!,
            ],
          ),
        ] else ...[
          Text(
            "$bold: ",
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.bodyMedium!.color,
            ),
          ),
        ],
        Text(
          plain,
          style: TextStyle(
            fontSize: fontSize,
            color: Theme.of(context).textTheme.bodyMedium!.color,
          ),
        ),
      ],
    );
  }
}

class CustomTitle extends StatelessWidget {
  final String string;
  final double size;

  const CustomTitle({Key? key, required this.string, this.size = 1.0}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Text(string, style: DefaultTextStyle.of(context).style.apply(fontSizeFactor: size));
  }
}
