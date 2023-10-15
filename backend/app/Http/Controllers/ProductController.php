<?php

namespace App\Http\Controllers;

use App\Models\ProductInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Carbon\Carbon;


use App\Models\Product;
use App\Models\StockManage;
use App\Models\VariationTemplate;
use App\Models\VariationValueTemplate;
use App\Models\ProductVariation;
use App\Models\Variation;
use App\Models\ProductImage;

class ProductController extends Controller
{
    function addProduct(Request $req)
    {

        $file = $req->file('file');
        $spreadsheet = IOFactory::load($file);
        $sheetData = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);

        $chunksize = 50;
        $chunks = array_chunk($sheetData, $chunksize);
        $successMessages = [];
        $errorMessages = [];

        foreach ($chunks as $chunk) {
            foreach ($chunk as $row) {

                $validationResult = $this->validateRow($row);

                if (is_array($validationResult)) {
                    return response()->json(['errors' => $validationResult], 422);
                } else {

                    $existingProduct = Product::where('sku', $row['B'])->first();

                    if (!$existingProduct) { 

                        $product = new Product();
                        $product->meta_title = $row['A'];
                        $product->meta_description = $row['AE'];
                        // q                $product->business_id = $row[''];
                        $product->name = $row['A'];
                        $product->tags = $row['V'];
                        $product->description = $row['AE'];
                        // q               $product->unit_id = $row[''];
                        $product->tax_type = 'exclusive';
                        $product->alert_quantity = $row['S'];
                        $product->price = $row['Q'];
                        $product->purchase_price = $row['Q'];
                        $product->sku = $row['B'];
                        $product->width = $row['I'];
                        $product->height = $row['J'];
                        $product->weight = $row['K'];
                        $product->size = $row['G'];
                        $product->origin = $row['T'];
                        $product->material = $row['U'];
                        $product->quantity = $row['R'];
                        $product->barcode_type = 'C39';
                        // q                $product->created_by = $row[''];
                        $product->length = $row['H'];
                        $product->maximum_retail_price = $row['P'];
                        $product->plength = $row['L'];
                        $product->pwidth = $row['M'];
                        $product->pheight = $row['N'];
                        $product->pweight = $row['O'];
                        $price = (float) $row['P'];
                        $salePrice = (float) $row['Q'];

                        if ($price != 0) {
                            $discountPercentage = (($price - $salePrice) / $price) * 100;
                        } else {
                            // Handle the case where the original price is zero to avoid division by zero
                            $discountPercentage = 0;
                        }

                        if ($row['AK']) {
                            $parent_prod_sku = $row['AK'];
                            $parentProduct = Product::where('sku', $parent_prod_sku)->first();

                            if ($parentProduct) {
                                $product->parent_product_id = $parentProduct->id;
                            } else {
                                $product->parent_product_id = null;
                            }
                        } else {
                            // If no SKU is provided, set parent_product_id to null
                            $product->parent_product_id = null;
                        }

                        $product->save();

                        $stockManage = new StockManage();
                        $stockManage->product_id = $product->id;
                        $stockManage->sale_price = $row['Q'];
                        $stockManage->mrp = $row['P'];
                        $stockManage->type = 'increase';
                        $stockManage->quantity = $row['R'];
                        $stockManage->save();

                        //Search id, name from variation_templates by color name
                        $variationTemplate = VariationTemplate::where('name', $row['W'])->first();
                        if ($variationTemplate) {
                            //Insert into product_variations
                            $productVariation = new ProductVariation();
                            $productVariation->product_id = $product->id;
                            $productVariation->name = $row['A'];
                            $productVariation->variation_template_id = $variationTemplate->id;
                            $productVariation->save();
                        } else {
                            $productVariation = new ProductVariation();
                            $productVariation->product_id = $product->id;
                            $productVariation->name = $row['A'];
                            $productVariation->save();

                        }


                        //Search id from variation_value_templates by color name
                        $variationValue = VariationValueTemplate::where('name', $row['W'])->first();

                        // Create Variation
                        $variation = new Variation();
                        $variation->product_variation_id = $productVariation->id;
                        $variation->variation_value_template_id = $variationValue->id;
                        $variation->name = $row['A'];
                        $variation->product_id = $product->id;
                        $variation->sub_sku = $row['B'] . '.' . $variationValue->id;
                        $variation->quantity = $row['R'];
                        $variation->save();


                        //Check if the product already has inventory
                        $productInventory = ProductInventory::where('product_id', $product->id)->first();

                        if ($productInventory) {
                            // If it does, update the added quantity
                            $productInventory->update([
                                'added' => $row['R'],
                                'date' => Carbon::today(),
                            ]);
                        } else {
                            // If not, create a new inventory record
                            ProductInventory::create([
                                'product_id' => $product->id,
                                'beginning' => $row['R'],
                                'date' => Carbon::today(),
                            ]);
                        }

                        //Insert into product_images
                        $columnLetters = ['AF', 'AG', 'AH', 'AI', 'AJ'];
                        foreach ($columnLetters as $letter) {
                            $imageColumn = $row[$letter];

                            if (!empty($imageColumn)) {
                                // Get the contents of the image from the URL
                                $imageContents = file_get_contents($imageColumn);

                                // Generate a unique file name
                                $imageName = uniqid() . '_' . pathinfo($imageColumn, PATHINFO_BASENAME);

                                // Save the image to the storage disk
                                Storage::disk('public')->put('product_images/' . $imageName, $imageContents);

                                // Create ProductImage record
                                ProductImage::create([
                                    'product_id' => $product->id,
                                    'image' => 'product_images/' . $imageName,
                                    // Save the path to the image
                                    'product_variation_id' => $productVariation->id,
                                    'variation_id' => $variation->id,
                                ]);
                            }
                        }
                        // array_push($successMessages, "Product with SKU {$row['B']} inserted successfully.");
                        $successMessages[] = "Product with SKU {$row['B']} inserted successfully.";
                    } else {
                        // array_push($errorMessages, "Product with SKU {$row['B']} already exists.");
                        $errorMessages[] = "Product with SKU {$row['B']} already exists.";
                    }
                    
                } 

            }
            // return response()->json(['message' => 'Products imported successfully']);
        
        }
        $response = ['success_messages' => $successMessages, 'error_messages' => $errorMessages];
        return response()->json($response);
        

    }

    function validateRow($row)
    {
        // Check required fields
        $errors = [];
        $requiredColumns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE'];

        foreach ($requiredColumns as $column) {
            if (empty($row[$column])) {
                $errors[] = "Missing required field in column $column";
            }
        }

        // Check if columns contain string values
        $stringColumns = ['A', 'B', 'C', 'D', 'E', 'F', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AC', 'AD', 'AE'];
        foreach ($stringColumns as $column) {
            if (!is_string($row[$column])) {
                $errors[] = "Invalid data in column $column. String value expected.";
            }
        }

        // Check integers
        $integerColumns = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'AB'];
        foreach ($integerColumns as $column) {
            if (!is_numeric($row[$column])) {
                $errors[] = "Invalid data in column $column. Numeric value expected.";
            }
        }

        // If there are errors, return them
        if (!empty($errors)) {
            return $errors;
        }

        // If all validations pass, return true
        return true;
    }

}

// meta_title
// meta_description
// business_id 
// status
// vacation_mode
// name
// slug
// tags
// description
// type 
// product_type
// unit_id 
// brand_id
// category_id
// sub_category_id
// tax
// tax_type
// is_featured
// featured_product_position 
// is_editor
// enable_stock
// alert_quantity
// price
// purchase_price
// sku
// width
// height
// weight
// size
// origin
// material
// quantity
// unfulfillable
// barcode_type
// created_by
// created_at
// updated_at
// length
// maximum_retail_price
// plength
// pwidth
// pheight
// pweight
// discount_percentage
