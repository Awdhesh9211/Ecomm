import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
// import ApiFeatures from "../utils/ApiFeature.js";
import cloudinary from "cloudinary";

// ----------------------------GET ALL PRODUCT (COMMON)-------------------------------------------------------------------------------------
const getAllProducts = asyncHandler(async (req, res, next) => {
  
  console.log("f->getAllProduct");

  const resultPerPage = 1;

  let query = Product.find();

  // Search (if keyword is provided and not empty)
  if (req.query.keyword && req.query.keyword.trim() !== "") {
    const keyword = new RegExp(req.query.keyword, "i");
    query = query.find({ name: keyword });
  }

  // Filter
  const filters = {};
  if (req.query.price && (req.query.price.gte || req.query.price.lte)) {
    filters.price = {};
    if (req.query.price.gte)
      filters.price.$gte = parseFloat(req.query.price.gte);
    if (req.query.price.lte)
      filters.price.$lte = parseFloat(req.query.price.lte);
  }
  if (req.query.ratings && req.query.ratings.gte) {
    filters.rating = { $gte: parseInt(req.query.ratings.gte) };
  }
  if (Object.keys(filters).length > 0) {
    query = query.find(filters);
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * resultPerPage;
  query = query.skip(skip).limit(resultPerPage);

  // Execute query
  const products = await query;
  const productsCount = await Product.countDocuments(filters);

  // Send response
  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    currentPage: page,
    totalPages: Math.ceil(productsCount / resultPerPage),
    filteredProductsCount: products.length,
  });
});

// product details
const getproductDetail = asyncHandler(async (req, res, next) => {
  console.log("f->getproductDetail");
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ApiError("Product Not Found", 404));
  res.status(201).json({ success: true, product });
});

//-------------------------------------Admin controller------------------------------------------------------------------------------

//-------------------- create product
const createProduct = asyncHandler(async (req, res, next) => {
  console.log("f->createProduct");

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//--------------------- update product
const updateProduct = asyncHandler(async (req, res, next) => {
  console.log("f->updateProduct");

  let product = await Product.findById(req.params.id);

  if (!product) return next(new ApiError("Product not found", 404));

  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].publicId);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({ public_id: result.public_id, url: result.secure_url });
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, product });
});

//---------------------delete product
const deleteProduct = asyncHandler(async (req, res, next) => {
  console.log("f->deleteProduct");

  const product = await Product.findById(req.params.id);

  if (!product) return next(new ApiError("Product not found", 404));

  if (product.images.length) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
  }

  await Product.findByIdAndDelete(product._id);

  res
    .status(200)
    .json({ success: true, message: "Product Delete Successfully" });
});

//------------------------------- Get All Product
const getAdminProducts = asyncHandler(async (req, res, next) => {
  console.log("f->getAdminProducts");

  const products = await Product.find();
  res.status(200).json({ success: true, products });
});

//---------------- Create New Review or Update the review
const createProductReview = asyncHandler(async (req, res, next) => {
  console.log("f->createProductReview");

  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

//----------------------- Get All Reviews of a product
const getProductReviews = asyncHandler(async (req, res, next) => {
  console.log("f->getProductReviews");

  const product = await Product.findById(req.query.id);

  if (!product) return next(new ApiError("Product not found", 404));

  res.status(200).json({ success: true, reviews: product.reviews });
});

//------------------------ Delete Review
const deleteReview = asyncHandler(async (req, res, next) => {
  console.log("f->deleteReview");

  const product = await Product.findById(req.query.productId);

  if (!product) return next(new ApiError("Product not found", 404));

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({ success: true });
});

export {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getproductDetail,
  getAdminProducts,
  createProductReview,
  getProductReviews,
  deleteReview,
};
