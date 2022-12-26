// import 'dart:convert';

// import 'package:finance4people/models/stock.dart';
// import 'package:finance4people/models/stock_category.dart';
// import 'package:finance4people/stores/stock_store.dart';
// import 'package:flutter_dotenv/flutter_dotenv.dart';
// import 'package:http/http.dart' as http;

// class FeedService {
//   static final host = DotEnv().env['HOST'];
//   static final FeedService stockService = FeedService._internal();

//   factory FeedService() {
//     return stockService;
//   }
//   FeedService._internal();

//   static Future<dynamic> getStocks() async {
//     try {
//       var response = await http.get(Uri.http('localhost:3000', '/stocks'));
//       var responseJson = jsonDecode(response.body);
//       List<StockCategory> result = [];

//       if (response.statusCode == 200) {
        
//         for (var category in responseJson) {
//           StockCategory stockCatToAdd = StockCategory(title: category["title"], stocks: []);
        
//           for (var stock in category["stocks"]) {
//             stockCatToAdd.stocks.add(Stock.fromJson(stock));
//           }
//           result.add(stockCatToAdd);
//         }
        
//         return result;

//       } else {
//         throw Exception('getStocks request has failed');
//       }
//     } catch (error) {
//       throw (Exception(error));
//     } finally {
//       StockStore.isLoading.value = false;
//     }
//   }
// }
