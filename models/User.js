const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "Like" }],
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 8);
});

userSchema.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
