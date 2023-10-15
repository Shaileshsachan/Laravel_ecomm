<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;

class GetProductController extends Controller
{
    function getAllproducts() {
        $main_products = Product::where('parent_product_id', null)->get();
        foreach ($main_products as $product) {
            $product->images = ProductImage::where('product_id', $product->id)->get();
        }
        return $main_products;
    }


    function getProductWithVariations($id) {
        $main_products = Product::with('images')->where('id',$id)->get();
        $subProducts = Product::with('images')->where('parent_product_id', $id)->get();
        $productsData = $main_products->merge($subProducts);
        return $productsData;
    }
}
