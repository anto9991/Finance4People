import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/services/stock_store.dart';
import 'package:finance4people/views/pages/stock_detail.dart';
import 'package:finance4people/views/utils/containers.dart';
import 'package:flutter/material.dart';

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  late CategoriesContainer stockStore;

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
                    stockStore = StockStore.categories;

                    return ListView.builder(
                      itemCount: stockStore.categories.length,
                      itemBuilder: (BuildContext context, int index) {
                        return GestureDetector(
                          child: CategoryContainer(
                            title: stockStore.categories[index].title,
                            stocks: stockStore.categories[index].stocks,
                          ),
                          onTap: () {
                            showModalBottomSheet<void>(
                                isScrollControlled: true,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(5)),
                                context: context,
                                builder: (BuildContext context) {
                                  return Container(
                                    height: MediaQuery.of(context).size.height *
                                        0.9,
                                    child: Column(
                                      children: [
                                        Padding(
                                          padding: const EdgeInsets.all(10),
                                          child: Container(
                                            height: 5,
                                            width: 30,
                                            decoration: BoxDecoration(
                                              color: Colors.grey[300],
                                              borderRadius: const BorderRadius.all(Radius.circular(8))
                                            ),
                                          ),
                                        ),
                                        const StockDetail(title: "Ciao")
                                      ],
                                    ),
                                  );
                                });
                          },
                        );
                      },
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
