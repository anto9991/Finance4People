class Stock {
  final String name;
  final String ticker;
  final int value;

  Stock({
    required this.name, 
    required this.ticker, 
    required this.value
  });

  factory Stock.fromJson(Map<String, dynamic> json){
    return Stock(
      name: json['name'],
      ticker: json['ticker'],
      value: json['value']
    );
  }
}