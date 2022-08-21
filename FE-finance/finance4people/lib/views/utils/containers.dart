import 'package:finance4people/models/stock.dart';
import 'package:flutter/material.dart';

class StockContainer extends StatefulWidget {
  final Stock stock;

  const StockContainer({
    Key? key,
    required this.stock,
  }) : super(key: key);

  @override
  State<StockContainer> createState() => _StockContainerState();
}

class _StockContainerState extends State<StockContainer> {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.width * 0.3,
      child: Padding(
          padding: const EdgeInsets.all(5),
          child: Container(
              decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(5)),
              width: MediaQuery.of(context).size.width * 0.5,
              child: Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                alignment: WrapAlignment.spaceBetween,
                children: [
                  Text(" ${widget.stock.name} (${widget.stock.ticker})"),
                  ValueListenableBuilder(
                      valueListenable: widget.stock.isFavourite,
                      builder: ((context, value, _) {
                        return IconButton(
                            padding: const EdgeInsets.all(2),
                            constraints:
                                const BoxConstraints(minHeight: 1, minWidth: 1),
                            splashColor: Colors.transparent,
                            onPressed: () {
                              widget.stock.setFavourite();
                            },
                            icon: value == true
                                ? const Icon(Icons.star)
                                : const Icon(Icons.star_border_outlined));
                      }))
                ],
              ))),
    );
  }
}

class CategoryContainer extends StatelessWidget {
  final String title;
  final List<Stock> stocks;

  const CategoryContainer({Key? key, required this.title, required this.stocks})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.width * 0.4,
      child: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
        Align(alignment: Alignment.topLeft, child: Text(title)),
        Expanded(
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: stocks.length,
            scrollDirection: Axis.horizontal,
            itemBuilder: (BuildContext context, int index) {
              return StockContainer(
                stock: stocks[index],
              );
            },
          ),
        )
      ]),
    );
  }
}
