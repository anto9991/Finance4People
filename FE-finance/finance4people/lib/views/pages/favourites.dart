import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/models/stock.dart';
import 'package:finance4people/services/stock_service.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:finance4people/views/utils/bottom_modal.dart';
import 'package:finance4people/views/utils/containers.dart';
import 'package:finance4people/views/utils/dropdown.dart';
import 'package:finance4people/views/utils/icon_button.dart';
import 'package:finance4people/views/utils/view_scaffold.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class Favourites extends StatefulWidget {
  const Favourites({Key? key}) : super(key: key);
  @override
  State<Favourites> createState() => _FavouritesState();
}

class _FavouritesState extends State<Favourites> {
  late CategoriesContainer stockStore;
  bool dataLoadingError = false;

  @override
  Widget build(BuildContext context) {
    List favsStocks = [];
    return ViewScaffold(
        viewName: "Favorites",
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.75,
          child: ValueListenableBuilder(
              valueListenable: StockStore.isLoading,
              builder: ((context, value, _) {
                if (value == true) {
                  return const Center(
                    child: CircularProgressIndicator(),
                  );
                } else if (value == false) {
                  if (!dataLoadingError) {
                    if (StockStore.data is List<dynamic>) {
                      favsStocks = StockService.getFavourites(StockStore.data);
                    }
                    return CustomScrollView(
                      slivers: <Widget>[
                        if (StockStore.data is CategoriesContainer) ...[
                          SliverList(
                              delegate: SliverChildBuilderDelegate(childCount: (StockStore.data as CategoriesContainer).categories.length, (context, index) {
                            List catFavsStocks = StockService.getFavourites((StockStore.data as CategoriesContainer).categories[index].stocks);
                            return CategoryContainer(
                              title: (StockStore.data as CategoriesContainer).categories[index].title,
                              stocks: catFavsStocks,
                              emptyCatString: AppLocalizations.of(context)!.noStocksInCat,
                              favouritesPage: true,
                            );
                          }))
                        ] else if (StockStore.data is List<dynamic>) ...[
                          if (favsStocks.isNotEmpty) ...[
                            SliverGrid.count(
                                crossAxisCount: 1,
                                childAspectRatio: 2.7,
                                mainAxisSpacing: 0,
                                children: List.generate(favsStocks.length, (index) {
                                  return Center(
                                      child: SizedBox(
                                          height: MediaQuery.of(context).size.height * 0.16,
                                          width: MediaQuery.of(context).size.width * 0.7,
                                          child: StockContainer(stock: favsStocks[index] as Stock)));
                                }))
                          ] else ...[
                            SliverFillRemaining(
                                child: Center(child: Text(AppLocalizations.of(context)!.noFavourites, style: const TextStyle(fontSize: 18), textAlign: TextAlign.center)))
                          ]
                        ]
                      ],
                    );
                  }
                }
                return Center(
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Padding(
                      padding: EdgeInsets.only(bottom: 10),
                      child: Text("Something went wrong while loading data\nPlease try again", style: TextStyle(fontSize: 18), textAlign: TextAlign.center)),
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
              })),
        ));
    // return ViewScaffold(
    //     //TODO internationalize
    //     viewName: "Favourites",
    //     child: SizedBox(
    //         height: MediaQuery.of(context).size.height * 0.75,
    //         child: ValueListenableBuilder(
    //             valueListenable: StockStore.isLoading,
    //             builder: ((context, value, _) {
    //               if (value == true) {
    //                 return const Center(
    //                   child: CircularProgressIndicator(),
    //                 );
    //               } else if (value == false) {
    //                 stockStore = StockStore.favouritesGreenBlatt;

    //                 return ListView.builder(
    //                   itemCount: stockStore.categories.length,
    //                   itemBuilder: (BuildContext context, int index) {
    //                     return GestureDetector(
    //                       child: CategoryContainer(
    //                         title: stockStore.categories[index].title,
    //                         stocks: stockStore.categories[index].stocks,
    //                         emptyCatString: AppLocalizations.of(context)!.noFavourites,
    //                       ),
    //                     );
    //                   },
    //                 );
    //               }
    //               return const Center(child: Text("Error"));
    //             }))));
  }
}
