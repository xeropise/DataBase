- MongoDB 에 직접 연결하는 것이 아닌 ODM 중 가장 유명한 Mongoose 에 대해 간단히 알아보자.

- ODM 은 Object Document Mapping 의 두문자어로 풀이해보면 객체와 문서를 1대1 매칭한다는 뜻이다. Object 는 자바스크립트의 객체이고, Document 는 MongoDB 의 도큐먼트 이다. 즉, 문서를 DB 에서 조회할 때 자바스크립트 객체로 바꿔주는 역할을 한다.

- 사실 기본 MongoDB 드라이버도 도큐먼트를 자바스크립트 객체로 매핑하는데 왜 ODM 을 사용하는 걸까? 어차피 자바스크립트 인것을 또 자바스크립트 객체로 매핑하는 셈인데... 한번 사용해 보자.

- Mongoose 홈페이지에 Getting Started 를 따라해 보자.

- npm 을 사용하여 mongoose 를 설치해 보자.

```
$ npm install mongoose --save
```

- 실행중인 MongoDB 인스턴스의 _test_ 데이터 베이스에 커넥션을 열어 mongoose 를 연결해 보자.

```javascript
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

- localhost 에 실행중인 test 데이터베이스에 대기 중인 connection 을 가지고 있다. 이제 성공적으로 연결했거나, 에러가 발생했을 때 알림을 받아보자.

```javascript
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
});
```

> connection 이 열리면 callback 이 실행될 것이다.

- Mongoose 에서는 모든것은 Schema 로부터 고안 된다. 스키마를 정의해 보자. 작성한 스키마를 기준으로 데이터를 DB에 넣기 전에 먼저 검사하고, 스키마에 어긋나는 데이터가 있으면 에러를 발생시킨다. 테이블과 어느 정도 비슷한 역할을 한다. 스키마를 설정할 떄 인덱스까지 걸어 두거나 기본값도 설정해줄 수 있다.

```javascript
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
```

- 마지막 줄 mongoose.model() 을 호출할 떄 스키마가 등록 된다. 나중에 스키마를 수정할 떄 , 미리 저장되어 있던 데이터들은 바꾸지 않으니 조심해야 한다. 대신 SQL 처럼 alter table 명령 없이 자유롭게 수정할 수 있어 좋다.

- Mongoose 는 model 의 첫 번째 인자로 컬렉션 이름을 만든다. User 이면 소문자화 후 복수형으로 바꿔서 users 컬렉션이 된다. 이런 강제 개명이 싫다면 세 번째 인자로 컬렉션 이름을 줄 수 있다.

```javascript
mongoose.model("User", userSchema, "myfreename");
```

- 위처럼 스키마를 만들었다면 서버 실행하는 부분에서 require 를 해주어야 하며, require 를 해주는 순간 스키마가 등록(model 메서드가 호출) 되어서 앞으로 DB 작업을 할 때 스키마에 맞춰 검사한다. 스키마를 만들어 놓고, require 안 해서 스키마가 적용이 안되는 경우가 많으니 주의하자.

```javascript
require("./경로/userSchema"); // 이렇게만 DB 연결 부분에 적어주면 된다.
```

---

**편의 기능**

- 위에서 언급된 기능 말고도 많이 쓰이는 3가지 기능이 있다.

- 첫 번째 기능으로는 virtual 이라고하는 도큐먼트에 없지만 객체에 있는 가상의 필드를 만들어 준다.

```javascript
userSchema.virtual('detail').get(function() {
    return '저는 ${this.nickname}이고 생일은 ${this.birth.toLocaleString()}입니다.`;
});
```

- 스키마에 virtual 을 붙이면 users 컬렉션을 조회할 때 { email: ..., password: ..., nickname: ..., detail: ...} 처럼 detail 필드가 생긴다. 그리고 get 메소드 안에 넣어준 함수의 return 값이 들어있다. 기존 필드들을 활용해서 새로운 가상 필드를 만드는 기능이다.

- 다음은 사용자 정의 메소드를 붙이는 기능이다.

```javascript
userSchema.emthods.comparePassword = function (pw, cb) {
  if (this.password === pw) {
    cb(null, true);
  } else {
    cb("password 불일치");
  }
};

// 나중에 user 도큐먼트를 받게 되면
user.comparePassword("비밀번호", function (err, result) {
  if (err) {
    throw err;
  }
  console.log(result);
});
```

- 직접 비밀번호가 일치하는지 확인하는 코드를 짤 필요 없이 userSchema 에 정의한 메소드로 재사용할 수 있다. 또 도큐먼트가 아닌 모델이나 쿼리에 직접 static method 를 붙일 수도 있다.

```javascript
userSchema.statics.findByPoint = function (point) {
  return this.find({ point: { $gt: point } });
};

userSchema.query.sortByName = function (order) {
  return this.sort({ nickname: order });
};

Users.findByPoint(50).sortByName(-1);
```

- 마지막으로 pre 와 post 메소드이다. 스키마에 붙여 사용하는데, 각각 특정 동작 이전, 이후에 어떤 행동을 취할 지를 정의할 수 있다. Hook 을 건다고 생각하면 된다.

```javascript
userSchema.pre("save", function (next) {
  if (!this.email) {
    // email 필드가 없으면 에러 표시 후 저장 취소
    throw "이메일이 없습니다";
  }
  if (!this.createdAt) {
    // createdAt 필드가 없으면 추가
    this.createdAt = new Date();
  }
  next();
});

userSchema.post("find", function (result) {
  console.log("저장 완료", result);
});
```

> save 전 호출, next 를 실행하지 않으면 save 가 되지 않기 때문에 최종 검증으로 사용, find 를 호출한 다음에 실행.
