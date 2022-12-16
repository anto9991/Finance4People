import 'package:flutter/material.dart';

class IconButtonText extends StatelessWidget {
  final Icon icon;
  final String text;
  final void Function()? onPressed;
  final Color? color;

  const IconButtonText({Key? key, required this.icon, required this.text, this.onPressed, this.color}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
        onTap: onPressed,
        child: Container(
          width: MediaQuery.of(context).size.width * 0.3,
          decoration: BoxDecoration(
            color: color ?? Theme.of(context).textTheme.headline5?.color,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              Padding(
                padding: const EdgeInsets.only(top:8, left: 8, bottom: 8, right: 10),
                child: Icon(icon.icon, color: Theme.of(context).cardColor),
              ),
              Text(
                text,
                style: TextStyle(color: Theme.of(context).cardColor),
              )
            ],
          ),
        ));
  }
}
