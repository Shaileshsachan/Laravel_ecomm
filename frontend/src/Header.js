import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  function logOut() {
    localStorage.clear();
    navigation("/login");
  }
  const navigation = useNavigate();
  const user = JSON.parse(localStorage.getItem("user-info"));
  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="#home">Navbar</Navbar.Brand>
        <Nav className="me-auto nav_bar_wrapper">
          {localStorage.getItem("user-info") ? (
            <>
              <Link to="/add">Add Product</Link>
              <Link to="/products">Products</Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </Nav>
        {localStorage.getItem("user-info") ? (
          <Nav>
            <NavDropdown title={user && user.name}>
              <NavDropdown.Item onClick={logOut}>Logout</NavDropdown.Item>
              <NavDropdown.Item>Profile</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        ) : null}
      </Container>
    </Navbar>
  );
}

export default Header;
