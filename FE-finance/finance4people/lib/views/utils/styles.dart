import 'package:flutter/material.dart';

@immutable
class ContentDivider extends StatelessWidget {
  const ContentDivider({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      child: Container(
        height: 0.5,
        width: MediaQuery.of(context).size.width * 1,
        color: Theme.of(context).dividerColor,
      ),
    );
  }
}
