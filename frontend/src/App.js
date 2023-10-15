import logo from "./logo.svg";
import "./App.css";
import Header from "./Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import AddProduct from "./AddProduct";
import ViewProducts from "./ViewProducts";
import Register from "./Register";
import Protected from "./Protected";
import ProductDetails from "./ProductDetails";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/add" element={<Protected Cmp={AddProduct} />} />
          <Route path="/products" element={<Protected Cmp={ViewProducts}/>} />
          <Route path="/product/:id" element={<ProductDetails/>} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
