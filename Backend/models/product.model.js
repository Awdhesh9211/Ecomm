import mongoose from "mongoose";
const { Schema, model } = mongoose;

// ---------------------PRODUCT SCHEMA----------------------------------------------------------------
//                          FIELDS-> name
//                          FIELDS-> description
//                          FIELDS-> price
//                          FIELDS-> rating
//                          FIELDS-> images[{public_id,url}...]
//                          FIELDS-> category
//                          FIELDS-> stock
//                          FIELDS-> numberOfRieviews
//                          FIELDS-> reviews
//                          FIELDS-> user
//                          FIELDS-> createdAt

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Enter product name"],
    trim: true,
    unique: true,
  },

  description: {
    type: String,
    required: [true, "Please Enter product description"],
  },

  price: {
    type: Number,
    required: [true, "Please Enter product price"],
    maxLength: [9, "Price cannot exceed 9 character"],
  },

  rating: { type: Number, default: 0 },

  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],

  category: { type: String, required: [true, "Please Enter product category"] },

  stock: {
    type: Number,
    default: 1,
    maxLength: [4, "Stck annot be exceed 4 characters"],
  },

  numOfReviews: { type: Number, default: 0 },

  reviews: [
    {
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
    },
  ],

  user: { type: Schema.Types.ObjectId, ref: "users" },

  createdAt: { type: Date, default: Date.now },
});

export const Product = model("product", productSchema);
