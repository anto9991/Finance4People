import 'package:flutter/material.dart';

const shortImgHeight = 0.3;
const shortModalHeight = 0.35;
const longImgHeight = 0.86;
const longModalHeight = 0.9;
const basicIndicatorsPath = "assets/images/infographics/basic_indicators";

abstract class Infographic {
  late String path;
  late double infographicHeight;
  late double modalHeight;
  late Color color;
}

class GreenblattInfographic implements Infographic {
  @override
  String path = 'assets/images/infographics/greenblatt.jpeg';

  @override
  double infographicHeight = longImgHeight;

  @override
  double modalHeight = longModalHeight;

  @override
  Color color = const Color(0xff004a98);
}

class SharpeInfographic implements Infographic {
  @override
  String path = 'assets/images/infographics/sharpe.jpeg';

  @override
  double infographicHeight = longImgHeight;

  @override
  double modalHeight = longModalHeight;

  @override
  Color color = const Color(0xff004a98);
}

class BetaInfographic implements Infographic {
  @override
  String path = 'assets/images/infographics/beta.jpeg';

  @override
  double infographicHeight = longImgHeight;

  @override
  double modalHeight = longModalHeight;

  @override
  Color color = Colors.white;
}

class Whl52Infographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/52whl.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = Colors.white;
}

class AnalystInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/analyst.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = Colors.white;
}

class DividendPerShareInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/dps.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = Colors.white;
}

class EPSInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/eps.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = Colors.white;
}

class EVInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/ev.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = Colors.white;
}

class MarketCapInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/market_cap.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = Colors.white;
}

class PEInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/pe.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = Colors.white;
}

class VolumeInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/volume.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = Colors.white;
}
