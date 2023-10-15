import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/productsWithVariation/${id}`
        );
        const data = await response.json();
        setProductDetails(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    setQuantity(newQuantity);
  };

  const switchProduct = (index) => {
    setCurrentProductIndex(index);
  };

  if (!productDetails) {
    return <div>Loading...</div>;
  }

  const currentProduct = productDetails[currentProductIndex];

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6 mb-4" style={{ display: "flex" }}>
          <div
            className="card"
            style={{
              width: "300px",
              height: "410px",
            }}
          >
            <img
              src={`http://localhost:8000/storage/${currentProduct.images[0].image}`}
              className="card-img-top"
              alt={currentProduct.meta_title}
            />
            </div>
            <div className="col-md-6">
              <div className="card-body">
                <h5 className="card-title">{currentProduct.meta_title}</h5>
                <p className="card-text">{currentProduct.description}</p>
                <p className="card-text">Price: ${currentProduct.price}</p>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity:</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </div>
                <button className="btn btn-primary mr-2">Buy Now</button>
                <button className="btn btn-success mr-2">Add to Cart</button>
              </div>
            </div>
          
        </div>
        <div className="col-md-4">
          <div className="d-flex flex-column">
            {productDetails.map((product, index) => (
              <button
                key={product.id}
                className={`btn btn-outline-primary mb-2 ${
                  index === currentProductIndex ? "active" : ""
                }`}
                onClick={() => switchProduct(index)}
              >
                Sub Product {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
