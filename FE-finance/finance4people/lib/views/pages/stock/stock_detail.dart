import 'dart:convert';

import 'package:finance4people/models/stock.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:finance4people/views/utils/area_chart.dart';
import 'package:finance4people/views/utils/bottom_modal.dart';
import 'package:finance4people/views/utils/numbers.dart';
import 'package:finance4people/views/utils/series_utils.dart';
import 'package:finance4people/views/utils/text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

// ignore: must_be_immutable
class StockDetail extends StatefulWidget {
  final Stock stock;
  final bool? fromFavourites;
  List<StockSeriesChart> chartSeries = [];
  List<bool> selectedIndex = [false, false, false, false, false, true];

  StockDetail({Key? key, required this.stock, this.fromFavourites = false}) : super(key: key);

  @override
  State<StockDetail> createState() => _StockDetailState();
}

class _StockDetailState extends State<StockDetail> {
  @override
  Widget build(BuildContext context) {
    if (widget.chartSeries.isEmpty) {
      widget.chartSeries = widget.stock.series20 ?? [];
    }
    return Scaffold(
      appBar: AppBar(
        // title: Text("${widget.stock.name} (${widget.stock.ticker})", overflow: TextOverflow.ellipsis),
        title: SingleChildScrollView(scrollDirection: Axis.horizontal, child: Text("${widget.stock.name} (${widget.stock.symbol})")),
        backgroundColor: Theme.of(context).colorScheme.primary,
      ),
      body: Container(
        padding: const EdgeInsets.all(8),
        child: Wrap(alignment: WrapAlignment.start, spacing: 10, runSpacing: 5, children: <Widget>[
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Wrap(
              direction: Axis.horizontal,
              spacing: MediaQuery.of(context).size.width * 0.045,
              children: [
                ChartDateButton(
                    text: "5D",
                    isSelected: widget.selectedIndex[0],
                    onPressed: () {
                      setState(() {
                        widget.chartSeries = SeriesUtils.getChartSeries(widget.stock.series1 ?? [], "5D");
                        widget.selectedIndex = [true, false, false, false, false, false];
                      });
                    }),
                ChartDateButton(
                    text: "1M",
                    isSelected: widget.selectedIndex[1],
                    onPressed: () {
                      setState(() {
                        widget.chartSeries = SeriesUtils.getChartSeries(widget.stock.series1 ?? [], "1M");
                        widget.selectedIndex = [false, true, false, false, false, false];
                      });
                    }),
                ChartDateButton(
                    text: "6M",
                    isSelected: widget.selectedIndex[2],
                    onPressed: () {
                      setState(() {
                        widget.chartSeries = SeriesUtils.getChartSeries(widget.stock.series1 ?? [], "6M");
                        widget.selectedIndex = [false, false, true, false, false, false];
                      });
                    }),
                ChartDateButton(
                    text: "YTD",
                    isSelected: widget.selectedIndex[3],
                    onPressed: () {
                      setState(() {
                        widget.chartSeries = SeriesUtils.getChartSeries(widget.stock.series20 ?? [], "YTD");
                        widget.selectedIndex = [false, false, false, true, false, false];
                      });
                    }),
                ChartDateButton(
                    text: "1Y",
                    isSelected: widget.selectedIndex[4],
                    onPressed: () {
                      setState(() {
                        widget.chartSeries = SeriesUtils.getChartSeries(widget.stock.series20 ?? [], "1Y");
                        widget.selectedIndex = [false, false, false, false, true, false];
                      });
                    }),
                ChartDateButton(
                    text: "5Y",
                    isSelected: widget.selectedIndex[5],
                    onPressed: () {
                      setState(() {
                        widget.chartSeries = widget.stock.series20 ?? [];
                        widget.selectedIndex = [false, false, false, false, false, true];
                      });
                    }),
              ],
            ),
          ),
          Row(
            children: [
              SizedBox(
                width: MediaQuery.of(context).size.width * 0.95,
                height: MediaQuery.of(context).size.width * 0.4,
                child: widget.chartSeries.isNotEmpty == true
                    ? AreaChart(series: widget.chartSeries, isReduced: false)
                    : Center(
                        child: Text(
                        AppLocalizations.of(context)!.noData,
                        style: const TextStyle(color: Colors.grey),
                      )),
              )
            ],
          ),
          const Divider(
            thickness: 2,
          ),
          // Social Section
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            // children: [Text(AppLocalizations.of(context)!.lastWeekViews)],
            children: [Text("${AppLocalizations.of(context)!.stats}", style: Theme.of(context).textTheme.headline6)],
          ),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 10,
            children: [
              StatsChip(
                width: 0.95,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: getKeyStats(),
                ),
              ),
              // StatsChip(
              //   child: Column(
              //     crossAxisAlignment: CrossAxisAlignment.start,
              //     children: getKeyStats(1),
              //   ),
              // )
            ],
          ),
          const Divider(
            thickness: 2,
          ),
          // Social Section
          // Row(
          //   mainAxisAlignment: MainAxisAlignment.start,
          //   //TODO modificare con "... settimana sui social"
          //   children: [Text(AppLocalizations.of(context)!.lastWeekViews, style: Theme.of(context).textTheme.headline6)],
          // ),
          SizedBox(height: MediaQuery.of(context).size.height * 0.005),
          // Row(
          //   mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          //   children: const [
          //     SocialChip(name: "Twitter", counter: 100000, color: Colors.blue),
          //     // SizedBox(width: MediaQuery.of(context).size.width * 0.05),
          //     // const SocialChip(name: "Reddit", counter: 35000, color: Colors.red),
          //   ],
          // )
        ]),
      ),
    );
  }

  List<Widget> getKeyStats() {
    List<Widget> keyStats = [];

    keyStats.add(SingleStatChip(bold: "Beta", plain: widget.stock.beta ?? "N.A.", imageName: "Beta"));
    keyStats
        .add(SingleStatChip(bold: "Earning Yield", plain: widget.stock.earningYield != null ? widget.stock.earningYield!.toStringAsFixed(2) : "N.A.", imageName: "EY"));
    keyStats.add(SingleStatChip(
        bold: "Return on capital", plain: widget.stock.returnOnCapital != null ? widget.stock.returnOnCapital!.toStringAsFixed(2) : "N.A.", imageName: "ROC"));
    keyStats.add(SingleStatChip(bold: "Enterprise value", plain: widget.stock.enterpriseValue.toString(), imageName: "EV"));
    keyStats.add(SingleStatChip(bold: "Volume", plain: widget.stock.volume.toString(), imageName: "Volume"));
    keyStats.add(SingleStatChip(bold: "Forward PE", plain: widget.stock.forwardPE ?? "N.A.", imageName: "PE"));
    keyStats.add(SingleStatChip(bold: "Trailing PE", plain: widget.stock.trailingPE ?? "N.A.", imageName: "PE"));
    keyStats.add(SingleStatChip(bold: "Trailing EPS", plain: widget.stock.trailingEPS ?? "N.A.", imageName: "EPS"));
    keyStats.add(SingleStatChip(bold: "52 Weeks Low", plain: widget.stock.wl52 ?? "N.A.", imageName: "Whl52"));
    keyStats.add(SingleStatChip(bold: "52 Weeks High", plain: widget.stock.wh52 ?? "N.A.", imageName: "Whl52"));

    return keyStats;
  }
}

