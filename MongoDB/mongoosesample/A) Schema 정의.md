# 스키마 정의

- 몽구스의 모든 것들은 스키마에서 시작함.. 각각의 스키마는 몽고디비 컬렉션으로 묘사되며, 컬렉션 안에 있는 도큐먼트의 형태를 정의한다.

```javascript
import mongoose from "mongoose";
const { Schema } = mongoose;

const blogSchema = new Schema({
  title: String,
  author: String,
  body: String,
  comments: [{ body: String, data: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs: Number,
  },
});
```

- 추가적인 keys 들을 추가하길 원하는 경우, Schema#add 메서드를 사용하자.
  코드에 있는 blogSchema 의 각 키는 도큐먼트안에 특성 ( SchemaType 으로 변환 ) 을 정의하는데, 예를 들면 title 이라는 스키마는 String 이라는 SchemaType 이고, date 는 Date 라는 스키마 타입으로 변환한다.

- 만약 특성이 type 만을 요구로 한다면, 축약된 용어로 특정할 수 있다.

- 키들은 추가적인 key/type 정의들을 포함하는 중첩된 객체 형태로 할당 될 수 있으며 (meta), 키의 값이 type 특성을 가지고 있지 않은 POJO 형태일 때 발생한다.

- 사용가능한 스키마 타입들은 다음과 같다

      - String
      - Number
      - Date
      - Buffer
      - Boolean
      - Mixed
      - ObjectId
      - Array
      - Decimal128
      - Map

- Schema 는 도큐먼트의 구조를 정의하는 것 뿐만 아니라 특성을 변환한다. 도큐먼트의 instance method 나 static Model method, compound index 로 도큐먼트를 정의하고,
  도큐먼트의 lifecycle hooks 를 middleware 라고 부른다.

## 모델 생성하기

- 스키마 정의를 사용하기 위해, blogSchema 를 Model 로 변환 시켜보자. 그러기 위해서는 mongose.model(modelName, schema) 에 통과시켜야 한다.

```javascript
const Blog = mongoose.model("Blog", blogSchema);
```

<br>

## ID

- 기본적으로, Mongoose 는 \_id 특성을 스키마에 추가한다.

```javascript
const schema = new Schema();

schema.path("_id"); // ObjectId { ... }
```

- 자동적으로 추가된 \_id 특성으로 새 도큐먼트를 만들 때, Mongoose 는 도큐먼트 안에 타입이 ObjectID 인 \_id 를 새로 생성한다.

```javascript
const Model = mongoose.model("Test", schema);

const doc = new Model();
doc._id instanceof mongoose.Types.ObjectId; // true
```

- Mongoose 의 기본 \_id 를 가지고있는 \_id 로 덮어 쓸 수 있으나, Mongoose 는 \_id 를 가지고 있지 않은 도큐먼트를 저장하는 것을 거절하니 주의 하자. ( 첫 생성시에는 없다는 뜻이네.. \_id 라는 타입을 만들어줘도 값은 없음)

```javascript
const schema = new Schema({ _id: Number });
const Model = mongoose.model("Test", schema);

const doc = new Model();
await doc.save(); // Throws 'document must have an \_id before saving'

doc._id = 1;
await doc.save(); // works
```

<br>

**Instance methods**

- 모델(Models) 의 인스턴스는 도큐먼트(documents) 이며, 도큐먼트는 내장된 인스턴스 메소드를 많이 가지고 있다. 뿐만 아니라, 커스텀 메소드를 정의하여 사용할 수 있다.

```javascript
// define a schema
const animalSchema = new Schema({ name: String, type: String });

// assign a function to the 'methods' object of our animalSchema
animalSchema.methods.findSimilarTypes = function (cb) {
  return mongoose.model("Animal").find({ type: this.type }, cb);
};
```

- animal 인스턴스는 findSimilarTypes 라는 사용가능한 메소드를 가지고 있다.

```javascript
const Animal = mongoose.model("Animal", animalSchema);
const dog = new Animal({ type: "dog" }); // dog 라는 값을 가지고 있는 새 도큐먼트

dog.findSimilarTypes((err, dogs) => {
  console.log(dogs); // woof
});
```

- 기존에 있던 mongoose 도큐먼트의 메소드를 덮어 쓰는 것은 예측 불가능한 결과를 나을 수 있으므로 주의하자. 관련해서는 [여기](https://mongoosejs.com/docs/api.html#schema_Schema.reserved) 를 참조하자.

- 위의 예제는 인스턴스 메소드를 저장하기 위한 [Schema.methods](https://mongoosejs.com/docs/api.html#schema_Schema-method) 객체를 사용하고 있는데, Schema.methods() 로 사용할 수도 있다. 주소 참조

- 메소드는 ES6 의 화살표 함수로 선언해서는 안되는데 화살표 함수가 명시적으로 this binding 을 막아 도큐먼트에 접근 불가능하게하여 위의 예제의 경우 동작하지 않을 것이다.

<br>

**Statics**

- 또 model 에 static 기능들을 추가할 수 있는데, 두 방법은 동일하다.

  - schema.statics 에 함수를 추가한다.

  - Schema#static() 함수를 호출한다.

```javascript
// Assign a function to the 'statics' object of our animalSchema
animalSchema.statics.findByName = function (name) {
  return this.find({ name: new RegExp(name, "i") });
};
// Or, equivalently, you can call 'animalSchema.static()`
animalSchmea.static("findByBreed", function (breed) {
  return this.find({ breed });
});

const Animal = mongoose.model("Animal", animalSchema);
let animals = await Animal.findByName("fido");
```

- 이 역시 this 의 바인딩 문제로 화살표 함수를 사용해서는 안 된다.

<br>
