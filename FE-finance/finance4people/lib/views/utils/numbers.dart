import 'package:intl/intl.dart';

class NumberUtils {
  static String formatNumber(number) {
    if(number != null){
      final formatter = NumberFormat.compact();
      return formatter.format(number);  
    }
    else{
      return "N.D.";
    }
  }
}