// import 'package:flutter/widgets.dart';
// import 'package:intl/intl.dart';

class CustomDate {
  // String italianFormat (BuildContext context ,DateTime date) {
  //   String locale = Localizations.localeOf(context).languageCode;
  //   // if (locale == "it") {
  //   //   return "${date.day.toString()}/${date.month.toString()}/${date.year.toString()}";
  //   // } else {
  //   //   return "${date.month.toString()}/${date.day.toString()}/${date.year.toString()}";
  //   // }
  //   return DateFormat.yMd(locale).format(date);
  // }
  String monthYearItalian(DateTime date){
    return "${date.month.toString()}/${date.year.toString()}";
  }
}