const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, '名稱必填'],
  },
  tags: {
    type: ['String'],
  },
  type: {
    type: String,
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    required: [true, '貼文內容必填']
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  comments: Number,
}, {versionKey: false})

// const Post_Schema = new mongoose.Schema(
//   postSchema,
//   {
//     versionKey: false,
//   }
// )

const Post = mongoose.model('Post', postSchema);
module.exports = Post;