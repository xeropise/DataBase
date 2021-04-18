# 모델 정의

- Model 은 Schema 정의들로부터 컴파일된 공상적인 생성자이다. 모델의 인스턴스는 도큐먼트(document) 라고 불리며, 모델은 MongoDB 의 데이터베이스로 부터 도큐먼트를 만들고 읽는데 책임이 있다.

<br>

## 첫 모델 컴파일링 하기

- schema의 mongoose.model() 를 호출할 때, Mongoose 는 model 을 컴파일링 한다.

```javascript
const schema = new mongoose.Schema({ name: "string", size: "string" });

const Tank = mongoose.model("Tank", schema);
```

- 첫 번째 매개변수는 모델에 사용할 컬렉션의 단수형 이름이다. **Mongoose 는 자동적으로 모델 이름의 소문자, 복수형의 이름을 찾는다.** , 위의 경우 model Tank 는 데이터베이스 컬렉션 안에 tanks 를 지칭하는 것이다.

- 주의: .model() 함수는 schema 의 복사를 만드는데, .model() 을 호출하기 전에 원하는 모든 것을 추가했는지 확인하자.

<br>

## 도큐먼트 생성하기

- 도큐먼트라 불리는 모델의 인스턴스는 데이터베이스에 자신을 생성하고, 저장할 수 있다.

```javascript
const Tank = mongoose.model("Tank", yourSchema);

const small = new Tank({ size: "small" });
small.save(function (err) {
  if (err) return handleError(Err);
  // saved!
});

Tank.create({ size: "small" }, function (err, small) {
  if (err) return handleError(err);
  // saved!
});

// or, for inserting large batches of documents
Tank.insertMany([{ size: "small" }], function (err) {});
```

- model 의 사용이 connection 이 열린 채가 아니면, 어떠한 도큐먼트도 생성되지 않고 만들어지지 않으니 주의하자. 모든 모델은 연관된 connection 을 가진다. mongoose.model() 을 사용할 때, 너의 모델은 기본적은 mongoose connection 을 사용한다.

```javascript
mongoose.connect("mongodb://localhost:/gettingstarted", {
  useNewUrlParser: true,
});
```

- 커스텀 connection 을 만들려면, connection 의 model() 함수를 대신 사용하자.

```javascript
const connection = mongoose.createConnection("mongodb://localhost:27017/test");
const Tank = connection.model("Tank", yourSchema);
```

<br>

## Querying

- 도큐먼트를 찾는 것은 mongoose 에서 매우 쉽다. MongoDB 의 쿼리를 지원하기 떄문에 도큐먼트는 find, findById, findOne, 또는 where static 함수로 도큐먼트를 찾을 수 있다.

```javascript
Tank.find({ size: "small" }).where("createdDate").gt(oneYearAgo).exec(callback);
```

- 자세한 것은 [Query api](https://mongoosejs.com/docs/queries.html) 를 참조하자.

<br>

## Deleting

- 모델은 deleteOne(), deleteMany() 라는 static 함수들을 모든 도큐먼트를 제거하기 위해 가지고 있다.

```javascript
Tank.deleteOne({ size: "large" }, function (err) {
  if (err) return handleError(err);
  // deleted at most one tank document
});
```

<br>

## Updating

- 각 모델은 도큐먼트를 수정하기 위해 자신만의 update 메소드를 가지고 있는데 앱에 결과를 되돌려 주지는 않는다. 자세한것은 API 를 참조

```javascript
Tank.updateOne({ size: "large" }, { name: "T-90" }, function (err, res) {
  // Updated at most one doc, 'res.modeifiedCount' contains the number
  // of docs that MongoDB updated
});
```

<br>

## Change Streams

- MongoDB 3.6.0 그리고 Mongoose 5.0.0 에서 새로 나온 것으로 모든 삽입이나 업데이트를 감지하는 방법을 제공한다. 만약 MongoDB replica set 에 연결되지 않았다면, 작동하지 않는다.

```javascript
async function run() {
  // Created a new mongoose model
  const personSchema = new mongoose.Schema({
    name: String,
  });

  const Person = mongoose.model("Person", personSchema, "Person");

  // Created a change stream. the 'change' event gets emitted when there's a
  // change in the database
  Person.watch().on("change", (data) => console.log(new Date(), data));

  // insert a doc, will trigget the change stream handler above
  console.log(new Date(), "inserting doc");
  await Person.create({ name: "Axl Rose" });
}
```

- 아래 처럼 결과가 작동 된다.

```javascript
2018-05-11T15:05:35.467Z 'Inserting doc'
2018-05-11T15:05:35.487Z 'Inserted doc'
2018-05-11T15:05:35.491Z { _id: { _data: ... },
  operationType: 'insert',
  fullDocument: { _id: 5af5b13fe526027666c6bf83, name: 'Axl Rose', __v: 0 },
  ns: { db: 'test', coll: 'Person' },
  documentKey: { _id: 5af5b13fe526027666c6bf83 } }
```

## Yet more

- API 문서에서 추가적인 집계, 맵리듀스, 기타 함수들을 살펴 볼 수 있다.
