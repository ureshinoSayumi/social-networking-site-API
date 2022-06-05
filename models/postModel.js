const mongoose = require('mongoose')
const postSchema = new mongoose.Schema(
  {
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
  }, {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)
// 虛擬表，有使用在掛上去
postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id' // 找跟 post 一樣id的
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post
