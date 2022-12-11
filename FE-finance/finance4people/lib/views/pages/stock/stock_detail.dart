import 'dart:convert';

import 'package:finance4people/models/stock.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:finance4people/views/utils/area_chart.dart';
import 'package:finance4people/views/utils/numbers.dart';
import 'package:finance4people/views/utils/text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class StockDetail extends StatefulWidget {
  final Stock stock;
  final bool? fromFavourites;

  const StockDetail({Key? key, required this.stock, this.fromFavourites = false}) : super(key: key);

  @override
  State<StockDetail> createState() => _StockDetailState();
}

class _StockDetailState extends State<StockDetail> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // title: Text("${widget.stock.name} (${widget.stock.ticker})", overflow: TextOverflow.ellipsis),
        title: SingleChildScrollView(scrollDirection: Axis.horizontal, child: Text("${widget.stock.name} (${widget.stock.ticker})")),
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
                    onPressed: () {
                      print("5D: I've got clicked");
                    }),
                ChartDateButton(
                    text: "1M",
                    onPressed: () {
                      print("1M: I've got clicked");
                    }),
                ChartDateButton(
                    text: "6M",
                    onPressed: () {
                      print("6M: I've got clicked");
                    }),
                ChartDateButton(
                    text: "YTD",
                    onPressed: () {
                      print("YTD: I've got clicked");
                    }),
                ChartDateButton(
                    text: "1Y",
                    onPressed: () {
                      print("1Y: I've got clicked");
                    }),
                ChartDateButton(
                    text: "5Y",
                    onPressed: () {
                      print("5Y: I've got clicked");
                    }),
              ],
            ),
          ),
          Row(
            children: [
              SizedBox(
                width: MediaQuery.of(context).size.width * 0.95,
                height: MediaQuery.of(context).size.width * 0.4,
                child: widget.stock.series.isNotEmpty == true
                    ? AreaChart(series: widget.stock.series, isReduced: false)
                    : const Center(
                        child: Text(
                        //TODO add internationalization
                        "No data available",
                        style: TextStyle(color: Colors.grey),
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
            children: [Text("Statistiche", style: Theme.of(context).textTheme.headline6)],
          ),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 10,
            children: [
              StatsChip(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: getKeyStats(0),
                ),
              ),
              StatsChip(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: getKeyStats(1),
                ),
              )
            ],
          ),
          const Divider(
            thickness: 2,
          ),
          // Social Section
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            //TODO modificare con "... settimana sui social"
            children: [Text(AppLocalizations.of(context)!.lastWeekViews, style: Theme.of(context).textTheme.headline6)],
          ),
          SizedBox(height: MediaQuery.of(context).size.height * 0.005),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              const SocialChip(name: "Twitter", counter: 100000, color: Colors.blue),
              SizedBox(width: MediaQuery.of(context).size.width * 0.05),
              const SocialChip(name: "Reddit", counter: 35000, color: Colors.red),
            ],
          )
        ]),
      ),
    );
  }

  List<Widget> getKeyStats(int chipNum) {
    var decodedKeystats = jsonDecode(widget.stock.keyStats);

    List<Widget> keyStats = [];

    if (chipNum == 0) {
      if (StockStore.selectedCatType == "Greenblatt") {
        keyStats.add(
          SingleStatChip(bold: "Beta", plain: NumberUtils.formatNumber(decodedKeystats["data"]["beta"]["raw"])),
        );
        keyStats.add(
          SingleStatChip(bold: "Earning Yield", plain: NumberUtils.formatNumber(decodedKeystats["data"]["earningYield"])),
        );
        keyStats.add(
          SingleStatChip(bold: "Return on capital", plain: NumberUtils.formatNumber(decodedKeystats["data"]["returnOnCapital"])),
        );
      }
      keyStats.add(SingleStatChip(bold: "Enterprise Value", plain: "\$${decodedKeystats["data"]["enterpriseValue"]["fmt"] ?? "N.D."}"));
      keyStats.add(SingleStatChip(bold: "Forward PE", plain: NumberUtils.formatNumber(decodedKeystats["data"]["forwardPE"])));
      keyStats.add(SingleStatChip(bold: "Trailing PE", plain: NumberUtils.formatNumber(decodedKeystats["data"]["trailingPE"])));
    }
    if (chipNum == 1) {
      keyStats.add(SingleStatChip(bold: "Trailing EPS", plain: decodedKeystats["data"]["trailingEPS"]?["fmt"] ?? "N.D."));
      keyStats.add(SingleStatChip(bold: "Forward EPS", plain: NumberUtils.formatNumber(decodedKeystats["data"]["forwardEPS"])));
      keyStats.add(SingleStatChip(bold: "Analyst rating", plain: decodedKeystats["data"]["averageAnalystRating"] ?? "N.D."));
      keyStats.add(SingleStatChip(bold: "52 Weeks Low", plain: "\$${NumberUtils.formatNumber(decodedKeystats["data"]["fiftyTwoWeekLow"])}"));
      keyStats.add(SingleStatChip(bold: "52 Weeks High", plain: "\$${NumberUtils.formatNumber(decodedKeystats["data"]["fiftyTwoWeekHigh"])}"));
      keyStats.add(SingleStatChip(bold: "", plain: ""));
    }

    // keyStats.add(
    //   BoldAndPlain(bold: "Trailing P/E", plain: NumberUtils.formatNumber(decodedKeystats["data"]["trailingPE"]), fontSize: fontSize),
    // );
    // keyStats.add(
    //   BoldAndPlain(bold: "Trailing EPS", plain: NumberUtils.formatNumber(decodedKeystats["data"]["trailingEPS"]), fontSize: fontSize),
    // );
    return keyStats;
  }
}

class SingleStatChip extends StatelessWidget {
  final String bold;
  final String plain;

  const SingleStatChip({Key? key, required this.bold, required this.plain}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    double fontSize = 14.5;
    return SingleChildScrollView(scrollDirection: Axis.horizontal, child: BoldAndPlain(bold: bold, plain: plain, fontSize: fontSize));
  }
}

@immutable
class StatsChip extends StatelessWidget {
  final Widget child;

  const StatsChip({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(5),
      width: MediaQuery.of(context).size.width * 0.465,
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

  const ChartDateButton({Key? key, required this.text, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width * 0.12,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(5),
      ),
      child: TextButton(
        onPressed: onPressed,
        child: Text(text, style: TextStyle(color: Theme.of(context).textTheme.bodyText1!.color)),
      ),
    );
  }
}
