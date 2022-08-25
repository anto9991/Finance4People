import 'package:finance4people/models/stock.dart';
import 'package:finance4people/views/utils/styles.dart';
import 'package:finance4people/views/utils/text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class StockDetail extends StatelessWidget {
  final Stock stock;

  const StockDetail({Key? key, required this.stock}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      child: Wrap(
          alignment: WrapAlignment.start,
          spacing: 10,
          runSpacing: 5,
          children: <Widget>[
            Row(
              children: [
                SizedBox(
                    height: MediaQuery.of(context).size.width * 0.1,
                    child: CustomTitle(
                        string: "${stock.name} (${stock.ticker})", size: 2.0)),
              ],
            ),
            Row(
              children: [
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.5,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      BoldAndPlain(bold: "P/E", plain: "15"),
                      BoldAndPlain(bold: "Market Cap.", plain: "20mln\$"),
                      BoldAndPlain(bold: "PEG", plain: "32"),
                      BoldAndPlain(bold: "Dividend yield", plain: "150"),
                    ],
                  ),
                ),
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.44,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      BoldAndPlain(bold: "P/E", plain: "15"),
                      BoldAndPlain(bold: "Market Cap.", plain: "20mln\$"),
                      BoldAndPlain(bold: "PEG", plain: "32"),
                      BoldAndPlain(bold: "Dividend yield", plain: "150"),
                    ],
                  ),
                )
              ],
            ),

            const ContentDivider(),
            // Social Section
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [Text(AppLocalizations.of(context)!.lastWeekViews)],
            ),
            SizedBox(height: MediaQuery.of(context).size.height * 0.01),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                const SocialContainer(
                    name: "Twitter", counter: 100000, color: Colors.blue),
                SizedBox(width: MediaQuery.of(context).size.width * 0.05),
                const SocialContainer(
                    name: "Reddit", counter: 35000, color: Colors.red),
              ],
            )
          ]),
    );
  }
}

class SocialContainer extends StatefulWidget {
  final String name;
  final int counter;
  final MaterialColor color;

  const SocialContainer(
      {Key? key,
      required this.name,
      required this.counter,
      required this.color})
      : super(key: key);

  @override
  State<StatefulWidget> createState() => _SocialContainerState();
}

class _SocialContainerState extends State<SocialContainer>
    with SingleTickerProviderStateMixin {
  late Animation animation;
  late AnimationController animationController;

  @override
  void initState() {
    super.initState();
    animationController =
        AnimationController(duration: const Duration(seconds: 1), vsync: this);
    animation = IntTween(begin: 0, end: widget.counter).animate(
        CurvedAnimation(parent: animationController, curve: Curves.easeOut));
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
              return Text(animation.value.toString(),
                  style: DefaultTextStyle.of(context)
                      .style
                      .apply(color: widget.color[700]));
            })
      ]),
    );
  }
}

@immutable
class RowContainer extends StatelessWidget {
  final Widget child;

  const RowContainer({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        height: MediaQuery.of(context).size.height * 0.03, child: child);
  }
}
