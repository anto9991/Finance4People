import 'package:finance4people/models/stock.dart';
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import 'package:intl/intl.dart';

class AreaChart extends StatefulWidget {
  final List<StockSeriesChart> series;
  final bool isReduced;

  const AreaChart({Key? key, required this.series, required this.isReduced}) : super(key: key);

  @override
  State<AreaChart> createState() => _AreaChartState();
}

class _AreaChartState extends State<AreaChart> {
  late TooltipBehavior _tooltipBehavior;

  @override
  void initState() {
    _tooltipBehavior = TooltipBehavior(
        enable: true,
        builder: (dynamic data, dynamic point, dynamic series, int pointIndex, int seriesIndex) {
          return Container(
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(5),
            ),
            padding: const EdgeInsets.all(5),
            child: Text(
              "${DateFormat.yMd(Localizations.localeOf(context).languageCode).format(data.date)}: \$${data.close.toStringAsFixed(2)}",
              style: const TextStyle(color: Colors.white),
            ),
          );
        });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SfCartesianChart(
      tooltipBehavior: _tooltipBehavior,
      plotAreaBorderWidth: 0,
      primaryXAxis: DateTimeAxis(
        isVisible: !widget.isReduced, rangePadding: ChartRangePadding.none,
        // visibleMaximum: widget.series[widget.series.length-30].date,
        // visibleMinimum:widget.series[widget.series.length-1].date
      ),
      primaryYAxis: NumericAxis(isVisible: !widget.isReduced, labelFormat: "\${value}"),
      series: <ChartSeries>[
        AreaSeries<StockSeriesChart, DateTime>(
          enableTooltip: !widget.isReduced,
          dataSource: widget.series,
          xValueMapper: (StockSeriesChart price, _) => price.date,
          yValueMapper: (StockSeriesChart price, _) => price.close,
          borderColor: widget.series[0].close > widget.series[widget.series.length - 1].close ? Colors.red : Colors.green,
          borderWidth: 3,
          gradient: LinearGradient(
            colors: widget.series[0].close > widget.series[widget.series.length - 1].close
                ? [Colors.red.withOpacity(0.6), Colors.red.withOpacity(0.0)]
                : [Colors.green.withOpacity(0.6), Colors.green.withOpacity(0.0)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        )
      ],
    );
  }
}
