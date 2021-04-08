const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
});

const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  width: Number,
  height: Number,
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, trim: true },
  nickname: String,
  birth: { type: Date, default: Date.now },
  point: { type: Number, default: 0, max: 50, index: true },
  image: imageSchema,
  likes: [String],
  any: [mongoose.Schema.Types.Mixed],
  id: mongoose.Schema.Types.ObjectId,
});
userSchema.index({ email: 1, nickname: 1 });

module.exports = mongoose.model("User", userSchema);


userSchema.virtual('detail').get(function() {
  return '저는 ${this.nickname}이고 생일은 ${this.birth.toLocaleString()}입니다.`;
});

userSchema.emthods.comparePassword = function(pw, cb) {
  if (this.password === pw) {
    cb(null, true);
  } else {
    cb('password 불일치');
  }
}

// 나중에 user 도큐먼트를 받게 되면
user.comparePassword('비밀번호', function(err, result) {
  if (err) {
    throw err;
  }
  console.log(result);
})

userSchema.statics.findByPoint = function(point) {
  return this.find({ point: { $gt: point } });
}

userSchema.query.sortByName = function(order) {
  return this.sort({ nickname: order });
};

Users.findByPoint(50).sortByName(-1);

userSchema.pre('save', function(next) {
  if (!this.email) { // email 필드가 없으면 에러 표시 후 저장 취소
    throw '이메일이 없습니다';
  }
  if (!this.createdAt) { // createdAt 필드가 없으면 추가
    this.createdAt = new Date();
  }
  next();
});

userSchema.post('find', function(result) {
  console.log('저장 완료', result); 
})