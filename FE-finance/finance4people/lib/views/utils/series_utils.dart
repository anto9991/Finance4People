import 'package:finance4people/models/stock.dart';

class SeriesUtils {
  static List<StockSeriesChart> getChartSeries(List<StockSeriesChart> series, String period) {
    int length = series.length;
    switch (period) {
      case "5D":
        return calculateElements(series, DateTime(series[length - 1].date.year, series[length - 1].date.month, series[length - 1].date.day - 5));
      case "1M":
        return calculateElements(series, DateTime(series[length - 1].date.year, series[length - 1].date.month - 1, series[length - 1].date.day));
      case "6M":
        return calculateElements(series, DateTime(series[length - 1].date.year, series[length - 1].date.month - 6, series[length - 1].date.day));
      case "YTD":
        return calculateElements(series, DateTime(series[length - 1].date.year, 1, 1));
      case "1Y":
        return calculateElements(series, DateTime(series[length - 1].date.year - 1, series[length - 1].date.month, series[length - 1].date.day));
      case "5Y":
        return series;
      default:
        return series;
    }
  }

  static List<StockSeriesChart> calculateElements(List<StockSeriesChart> series, DateTime startingDate) {
    // var prevHalfYear = DateTime(series[-1].date.year, series[-1].date.month - 6, series[-1].date.day);
    int length = series.length;
    List<StockSeriesChart> res = [];
    int index = 1;
    while (series[length - index].date.isAfter(startingDate)) {
      res.insert(0,series[length - index]);
      index++;
    }
    return res;
  }
}
