import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:finance4people/views/utils/bottom_modal.dart';
import 'package:finance4people/views/utils/containers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {

  late CategoriesContainer sSCategories;
  String selectedCatType = StockStore.selectedCatType;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Padding(
            padding: const EdgeInsets.all(15),
            child: ValueListenableBuilder(
                valueListenable: StockStore.isLoading,
                builder: ((context, value, _) {
                  if (value == true) {
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                  } else if (value == false) {
                    sSCategories = StockStore.categories;
                    return Column(
                      children: [
                        Sized
                            padding: const EdgeInsets.only(top: 15),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                DropdownButton(
                                    value: StockStore.selectedCatType,
                                    items: StockStore.catTypes
                                        .map<DropdownMenuItem<String>>(
                                            (String val) {
                                      return DropdownMenuItem<String>(
                                        value: val,
                                        child: Text(val),
                                      );
                                    }).toList(),
                                    onChanged: (String? val) {
                                      if (val != StockStore.selectedCatType) {
                                        //TODO: fetch new categories
                                      }
                                      setState(() {
                                        StockStore.selectedCatType = val!;
                                      });
                                    }),
                                IconButton(
                                    padding: const EdgeInsets.only(
                                        bottom: 2, left: 5),
                                    constraints: const BoxConstraints(
                                        minHeight: 0, minWidth: 0),
                                    iconSize: 18,
                                    splashColor: Colors.transparent,
                                    color: Theme.of(context).primaryColor,
                                    onPressed: () {
                                      showModalBottomSheet<void>(
                                          isScrollControlled: true,
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(5)),
                                          context: context,
                                          builder: (BuildContext context) {
                                            return BottomModal(
                                                child: Text(AppLocalizations.of(context)!.cat1Desc));
                                          });
                                    },
                                    icon: const Icon(Icons.help))
                              ],
                            )),
                        CategoriesList(sSCategories: sSCategories)
                      ],
                    );
                  }
                  return const Center(child: Text("Error"));
                }))));
  }

  // @override
  // void dispose(){
  //   StockStore.isLoading.dispose();P
  //   super.dispose();
  // }
}

class CategoriesList extends StatelessWidget {
  const CategoriesList({Key? key, required this.sSCategories})
      : super(key: key);
  final CategoriesContainer sSCategories;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: EdgeInsets.zero,
      scrollDirection: Axis.vertical,
      shrinkWrap: true,
      itemCount: sSCategories.categories.length,
      itemBuilder: (BuildContext context, int index) {
        return CategoryContainer(
            title: sSCategories.categories[index].title,
            stocks: sSCategories.categories[index].stocks,
            emptyCatString: AppLocalizations.of(context)!.noStocksInCat);
      },
    );
  }
}
