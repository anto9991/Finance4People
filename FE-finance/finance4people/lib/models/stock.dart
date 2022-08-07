class Stock {
  final String name;
  final String ticker;
  final int value;
  bool isFavourite;

  Stock({
    required this.name, 
    required this.ticker, 
    required this.value,
    this.isFavourite = false
  });

  factory Stock.fromJson(Map<String, dynamic> json){
    return Stock(
      name: json['name'],
      ticker: json['ticker'],
      value: json['value'],
      isFavourite: json['isFavourite'] ?? false
    );
  }
  void setFavourite(){
    isFavourite = !isFavourite;
  }
}