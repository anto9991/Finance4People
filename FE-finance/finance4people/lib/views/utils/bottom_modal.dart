import 'package:flutter/material.dart';

class BottomModal extends StatelessWidget {
  final Widget child;

  const BottomModal(
      {Key? key,
      required this.child})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height *
          0.9,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Container(
              height: MediaQuery.of(context).size.width * 0.015,
              width: MediaQuery.of(context).size.width * 0.15,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: const BorderRadius.all(Radius.circular(8))
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            child: child,
          )
        ],
      ),
    );
  }
}
