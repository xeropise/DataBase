# 6장 집계

https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/

- 이전 장에서는 룩업, 정렬 등 일반적인 쿼리 연산을 수행하기 위해 쿼리 언어를 사용하는 방법을 배웠다. 이번 장에서는 MongoDB 집계 프레임워크(aggregation framework) 를 사용하여 보다 복잡한 쿼리를 포함하도록 주제를 확장해 보자.

- 집계 프레임워크는 고급 쿼리 언어로, 여러 도큐먼트의 데이터를 변환하고 결합하여 단일 도큐먼트에서 사용할 수 없는 새로운 정보를 생성할 수 있다. 예를 들어, 집계 프레임워크를 사용하여 월별 매출, 제품별 매출 또는 사용자별 주문 합계를 알아낼 수 있다. RDBMS 에 익숙한 사용자는 집계 프레임워크를 SQL의 GROUP BY 절과 동일하다고 생각할 수 있을 것이다.

- MONGOdb 의 map reduce 기능이나 프로그램 코드를 사용하여 이 정보를 계산할 수 있지만, 집계 프레임워크는 한 번의 호출로 일련의 도큐먼트 작업을 정의한 다음 MongoDB 에 배열의 형태로 보낼 수 있으므로 작업을 훨씬 쉽고 효율적으로 수행할 수 있다.

---

## 6.1 집계 프레임워크 개요

- 집계 프레임워크의 호출은 파이프라인의 각 단계에서 출력이 다음 단계로의 입력으로 제공되는 파이프라인을 정의한다. 각 단계는 입력을 변환하고 출력 도큐먼트를 생성하기 위해 입력 도큐먼트에 대해 단일 작업을 실행한다.

- 집계 파이프라인 작업에는 다음이 포함된다.
  - **$project** - 출력 도큐먼트상에 배치할 필드를 지정
  - **$match** - 처리도리 도큐먼트를 선택하는 것. find() 와 비슷한 역할을 수행한다.
  - **$limit** - 다음 단계에 전달된 도큐먼트의 수를 제한한다.
  - **$skip** - 지정된 수의 도큐먼트를 건너뛴다.
  - **$unwind** - 배열을 확장하여 각 배열 항목에 대해 하나의 출력 도큐먼트를 생성한다.
  - **$group** - 지정된 키로 도큐먼트를 그룹화 한다.
  - **$sort** - 도큐먼트를 정렬한다.
  - **$geoNear** - 지형 데이터를 정의하는 GSON 에서 거리를 정하기 위해 사용
  - **$out** - 파이프라인의 결과(출력)에 사용한다.
  - **$redact** - 특정 데이터에 대한 접근을 제어한다.

