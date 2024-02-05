import 'package:finance4people/stores/app_store.dart';
import 'package:flutter/material.dart';

const shortImgHeight = 0.3;
const shortModalHeight = 0.35;
const longImgHeight = 0.86;
const longModalHeight = 0.9;
var basicIndicatorsPath = 'assets/images/infographics/basic_indicators/${AppStore.locale.toString() == 'it' ? 'it' : 'en'}';
var indicatorsPath = 'assets/images/infographics/${AppStore.locale.toString() == 'it' ? 'en' : 'en'}';

abstract class Infographic {
  late String path;
  late double infographicHeight;
  late double modalHeight;
  late Color color;
}

class GreenblattInfographic implements Infographic {
  @override
  String path = '$indicatorsPath/greenblatt.png';

  @override
  double infographicHeight = 0.73;

  @override
  double modalHeight = 0.75;

  @override
  Color color = const Color(0xff49A642);
}

class SharpeInfographic implements Infographic {
  @override
  String path = '$indicatorsPath/sharpe.png';

  @override
  double infographicHeight = 0.65;

  @override
  double modalHeight = 0.67;

  @override
  Color color = const Color(0xff49A642);
}

class BetaInfographic implements Infographic {
  @override
  String path = '$indicatorsPath/beta.png';

  @override
  double infographicHeight = 0.75;

  @override
  double modalHeight = 0.8;

  @override
  Color color = Colors.white;
}

class Whl52Infographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/whl52.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}

class AnalystInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/analyst.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}

class DividendPerShareInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/DPS.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}

class EPSInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/trailEPS.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}

class EVInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/EV.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}

class MarketCapInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/mCap.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}

class PEInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/PE.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}

class VolumeInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/volume.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}

class ROCInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/ROC.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}
class EYInfographic implements Infographic {
  @override
  String path = '$basicIndicatorsPath/eY.png';

  @override
  double infographicHeight = shortImgHeight;

  @override
  double modalHeight = shortModalHeight;

  @override
  Color color = const Color(0xff49A642);
}