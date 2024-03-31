import {Order} from '../models/order.model.js';
import {Product} from'../models/product.model.js';
import { asyncHandler } from "../middleware/asyncHandler.js";
import  {ApiError} from '../utils/ApiError.js';

//------------------------------------CREATING ORDER
const newOrder = asyncHandler(async (req, res, next) => {
  console.log("newOrder");

    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
  
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
  
    res.status(201).json({success: true,order,});

});


 //----------------------------------GET SINGLE ORDER
const  getSingleOrder = asyncHandler(async (req, res, next) => {
  console.log("getSingleOrder");

  const order = await Order.findById(req.params.id);

  if (!order) return next(new ApiError("Order not found with this Id", 404));

  res.status(200).json({success: true,order,});

});


//----------------------------------GET LOGGEDIN USER ORDERS
const userOrders = asyncHandler(async (req, res, next) => {

  console.log("userOrders");

  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({success: true,orders,});

});
  
//---------------------------------GET ALL OREDERS -- Admin
const getAllOrders = asyncHandler(async (req, res, next) => {
  console.log("getAllOrders");

  const orders = await Order.find();
  if(!orders){
    return new ApiError("Order is Empty",500);
  }
  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});
  
//--------------------------------UPDATE ORDER STATUS -- Admin
const updateOrder = asyncHandler(async (req, res, next) => {
  console.log("f->updateOrder");
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ApiError("Order not found with this Id", 404));

  if (order.orderStatus === "Delivered") return next(new ApiError("You have already delivered this order", 400));

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({success: true,});
});

// helping function
async function updateStock(id, quantity) {
  console.log("processPayment");
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
}
  
//-------------------------------DELETE ORDER -- Admin
const deleteOrder = asyncHandler(async (req, res, next) => {
  console.log("deleteOrder");
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ApiError("Order not found with this Id", 404));

  await order.findByIdAndDelete(order._id);

  res.status(200).json({success: true,});
});

  export {newOrder,getSingleOrder,deleteOrder,updateOrder,userOrders,getAllOrders}