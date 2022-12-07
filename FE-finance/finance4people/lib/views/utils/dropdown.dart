import 'package:flutter/material.dart';

class CustomDropdown extends StatelessWidget {
  final String? value;
  final String? label;
  final List<String> items;
  final Function(String?)? onChanged;

  const CustomDropdown({Key? key, this.value, this.label, required this.items, this.onChanged}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Flex(
      direction: Axis.horizontal,
      children: [
      if (label != null) ...[Text("$label: ", style: const TextStyle(color: Colors.white)), SizedBox(width: MediaQuery.of(context).size.width * 0.01)],
      SizedBox(
          width: MediaQuery.of(context).size.width * 0.35,
          child: DropdownButton<String>(
              isExpanded: true,
              dropdownColor: Theme.of(context).colorScheme.primary,
              value: value,
              icon: const Icon(Icons.arrow_downward, color: Colors.white),
              iconSize: 24,
              elevation: 16,
              style: const TextStyle(color: Colors.white),
              underline: Container(
                height: 2,
                color: Theme.of(context).colorScheme.secondary,
              ),
              onChanged: onChanged,
              items: items.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(value: value, child: Text(value));
              }).toList()))
    ]);
  }
}
