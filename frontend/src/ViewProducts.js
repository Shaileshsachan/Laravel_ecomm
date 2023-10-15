import { useState, useEffect } from "react";
import axios from "axios";

import Header from "./Header";

function ViewProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/getAllproducts")
      .then((response) => {
        setProducts(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products :", error);
      });
  }, []);

  return (
    <>
    <Header />
    <section className="section-products">
      <div className="container">
        <div className="row justify-content-center text-center">
          {products.map((product) => (
            <div key={product.id} className="col-md-6 col-lg-4 col-xl-3">
              <div id={`product-${product.id}`} className="single-product">
              <a href={`/product/${product.id}`}>
                <div className="part-2">
                  <img
                    src={`http://localhost:8000/storage/${product.images[0].image}`}
                    alt={product.meta_title}
                    className="product-image"
                  />
                  <h3 className="product-title">{product.meta_title}</h3>
                  <h4 className="product-old-price">{product.maximum_retail_price}</h4>
                  <h4 className="product-price">{product.price}</h4>
                </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );

}

export default ViewProducts;
