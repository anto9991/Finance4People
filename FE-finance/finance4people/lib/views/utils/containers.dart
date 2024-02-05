import 'dart:convert';

import 'package:finance4people/models/stock.dart';
import 'package:finance4people/services/stock_service.dart';
import 'package:finance4people/stores/app_store.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:finance4people/views/pages/stock/stock_detail.dart';
import 'package:finance4people/views/utils/area_chart.dart';
import 'package:finance4people/views/utils/series_utils.dart';
import 'package:finance4people/views/utils/text.dart';
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
  List<Widget> getKeyStats() {
    // var decodedKeystats = jsonDecode(widget.stock.keyStats);

    List<Widget> keyStats = [];
    keyStats.add(
      BoldAndPlain(bold: "Beta", plain: widget.stock.beta ?? "N.A.", fontSize: 11),
    );
    if (StockStore.selectedCatType == "Greenblatt") {
      keyStats.add(
        BoldAndPlain(bold: "R.O.C.", plain: widget.stock.returnOnCapital != null ? widget.stock.returnOnCapital!.toStringAsFixed(2) : "N.A.", fontSize: 11),
      );
      keyStats.add(
        BoldAndPlain(bold: "Earning Yield", plain: widget.stock.earningYield != null ? widget.stock.earningYield!.toStringAsFixed(2) : "N.A.", fontSize: 11),
      );
    } else if (StockStore.selectedCatType == "Sharpe") {
      keyStats.add(
        BoldAndPlain(bold: "Sharpe(1Y)", plain: widget.stock.oneYearSharpeRatio != null ? widget.stock.oneYearSharpeRatio!.toStringAsFixed(2) : "N.A.", fontSize: 11),
      );
    }
    keyStats.add(BoldAndPlain(bold: "Market cap", plain: widget.stock.marketCap != null ? widget.stock.marketCap!.toStringAsFixed(2) : "N.A.", fontSize: 11));

    keyStats.add(
      BoldAndPlain(bold: "Trailing P/E", plain: widget.stock.trailingPE ?? "N.A.", fontSize: 11),
    );
    keyStats.add(
      BoldAndPlain(bold: "Trailing EPS", plain: widget.stock.trailingEPS ?? "N.A.", fontSize: 11),
    );

    return keyStats;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      child: SizedBox(
        height: MediaQuery.of(context).size.width * 0.4,
        child: Padding(
            padding: const EdgeInsets.all(4),
            child: Container(
                decoration: BoxDecoration(
                  // Background color
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(5),
                  // border: Border.all(color: Theme.of(context).dividerColor)
                  border: AppStore.themeMode.value == ThemeMode.dark ? Border.all(width: 1.5, color: Theme.of(context).colorScheme.secondary) : null,
                ),
                width: MediaQuery.of(context).size.width * 0.67,
                child: Column(
                  // crossAxisAlignment: WrapCrossAlignment.center,
                  // alignment: WrapAlignment.spaceBetween,
                  children: [
                    // Ticker, title and favourite row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.only(left: 5),
                          width: MediaQuery.of(context).size.width * 0.55,
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.50),
                          child: Text("(${widget.stock.symbol}) ${widget.stock.name}", overflow: TextOverflow.ellipsis),
                        ),
                        ValueListenableBuilder(
                            valueListenable: widget.stock.isFavourite,
                            builder: ((context, value, _) {
                              return IconButton(
                                  padding: const EdgeInsets.all(2),
                                  constraints: const BoxConstraints(minHeight: 1, minWidth: 1),
                                  splashColor: Colors.transparent,
                                  onPressed: () {
                                    widget.stock.setFavourite();
                                    StockService.setFavourite(widget.stock.id, widget.stock.isFavourite.value);
                                  },
                                  icon: value == true
                                      ? Icon(Icons.star, color: Theme.of(context).colorScheme.secondary)
                                      : Icon(Icons.star_border_outlined, color: Theme.of(context).colorScheme.secondary));
                            })),
                      ],
                    ),
                    const Divider(
                      thickness: 2,
                    ),
                    // Series and info row
                    Wrap(
                      alignment: WrapAlignment.start,
                      children: <Widget>[
                        Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              // border: Border.all(width: 1, color: Theme.of(context).dividerColor),
                            ),
                            width: MediaQuery.of(context).size.width * 0.35,
                            height: MediaQuery.of(context).size.width * 0.20,
                            child: widget.stock.series1 != []
                                ? AreaChart(series: SeriesUtils.getChartSeries(widget.stock.series1!, "6M"), isReduced: true)
                                : Center(
                                    child: Text(
                                    AppLocalizations.of(context)!.noData,
                                    style: const TextStyle(color: Colors.grey),
                                  ))),
                        SizedBox(
                          // decoration: BoxDecoration(
                          //   border: Border.all(width: 1, color: Theme.of(context).dividerColor),
                          // ),
                          width: MediaQuery.of(context).size.width * 0.30,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: getKeyStats(),
                          ),
                        )
                      ],
                    )
                  ],
                ))),
      ),
      onTap: () {
        // showModalBottomSheet<void>(
        //     isScrollControlled: true,
        //     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
        //     context: context,
        //     builder: (BuildContext context) {
        //       return BottomModal(child: StockDetail(stock: widget.stock));
        //     });
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => StockDetail(stock: widget.stock)),
        );
      },
    );
  }
}

class CategoryContainer extends StatelessWidget {
  final bool favouritesPage;
  final String title;
  final List<dynamic> stocks;
  final String emptyCatString;

  const CategoryContainer({Key? key, required this.title, required this.stocks, required this.emptyCatString, this.favouritesPage = false}) : super(key: key);

  String getLocalization(BuildContext context, String title) {
    switch (title) {
      case "beta1.5":
        return AppLocalizations.of(context)!.beta15;
      case "beta1.2":
        return AppLocalizations.of(context)!.beta12;
      case "beta0.7":
        return AppLocalizations.of(context)!.beta07;
      case "beta0.5":
        return AppLocalizations.of(context)!.beta05;
      default:
        return "Beta";
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.width * 0.42,
      child: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
        Row(
          children: [
            Text(getLocalization(context, title), style: Theme.of(context).textTheme.titleLarge),
            // IconButton(
            //     padding: const EdgeInsets.only(bottom: 2, left: 5),
            //     constraints: const BoxConstraints(minHeight: 0, minWidth: 0),
            //     iconSize: 18,
            //     splashColor: Colors.transparent,
            //     color: Theme.of(context).colorScheme.secondary,
            //     onPressed: () {
            //       showModalBottomSheet<void>(
            //           isScrollControlled: true,
            //           shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
            //           context: context,
            //           builder: (BuildContext context) {
            //             return BottomModal(child: Text(AppLocalizations.of(context)!.cat1Desc));
            //           });
            //     },
            //     icon: const Icon(Icons.help))
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
          borderRadius: BorderRadius.circular(10)
        ),
      padding: const EdgeInsets.all(10),
      margin: const EdgeInsets.all(10),
      child: child,
    );
  }
}
