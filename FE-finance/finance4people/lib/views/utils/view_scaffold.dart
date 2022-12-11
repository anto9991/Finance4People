import 'package:flutter/material.dart';

class ViewScaffold extends StatelessWidget {
  final Widget child;
  final String viewName;
  
  const ViewScaffold({Key? key, required this.child, required this.viewName}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(padding: const EdgeInsets.only(bottom: 10), child: Text(viewName, style: Theme.of(context).textTheme.headline5)),
          child
        ],
      ),
    );
  }
}