class SingleStatChip extends StatelessWidget {
  final String bold;
  final String plain;
  final String imageName;

  const SingleStatChip({Key? key, required this.bold, required this.plain, required this.imageName}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    double fontSize = 14.5;
    return BoldAndPlainSpaceBetween(
      bold: bold,
      plain: plain,
      fontSize: fontSize,
      widget: IconButton(
          padding: const EdgeInsets.only(bottom: 2, left: 2),
          constraints: const BoxConstraints(minHeight: 0, minWidth: 0),
          iconSize: 18,
          splashColor: Colors.transparent,
          color: Theme.of(context).colorScheme.secondary,
          onPressed: () {
            var image = StockStore.images[imageName];
            showModalBottomSheet<void>(
                backgroundColor: image!.color,
                isScrollControlled: true,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                context: context,
                builder: (BuildContext context) {
                  return BottomModal(
                    color: image.color,
                    image: Image.asset(
                      image.path,
                      height: MediaQuery.of(context).size.height * image.infographicHeight,
                    ),
                    modalHeight: MediaQuery.of(context).size.height * image.modalHeight,
                  );
                });
          },
          icon: const Icon(Icons.help)),
    );
  }
}

@immutable
class StatsChip extends StatelessWidget {
  final Widget child;
  final double? width;

  const StatsChip({Key? key, required this.child, this.width}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(5),
      width: MediaQuery.of(context).size.width * (width ?? 0.465),
      // height: MediaQuery.of(context).size.height * 0.2,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: child,
    );
  }
}

class SocialChip extends StatefulWidget {
  final String name;
  final int counter;
  final MaterialColor color;

  const SocialChip({Key? key, required this.name, required this.counter, required this.color}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _SocialChipState();
}

class _SocialChipState extends State<SocialChip> with SingleTickerProviderStateMixin {
  late Animation animation;
  late AnimationController animationController;

  @override
  void initState() {
    super.initState();
    animationController = AnimationController(duration: const Duration(seconds: 1), vsync: this);
    animation = IntTween(begin: 0, end: widget.counter).animate(CurvedAnimation(parent: animationController, curve: Curves.easeOut));
    animationController.forward();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(5),
      decoration: BoxDecoration(
        border: Border.all(color: widget.color),
        borderRadius: BorderRadius.circular(5),
        color: widget.color[100],
      ),
      height: MediaQuery.of(context).size.width * 0.2,
      width: MediaQuery.of(context).size.width * 0.4,
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
        SizedBox(
            height: MediaQuery.of(context).size.width * 0.12,
            width: MediaQuery.of(context).size.width * 0.12,
            child: Image.asset(
              "assets/images/${widget.name.toLowerCase()}.png",
              height: MediaQuery.of(context).size.width * 0.1,
            )),
        AnimatedBuilder(
            animation: animationController,
            builder: (context, child) {
              return Text(animation.value.toString(), style: DefaultTextStyle.of(context).style.apply(color: widget.color[700]));
            })
      ]),
    );
  }

  @override
  void dispose() {
    animationController.dispose();
    super.dispose();
  }
}

@immutable
class RowContainer extends StatelessWidget {
  final Widget child;

  const RowContainer({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(height: MediaQuery.of(context).size.height * 0.03, child: child);
  }
}

@immutable
class ChartDateButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isSelected;

  const ChartDateButton({Key? key, required this.text, required this.onPressed, this.isSelected = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width * 0.12,
      decoration: BoxDecoration(
        color: isSelected ? Theme.of(context).colorScheme.secondary : Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(5),
      ),
      child: TextButton(
        style: ButtonStyle(overlayColor: MaterialStateProperty.all(Colors.transparent)),
        onPressed: onPressed,
        child: Text(text, style: TextStyle(color: Theme.of(context).textTheme.headline1!.color)),
      ),
    );
  }
}
