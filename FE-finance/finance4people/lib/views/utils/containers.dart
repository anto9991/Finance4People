import 'package:finance4people/models/stock.dart';
import 'package:finance4people/views/pages/stock/stock_detail.dart';
import 'package:finance4people/views/utils/bottom_modal.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

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
    return GestureDetector(
      child: SizedBox(
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
                              constraints: const BoxConstraints(
                                  minHeight: 1, minWidth: 1),
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
      ),
      onTap: () {
        showModalBottomSheet<void>(
            isScrollControlled: true,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
            context: context,
            builder: (BuildContext context) {
              return BottomModal(
                  child: StockDetail(
                stock: widget.stock,
              ));
            });
      },
    );
  }
}

class CategoryContainer extends StatelessWidget {
  final String title;
  final List<Stock> stocks;
  final String emptyCatString;

  const CategoryContainer(
      {Key? key,
      required this.title,
      required this.stocks,
      required this.emptyCatString})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.width * 0.4,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
        Row(
          children: [
            Text(title),
            IconButton(
                padding: const EdgeInsets.only(bottom: 2, left: 5),
                constraints: const BoxConstraints(minHeight: 0, minWidth: 0),
                iconSize: 18,
                splashColor: Colors.transparent,
                color: Theme.of(context).primaryColor,
                onPressed: () {
                  showModalBottomSheet<void>(
                      isScrollControlled: true,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(5)),
                      context: context,
                      builder: (BuildContext context) {
                        return BottomModal(
                            child:
                                Text(AppLocalizations.of(context)!.cat1Desc));
                      });
                },
                icon: const Icon(Icons.help))
          ],
        ),
        Expanded(
          child: stocks.isEmpty
              ? Center(child: Text(emptyCatString))
              : ListView.builder(
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

class GenericContainer extends StatelessWidget {
  final Widget child;
  const GenericContainer({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(10)),
      padding: const EdgeInsets.all(10),
      margin: const EdgeInsets.all(10),
      child: child,
    );
  }
}
