import "./App.css";

// React
import React,{ useEffect, useState } from "react";
// for routing
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import WebFont from "webfontloader";
// axios
import axios from "axios";
// Strip for payement
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
// store / actions /useSelector
import store from "./store";
import { loadUser } from "./actions/userAction";
import {  useSelector } from "react-redux";


// Home components
import Home from "./component/Home/Home.js"
import ProtectedRoute from "./component/Route/ProtectedRoute";
import UserOptions from './component/layout/Header/UserOptions.js';
// User Components
import {
  UpdatePassword,
  UpdateProfile,
  ResetPassword,
  Profile,
  LoginSignUp,
  ForgotPassword
} from './component/User'
// Product Components
import {
  ProductDetails,
  Products,
  Search
} from './component/Product';
// Order Components
import {
  MyOrders,
  OrderDetails
} from './component/Order';
// Layout components
import {
  About,
  Contact,
  Footer,
  Header,
  NotFound
} from './component/layout';
// Cart/order/payment Components
import {
  Cart,
  ConfirmOrder,
  OrderSuccess,
  Payment,
  Shipping
} from './component/Cart';
// Adim Components
import {
  Dashboard,
  NewProduct,
  OrderList,
  ProcessOrder,
  ProductList,
  ProductReviews,
  UpdateProduct,
  UpdateUser,
  UsersList
} from './component/Admin';


function App() {

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [stripeApiKey, setStripeApiKey] = useState("");

  async function getStripeApiKey() {
    const  {data}  = await axios.get("/api/v1/stripeapikey");
    setStripeApiKey(data.stripeApiKey);
    console.log(stripeApiKey);
  }
  
  if(user){
    getStripeApiKey();
  }

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka"],
      },
    });
    
    store.dispatch(loadUser());
  }, []);

  window.addEventListener("contextmenu", (e) => e.preventDefault());

  return (
    <Router>
      <Header />

      {!isAuthenticated ? (<UserOptions user={"undefined"} loggedIn={true}/>):(<UserOptions user={user} loggedIn={true}/>)}

      {stripeApiKey && (
        <Elements stripe={loadStripe(stripeApiKey)}>
          <ProtectedRoute exact path="/process/payment" component={Payment} />
        </Elements>
      ) }

      <Switch>
        {/* Normal Routes */}
        <Route exact path="/" component={Home} />
        <Route exact path="/product/:id" component={ProductDetails} />
        <Route exact path="/products" component={Products} />
        <Route path="/products/:keyword" component={Products} />
        <Route exact path="/search" component={Search} />
        <Route exact path="/contact" component={Contact} />
        <Route exact path="/about" component={About} />
        <Route exact path="/password/forgot" component={ForgotPassword} />
        <Route exact path="/password/reset/:token" component={ResetPassword} />
       
        <Route exact path="/login" component={LoginSignUp} />

        <Route exact path="/cart" component={Cart} />

        {/* Access Only By Logged In User */}
        <ProtectedRoute exact path="/account" component={Profile} />
        <ProtectedRoute exact path="/me/update" component={UpdateProfile} />
        <ProtectedRoute exact path="/password/update" component={UpdatePassword} />
        <ProtectedRoute exact path="/shipping" component={Shipping} />
        <ProtectedRoute exact path="/success" component={OrderSuccess} />
        <ProtectedRoute exact path="/orders" component={MyOrders} />
        <ProtectedRoute exact path="/order/confirm" component={ConfirmOrder} />
        <ProtectedRoute exact path="/order/:id" component={OrderDetails} />

        {/* Access By Admin Only */}
        <ProtectedRoute exact path="/admin/dashboard" isAdmin={true} component={Dashboard} />
        <ProtectedRoute exact path="/admin/products" isAdmin={true} component={ProductList} />
        <ProtectedRoute exact path="/admin/product" isAdmin={true} component={NewProduct} />
        <ProtectedRoute exact path="/admin/product/:id" isAdmin={true} component={UpdateProduct} />
        <ProtectedRoute exact path="/admin/orders" isAdmin={true} component={OrderList} />
        <ProtectedRoute exact path="/admin/order/:id" isAdmin={true} component={ProcessOrder} />
        <ProtectedRoute exact path="/admin/users" isAdmin={true} component={UsersList} />
        <ProtectedRoute exact path="/admin/user/:id" isAdmin={true} component={UpdateUser} />
        <ProtectedRoute exact path="/admin/reviews" isAdmin={true} component={ProductReviews} />

        <Route component={ window.location.pathname === "/process/payment" ? null : NotFound}/>
      </Switch>

      <Footer />
    </Router>
  );
}

export default App;





























// import ProductDetails from "./component/Product/ProductDetails";
// import Products from "./component/Product/Products";
// import Search from "./component/Product/Search";
// import LoginSignUp from "./component/User/LoginSignUp";
// import Header from './component/layout/Header/Header.js';
// import Footer from "./component/layout/Footer/Footer.js";
// import Profile from "./component/User/Profile";
// import UpdateProfile from "./component/User/UpdateProfile";
// import UpdatePassword from "./component/User/UpdatePassword";
// import ForgotPassword from "./component/User/ForgotPassword";
// import ResetPassword from "./component/User/ResetPassword";
// import Cart from "./component/Cart/Cart";
// import Shipping from "./component/Cart/Shipping";
// import ConfirmOrder from "./component/Cart/ConfirmOrder";
// import Payment from "./component/Cart/Payment";
// import OrderSuccess from "./component/Cart/OrderSuccess";
// import MyOrders from "./component/Order/MyOrders";
// import OrderDetails from "./component/Order/OrderDetails";
// import Dashboard from "./component/Admin/Dashboard.js";
// import ProductList from "./component/Admin/ProductList.js";
// import NewProduct from "./component/Admin/NewProduct";
// import UpdateProduct from "./component/Admin/UpdateProduct";
// import OrderList from "./component/Admin/OrderList";
// import ProcessOrder from "./component/Admin/ProcessOrder";
// import UsersList from "./component/Admin/UsersList";
// import UpdateUser from "./component/Admin/UpdateUser";
// import ProductReviews from "./component/Admin/ProductReviews";
// import Contact from "./component/layout/Contact/Contact";
// import About from "./component/layout/About/About";
// import NotFound from "./component/layout/Not Found/NotFound";
