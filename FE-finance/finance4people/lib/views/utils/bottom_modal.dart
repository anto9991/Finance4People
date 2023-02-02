import 'package:flutter/material.dart';

class BottomModal extends StatelessWidget {
  final Widget? child;
  final Image? image;
  final Color? color;
  final double? modalHeight;

  const BottomModal({Key? key, this.child, this.image, this.color, this.modalHeight}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: color, borderRadius: const BorderRadius.only(topLeft: Radius.circular(10), topRight: Radius.circular(10))),
      height: modalHeight ?? MediaQuery.of(context).size.height * 0.9,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Container(
              height: MediaQuery.of(context).size.width * 0.015,
              width: MediaQuery.of(context).size.width * 0.15,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: const BorderRadius.all(Radius.circular(8))),
            ),
          ),
          Container(
            // decoration: BoxDecoration(
            //   border: Border.all(color: Colors.red)
            // ),
            padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.001),
            child: image != null ? InteractiveViewer(child: image!) : child ?? const Text("Something went wrong"),
          )
        ],
      ),
    );
  }
}
