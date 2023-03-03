import 'dart:async';

import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/services/stock_service.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:finance4people/views/utils/bottom_modal.dart';
import 'package:finance4people/views/utils/containers.dart';
import 'package:finance4people/views/utils/dropdown.dart';
import 'package:finance4people/views/utils/icon_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  bool dataLoadingError = false;
  String loadingMessage = "Loading...";

  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 10), () {
      setState(() {
        loadingMessage = "It's taking longer than it should...";
      });
    });
    _asyncDataLoading();
  }

  _asyncDataLoading() async {
    await StockService.getStocks(null, null);
    if (!mounted) return;
    //Force widget refresh
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Padding(
            padding: const EdgeInsets.all(15),
            child: ValueListenableBuilder(
                valueListenable: StockStore.isLoading,
                builder: ((context, value, _) {
                  if (value == true) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [const CircularProgressIndicator(), const SizedBox(height: 10), Text(loadingMessage)],
                      ),
                    );
                  } else if (value == false) {
                    if (!dataLoadingError) {
                      return CustomScrollView(
                        slivers: <Widget>[
                          SliverAppBar(
                            //TODO internationalize
                            title: const Text("Welcome to Nous Finance"),
                            expandedHeight: MediaQuery.of(context).size.height * 0.2,
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            forceElevated: true,
                            // stretch: true,
                            // pinned: true,
                            // floating: true,
                            // snap: true,
                            shape: ContinuousRectangleBorder(
                              borderRadius: BorderRadius.circular(40),
                            ),
                            // flexibleSpace: Row(
                            //   crossAxisAlignment: CrossAxisAlignment.end,
                            //   children: [const Text("ciao")],
                            // ),
                            flexibleSpace: Stack(children: [
                              Positioned(
                                  top: MediaQuery.of(context).size.height * 0.07,
                                  child: Padding(
                                    padding: const EdgeInsets.only(left: 15),
                                    child: Wrap(
                                      crossAxisAlignment: WrapCrossAlignment.start,
                                      direction: Axis.vertical,
                                      // spacing: -20,
                                      children: <Widget>[
                                        // Categorizator select row
                                        Row(
                                          children: <Widget>[
                                            CustomDropdown(
                                                //TODO internationalize
                                                label: "Categorizzatore",
                                                value: StockStore.selectedCatType,
                                                items: StockStore.catTypes,
                                                onChanged: (String? val) {
                                                  if (val != StockStore.selectedCatType) {
                                                    //TODO: fetch new categories
                                                  }
                                                  setState(() {
                                                    StockStore.selectedCatType = val!;
                                                  });
                                                }),
                                            IconButton(
                                                padding: const EdgeInsets.only(bottom: 2, left: 5),
                                                constraints: const BoxConstraints(minHeight: 0, minWidth: 0),
                                                iconSize: 18,
                                                splashColor: Colors.transparent,
                                                color: Theme.of(context).colorScheme.secondary,
                                                onPressed: () {
                                                  var image = StockStore.selectedCatType == "Greenblatt" ? StockStore.images["Greenblatt"] : StockStore.images["Sharpe"];
                                                  showModalBottomSheet<void>(
                                                      backgroundColor: image!.color,
                                                      isScrollControlled: true,
                                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                                                      context: context,
                                                      builder: (BuildContext context) {
                                                        return BottomModal(
                                                            color: image.color,
                                                            image: Image.asset(
                                                              image.path,
                                                              height: MediaQuery.of(context).size.height * image.infographicHeight
                                                            ),
                                                            modalHeight: MediaQuery.of(context).size.height * image.modalHeight,
                                                            );
                                                      });
                                                },
                                                icon: const Icon(Icons.help)),
                                          ],
                                        ),
                                        // Beta categorization row
                                        Row(
                                          children: <Widget>[
                                            const Text("Beta: ", style: TextStyle(color: Colors.white)),
                                            Switch(
                                                activeColor: Theme.of(context).colorScheme.secondary,
                                                value: StockStore.betaSelected,
                                                onChanged: (bool newVal) {
                                                  setState(() {
                                                    StockService.getStocks(null, newVal);
                                                  });
                                                }),
                                            IconButton(
                                                padding: const EdgeInsets.only(bottom: 2, left: 5),
                                                constraints: const BoxConstraints(minHeight: 0, minWidth: 0),
                                                iconSize: 18,
                                                splashColor: Colors.transparent,
                                                color: Theme.of(context).colorScheme.secondary,
                                                onPressed: () {
                                                  var image = StockStore.images["Beta"];
                                                  showModalBottomSheet<void>(
                                                      backgroundColor: image!.color,
                                                      isScrollControlled: true,
                                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                                                      context: context,
                                                      builder: (BuildContext context) {
                                                        return BottomModal(
                                                            color: image.color,
                                                            image: Image.asset(
                                                              image.path,
                                                              height: MediaQuery.of(context).size.height * image.infographicHeight,
                                                            ),
                                                            modalHeight: MediaQuery.of(context).size.height * image.modalHeight,
                                                            );
                                                      });
                                                },
                                                icon: const Icon(Icons.help)),
                                          ],
                                        )
                                      ],
                                    ),
                                  )),
                            ]),
                          ),
                          const SliverPadding(padding: EdgeInsets.all(7)),
                          if (StockStore.data is CategoriesContainer) ...[
                            SliverList(
                                delegate: SliverChildBuilderDelegate(childCount: (StockStore.data as CategoriesContainer).categories.length, (context, index) {
                              return CategoryContainer(
                                  title: (StockStore.data as CategoriesContainer).categories[index].title,
                                  stocks: (StockStore.data as CategoriesContainer).categories[index].stocks,
                                  emptyCatString: AppLocalizations.of(context)!.noStocksInCat);
                            }))
                          ] else if (StockStore.data is List<dynamic>) ...[
                            SliverGrid.count(
                                crossAxisCount: 1,
                                childAspectRatio: 2.7,
                                mainAxisSpacing: 0,
                                children: List.generate((StockStore.data as List).length, (index) {
                                  return Center(
                                      child: SizedBox(
                                          height: MediaQuery.of(context).size.height * 0.16,
                                          width: MediaQuery.of(context).size.width * 0.7,
                                          child: StockContainer(stock: (StockStore.data as List)[index])));
                                }))
                          ]
                        ],
                      );
                    }
                  }
                  return Center(
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Padding(
                        padding: EdgeInsets.only(bottom: 10),
                        child: Text("Something went wrong while loading data...\nPlease try again", style: TextStyle(fontSize: 18), textAlign: TextAlign.center)),
                    IconButtonText(
                      icon: const Icon(Icons.refresh),
                      text: "Refresh",
                      onPressed: () {
                        setState(() {
                          StockService.getStocks(null, null);
                          dataLoadingError = false;
                        });
                      },
                    )
                  ]));
                }))));
  }
}
