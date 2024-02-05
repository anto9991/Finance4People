import 'package:finance4people/models/stock.dart';

class SeriesUtils {
  static List<StockSeriesChart> getChartSeries(List<StockSeriesChart> series, String period) {
    switch (period) {
      case "5D":
        return calculateElements(series, DateTime(series[0].date.year, series[0].date.month, series[0].date.day - 5));
      case "1M":
        return calculateElements(series, DateTime(series[0].date.year, series[0].date.month - 1, series[0].date.day));
      case "6M":
        return calculateElements(series, DateTime(series[0].date.year, series[0].date.month - 6, series[0].date.day));
      case "YTD":
        return calculateElements(series, DateTime(series[0].date.year, 1, 1));
      case "1Y":
        return calculateElements(series, DateTime(series[0].date.year - 1, series[0].date.month, series[0].date.day));
      case "5Y":
        return series;
      default:
        return series;
    }
  }

  static List<StockSeriesChart> calculateElements(List<StockSeriesChart> series, DateTime startingDate) {
    int length = series.length;
    List<StockSeriesChart> res = [];
    for (var index = 0; index < length; index++) {
      if (series[index].date.isAfter(startingDate)) {
        res.add(series[index]);
      }
    }
    return res;
  }
}
