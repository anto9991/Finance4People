import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:finance4people/views/utils/bottom_modal.dart';
import 'package:finance4people/views/utils/containers.dart';
import 'package:finance4people/views/utils/dropdown.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  late CategoriesContainer sSCategories;
  bool withBeta = true;
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
                    sSCategories = StockStore.categoriesGreenBlatt;
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
                                                showModalBottomSheet<void>(
                                                    isScrollControlled: true,
                                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                                                    context: context,
                                                    builder: (BuildContext context) {
                                                      return BottomModal(child: Text(AppLocalizations.of(context)!.cat1Desc));
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
                                              value: withBeta,
                                              onChanged: (bool newVal) {
                                                setState(() {
                                                  withBeta = newVal;
                                                });
                                              }),
                                          IconButton(
                                              padding: const EdgeInsets.only(bottom: 2, left: 5),
                                              constraints: const BoxConstraints(minHeight: 0, minWidth: 0),
                                              iconSize: 18,
                                              splashColor: Colors.transparent,
                                              color: Theme.of(context).colorScheme.secondary,
                                              onPressed: () {
                                                showModalBottomSheet<void>(
                                                    isScrollControlled: true,
                                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                                                    context: context,
                                                    builder: (BuildContext context) {
                                                      return BottomModal(child: Text(AppLocalizations.of(context)!.cat1Desc));
                                                    });
                                              },
                                              icon: const Icon(Icons.help)),
                                        ],
                                      )
                                    ],
                                  ),
                                )),
                          ]),
                          // actions: <Widget>[
                          //   IconButton(
                          //     icon: const Icon(Icons.add),
                          //     onPressed: () {
                          //       showModalBottomSheet(
                          //           context: context,
                          //           isScrollControlled: true,
                          //           shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                          //           builder: (BuildContext context) {
                          //             return const BottomModal(child: Text("ciao"));
                          //           });
                          //     },
                          //   ),
                          // ],
                        ),
                        const SliverPadding(padding: EdgeInsets.all(7)),
                        SliverList(
                            delegate: SliverChildBuilderDelegate(childCount: sSCategories.categories.length, (context, index) {
                          return CategoryContainer(
                              title: sSCategories.categories[index].title,
                              stocks: sSCategories.categories[index].stocks,
                              emptyCatString: AppLocalizations.of(context)!.noStocksInCat);
                        }))
                      ],
                    );
                  }
                  // TODO handle error better
                  return const Center(child: Text("Error"));
                }))));
  }

  //OLD
  // @override
  // Widget build(BuildContext context) {
  //   return Scaffold(
  //       body: Padding(
  //           padding: const EdgeInsets.all(15),
  //           child: ValueListenableBuilder(
  //               valueListenable: StockStore.isLoading,
  //               builder: ((context, value, _) {
  //                 if (value == true) {
  //                   return const Center(
  //                     child: CircularProgressIndicator(),
  //                   );
  //                 } else if (value == false) {
  //                   sSCategories = StockStore.categories;
  //                   return Wrap(
  //                     children: [
  //                       SliverAppBar(
  //                         title: const Text("Ciao"),
  //                         expandedHeight: MediaQuery.of(context).size.height * 0.3,
  //                       ),
  //                       Container(
  //                         decoration: BoxDecoration(
  //                             color: Theme.of(context).primaryColor,
  //                             borderRadius: BorderRadius.circular(10)),
  //                         width: MediaQuery.of(context).size.width * 1,
  //                         height: MediaQuery.of(context).size.height * 0.2
  //                       ),
  //                       CategoriesList(sSCategories: sSCategories)
  //                     ],
  //                   );
  //                 }
  //                 return const Center(child: Text("Error"));
  //               }))));
  // }

  // @override
  // void dispose(){
  //   StockStore.isLoading.dispose();
  //   super.dispose();
  // }
}

// class CategoriesList extends StatelessWidget {
//   const CategoriesList({Key? key, required this.sSCategories}) : super(key: key);
//   final CategoriesContainer sSCategories;

//   @override
//   Widget build(BuildContext context) {
//     return ListView.builder(
//       padding: EdgeInsets.zero,
//       scrollDirection: Axis.vertical,
//       shrinkWrap: true,
//       itemCount: sSCategories.categories.length,
//       itemBuilder: (BuildContext context, int index) {},
//     );
//   }
// }