![image001](https://user-images.githubusercontent.com/50399804/114551351-3c938a00-9c9e-11eb-9325-b23cd169dad4.png)

```javascript
db.products.aggregate([ {$match: ...}, {$group: ...}, {$sort: ...} ])
```

- 위의 작업은 처리할 도큐먼트(products)를 선택하고 (\$match), 특정 키를 기준으로 도큐먼트를 그룹화하고 (\$group), 도큐먼트를 정렬한다. (\$sort)

- 이를 SQL 명령과 집계 프레임워크 연산자에 대한 비교를 하자면 다음과 같다.

| SQL 명령어 | 집계 프레임워크 연산자                |
| ---------- | ------------------------------------- |
| SELECT     | \$project, \$group ($sum, $min, $avg) |
| FROM       | db.collectionName.aggregate(...)      |
| JOIN       | \$unwind                              |
| WHERE      | \$match                               |
| GROUP BY   | \$group                               |
| HAVING     | \$match                               |

---

<br>

## 6.2 전자상거래 집계 예제

- 집계를 사용하여 데이터를 통해 몇 가지 쿼리를 낼 수 있는 전자상거래 데이터베이스에 대한 몇 가지 예제 쿼리를 작성해 보자.

- 데이터 모델을 살펴보자. (155p)

---

### 6.2.1 상품, 카테고리, 리뷰

- 5장에서 제품에 대한 정보를 요약하는데 어떻게 쿼리를 사용했는지 알아보자.

```javascript
let product = db.products.findOne({ slug: "wheelbarrow-9092" });
let reviews_count = db.reviews.count({ product_id: product["_id"] });
```

- 집계 프레임워크를 사용하여 수행하는 방법을 알아보자. 먼저 모든 제품의 총 리뷰수를 계산하는 쿼리를 살펴보자.

```javascript
db.reviews.aggregate([{ $group: { _id: "$product_id", count: { $sum: 1 } } }]);
```

> product_id 로 입력 도큐먼트를 그룹화한다. 각 제품에 대한 리뷰수를 카운트한다.

```javascript
{ "_id": ObjectId("12adf8ausdfjasfakldfj2"), "count" : 2 }
{ "_id": ObjectId("12adf8ausdfjasfakldfj1"), "count" : 3 }
```

- 주목할 점은 입력 도큐먼트 필드는 $ 기호가 앞에 와서 지정되는데, \_id 필드의 값을 정의할 때 $product_id 를 사용하여 입력 도큐먼트의 product_id 필드값을 사용하도록 지정했다.

- 또한, $sum 함수를 사용하여 주어진 product_id 에 대한 각 입력 도큐먼트의 count 필드에 1을 설정하여, 각 제품의 입력 도큐먼트 합을 계산한다.
$group 연산자는 평균,최소 및 최대뿐만 아니라 합계 등을 포함한 다양한 집계 결과를 계산할 수 있는 많은 함수를 지원한다.

- 이번에 계산할 하나의 제품만 선택하기 위해 파이프라인에 연산자를 하나 더 추가해 보자.

```javascript
const db = client.db(dbName);

let products = db.collection("products");

let product = products.findOne({ slug: "wheelbarrow-9092" });

let ratingSummary = db
  .collection("reviews")
  .aggregate([
    { $match: { product_id: product["_id"] } },
    { $group: { _id: "$product_id", count: { $sum: 1 } } },
  ])
  .next();
```

- 관심 있는 하나의 제품을 반환하고 이를 ratingSummary 변수에 할당한다. 집계 파이프라인의 결과는 커서(cursor)라 하며, 한 번에 한 도큐먼트씩 거의 모든 크기의 결과를 처리할 수 있는 결과에 대한 포인터이다. 단일 도큐먼트를 회수하기 위해 next() 함수를 이용하여 커서의 첫 번쨰 도큐먼트를 반환할 수 있다.

- $match 연산자로 전달된 매개변수들, {'product_id': product['_id']} 는 이제 익숙할 것이다. RDBMS 에서 WHERE 절에 product_id 로 조건이 있는거라고 생각하면 쉽다.

- $match, $group 에 순서가 매우 중요한 데, $group 뒤에 $match 를 넣으면 같은 결과를 반환하나, 이렇게 하면 MongoDB가 모든 제품에 대한 리뷰수를 계산한 다음 한 가지 결과를 제외하고 모두 삭제하게 된다. 원래대로 라면 $group 연산자가 처리해야 하는 도큐먼트의 수를 크게 줄일 수 있다.

---

**평균 리뷰 계산하기**

- 제품의 평균 리뷰를 계산하려면 앞의 예제와 동일한 파이프라인을 사용하여 하나 이상의 필드를 추가하도록 하자.

```javascript
let ratingSummary = db
  .collection("reviews")
  .aggregate([
    { $match: { product_id: product["_id"] } },
    {
      $group: {
        _id: "$product_id",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ])
  .next();
```

```javascript
{
  "_id" : ObjectId("4c4b1476238d3b4dd5003981"),
  "average" : 4.3333333333,
  "count" : 3
}
```

---

**등급별 리뷰 계산하기**

- 이번엔 제품 요약을 더 확장하고 각 등급에 대한 리뷰 횟수의 내역을 보여 주도록하자. 제퓸에 대해 5명의 리뷰 작성자가 5점, 2명이 4점, 1명이 3점으로 평가 하였다.

- 집계 프레임워크를 사용하면 단일 명령을 사용하여 이 요약을 계산할 수 있다.
  $match 를 사용하여 표시된 제품에 대한 리뷰만 선택한 다음, 다음으로, 등급별로 $match 결과를 그룹화하고 각 등급에 대한 리뷰수를 계산한다.

```javascript
let countsByRating = db
  .collection("reviews")
  .aggregate([
    { $match: { product_id: product["_id"] } }, // 제품 선택
    { $group: { _id: "$rating", count: { $sum: 1 } } }, // 각 등급별 리뷰수 계산
  ])
  .toArray(); //결과 커서를 배열로 변환
```

- RDBMS 로 쿼리를 날린다면 다음과 같다.

```sql
SELECT RATING, COUNT(*) AS COUNT
FROM REVIEWS
WHERE  PRODUCT_ID = '4c4b1476238d3b4dd5003981'
GROUP BY RATING
```

```javascript
[
  { _id: 5, count: 5 },
  { _id: 4, count: 2 },
  { _id: 3, count: 1 },
];
```

**컬렉션 조인**

- 이번엔 데이터베이스 내용을 검토하고 각각의 주요 카테고리의 제품 수를 계산한다고 가정해 보자. 하나의 제품은 오직 하나의 주 카테고리만 가진다는 것을 기억하자.

```javascript
db.products.aggregate([
  { $group: { _id: "$main_cat_id", count: { $sum: 1 } } },
]);
```

```javascript
{ "_id" : ObjectId("6a5b1476238d3b4dd5000048"), "count" : 1 }
```

- 이 결과만으로는 ObjectId("6a5b1476238d3b4dd5000048") 가 나타내는 범주를 알 수 없으므로 별로 도움이 되지 않는다. MongoDB 한계 중 하나는 컬렉션 간의 조인을 허용하지 않는다는 것이다. 이런 경우 일반적으로 데이터 모델을 비정규화(denormalizing)하여 그룹화 또는 중복을 통해 전자상거래 애플리케이션이 일반적으로 표시할 것으로 예상되는 특성을 포함하도록 하는 방법을 사용할 수 있다.

- 주문(orders) 컬렉션에서 각 항목은 제품 이름도 포함하고 있으므로 주문을 표시할 때 각 항목의 제품 이름을 읽기 위해 다른 호출을 하지 않아도 된다.

- 집계 프레임워크는 종종 미리 예상할 수 없는 임시 보고서를 생성하는 데 종종 사용된다는 것을 기억해 두자. 너무 많은 데이터를 복제하지 않도록 데이터의 비정규화 정도를 제한하여 데이터베이스에서 사용하는 공간을 늘리고 업데이트를 복잡하게 만들 수 있다. ( 여러 도큐먼트에서 동일한 정보를 업데이트해야 할 수도 있기 때문이다. )

- MongoDB 는 자동 조인을 허용하진 않지만, SQL 조인과 동등한 기능을 제공하는데 사용할 수 있는 몇 가지 옵션이 있다. 옵션 중 하나는 forEach 함수를 사용하여 집계 명령에서 반환된 커서를 처리하고 의사 조인(pseudo-join)을 사용하여 이름을 추가하는 것이다.

```javascript
db.collection("mainCategorySummary").deleteMany({});

db.collection("products")
  .aggregate([{ $group: { _id: "$main_cat_id", count: { $sum: 1 } } }])
  .forEach(function (doc) {
    var category = db.collection("categories").findOne({ _id: doc._id });
    if (category !== null) {
      doc.category_name = category.name;
    } else {
      doc.category_name = "not found";
    }
    db.collection("mainCategorySummary").insertOne(doc);
  });
```

```javascript
db.collection("mainCategorySummary").findOne();
```

---

**$out 과 $project**

- $unwind 연산자를 사용하여 조인을 수행하는 옵션이 훨씬 빠르지만, 두 개의 연산자 $out 과 $porject 를 먼저 이해해야 한다. 이전 예에서는 프로그램 코드를 사용하여 각 출력 도큐먼트를 처리하여 집계 파이프라인의 결과를 mainCategorySummary 컬렉션에 저장했다.

```javascript
db.collection("mainCategorySummary").insertOne(doc);
```

- $out 연산자를 사용하면 파이프라인의 출력을 자동적으로 컬렉션에 저장할 수 있다. $out 연산자는 컬렉션이 존재하지 않으면 컬렉션을 생성하고, 컬렉션이 존재하면 컬렉션을 완전히 대체한다. 또한, 어떤 이유로 새로운 컬렉션의 생성이 실패하면 MongoDB 는 이전 컬렉션을 변경하지 않고 남겨 둔다.

```javascript
db.collection('products').aggregate([
  {$group : { _id: '$main_cat_id', count: {$sum:1}},
  {$out : 'mainCategorySummary'}
  }
])
```

> 파이프라인의 결과를 mainCategorySummary 컬렉션에 저장

- $project 연산자를 사용하면 파이프라인의 다음 단계로 전달할 필드를 필터링할 수 있다. $match 를 사용하면 전달되는 도큐먼트 수를 제한하여 데이터가 다음 단계로 전달되는 양을 제한할 수 있지만, $project 는 다음 단계로 전달되는 각 도큐먼트의 크기를 제한하는데 사용 할 수 있다. 큰 도큐먼트를 처리하고 각 도큐먼트의 일부만 필요로 하는 경우에는 각 도큐먼트의 크기를 제한하면 성능이 향상될 수 있다.

- 출력 도큐먼트를 각 제품에 사용되는 카테고리 ID 목록으로 제한하는 $project 연산자의 예다.

```javascript
products.aggregate([{ $project: { category_ids: 1 } }]);
```

- 이제 빠른 조인을 수행하기 위해 $unwind 연산자와 함께 이 연산자를 사요하는 방법을 살펴보자.

---

**$unwind 로 더 빨라진 조인**

- 이 연산자를 사용하면 배열을 확장하여 모든 입력 도큐먼트 배열 항목에 대해 하나의 출력 도큐먼트를 생성할 수 있다. 이는 MongoDB 조인의 또 다른 유형을 제공하며, 이 조인에서는 하위 도큐먼트가 나타날 떄마다 도큐먼트를 조인할 수 있다.

- 이전엔 각 주요 카테고리에 대한 제품 수를 세었고, 이 경우 하나의 제품은 오직 하나의 주요 카테고리만 가졌었다. 이번엔 주요 카테고리인지 아닌지 여부에 관계 없이 각 카테고리의 제품 수를 계산한다고 가정해 보자.

- $unwind 연산자를 사용하면 각 제품을 배열을 각 항목과 조인시켜 각 제품 및 category_id 에 대해 하나의 도큐먼트를 생성할 수 있다. 그런 다음 category_id 를 사용하여 결과를 요약할 수 있다.

```javascript
products.aggregate([
  { $project: { category_ids: 1 } }, // 카테고리 ID 배열만 다음 단계로 전달, _id 속성은 기본적으로 전달
  { $unwind: "$category_ids" }, // category_id 의 모든 배열 항목에 대한 출력 도큐먼트를 생성한다.
  { $group: { _id: "$category_ids", count: { $sum: 1 } } },
  { $out: "countsByCategory" },
]);
```

- 집계 파이프라인의 첫 번쨰 연산자인 $project 는 파이프라인의 다음 단계로 전달되는 특성을 제한하며, $unwind 연산자가 있는 파이프라인에서 종종 중요하다. $unwind 는 배열의 각 항목에 대해 하나의 출력 도큐먼트를 생성하므로 출력되는 데이터의 양을 제한하고 싶을 수도 있따.

- 남아 있는 도큐먼트가 크고 배열에 많은 수의 항목이 포함되어 있으면 결국 파이프라인의 다음 단계로 거대한 결과가 전달할 것이다. 파이프라인의 마지막 연산자 $out 은 특정 컬렉션에 결과를 저장한다.
