import 'package:finance4people/models/categories_container.dart';
import 'package:finance4people/models/stock_category.dart';
import 'package:finance4people/services/stock_store.dart';
import 'package:finance4people/views/utils/containers.dart';
import 'package:flutter/material.dart';

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  late CategoriesContainer stockCategories;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Padding(
            padding: const EdgeInsets.all(15),
            child: ValueListenableBuilder(
              valueListenable: StockStore.isLoading,
              builder: ((context,value, _) {
              if (value == true) {
                return const Center(
                  child: CircularProgressIndicator(),
                );
              } else if(value == false){
                stockCategories = StockStore.categories;

                return ListView.builder(
                  itemCount: stockCategories.categories.length,
                  itemBuilder: (BuildContext context, int index) {
                    return CategoryContainer(
                      title: stockCategories.categories[index].title,
                      stocks: stockCategories.categories[index].stocks,
                    );
                  },
                );
              }
              return const Center(child: Text("Error"));
            }))));
  }

  // @override
  // void dispose(){
  //   StockStore.isLoading.dispose();
  //   super.dispose();
  // }
}
