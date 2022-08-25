import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/services/stock_service.dart';
import 'package:finance4people/stores/stock_store.dart';
import 'package:finance4people/views/utils/containers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class Favourites extends StatefulWidget {
  const Favourites({Key? key}) : super(key: key);
  @override
  State<Favourites> createState() => _FavouritesState();
}

class _FavouritesState extends State<Favourites> {
  late CategoriesContainer stockStore;

    @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      _asyncDataLoading();
    });
  }

  _asyncDataLoading() async {
    StockStore.favourites = await StockService.getFavourites();
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
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                  } else if (value == false) {
                    stockStore = StockStore.favourites;

                    return ListView.builder(
                      itemCount: stockStore.categories.length,
                      itemBuilder: (BuildContext context, int index) {
                        return GestureDetector(
                          child: CategoryContainer(
                            title: stockStore.categories[index].title,
                            stocks: stockStore.categories[index].stocks,
                            emptyCatString: AppLocalizations.of(context)!.noFavourites,
                          ),
                        );
                      },
                    );
                  }
                  return const Center(child: Text("Error"));
                }))));
  }
}
