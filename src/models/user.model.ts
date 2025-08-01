import mongoose from "mongoose";
import {encrypt}  from "../utils/Encryption";

//export interface UserDocument extends mongoose.Document {
export interface User {
  fullname: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profilePicture: string;
  isActive: boolean;
  activation: string;
}

// This schema defines the structure of the User document in MongoDB
const UserSchema = new mongoose.Schema<User>(
  {
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    profilePicture: {
      type: String,
      default: "user.jpg",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    activation: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to encrypt the password before saving to the database
UserSchema.pre("save", function (next){
   const user = this;
   user.password = encrypt(user.password);
   next();
})

//  hidden password field from the response
UserSchema.methods.toJSON = function(){
  const user = this;
  const userObject = user.toObject();

  // Remove sensitive fields from the response
  delete userObject.password;
  return userObject;
}

// Create the User model using the schema
const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;
