import 'package:flutter/material.dart';

class BottomModal extends StatelessWidget {
  final Widget? child;
  final Image? image;

  const BottomModal(
      {Key? key,
      this.child,
      this.image})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(10), topRight: Radius.circular(10))),
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
            // decoration: BoxDecoration(
            //   border: Border.all(color: Colors.red)
            // ),
            padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.001),
            child: image ?? child,
          )
        ],
      ),
    );
  }
}
