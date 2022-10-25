# express-sequelize-crud

```ts
import crud, { sequelizeCrud } from 'express-sequelize-crud'

app.use(crud('/admin/users', sequelizeCrud(User)))
```

Expose resource CRUD (Create Read Update Delete) routes for Express & Sequelize (and other ORMs in v6+). Compatible with [React Admin Simple Rest Data Provider](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest)

### Note: `Content-Range` header

For `getList` methods, the response includes the total number of items in the collection in `X-Total-Count` header. You should use this response header for pagination and avoid using `Content-Range` header if your request does not include a `Range` header. Checkout [this](https://stackoverflow.com/questions/53259737/content-range-working-in-safari-but-not-in-chrome) stackoverflow thread for more info.

 If you are using `ra-data-simple-rest`, please refer to the [documentation](https://github.com/Serind/ra-data-simple-rest#note-about-content-range) to use `X-Total-Count` for pagination.

[![codecov](https://codecov.io/gh/lalalilo/express-sequelize-crud/branch/master/graph/badge.svg)](https://codecov.io/gh/lalalilo/express-sequelize-crud) [![CircleCI](https://circleci.com/gh/lalalilo/express-sequelize-crud.svg?style=svg)](https://circleci.com/gh/lalalilo/express-sequelize-crud)

## Install

```
yarn add express-sequelize-crud
```

## Usage

### Simple use case

```ts
import express from 'express'
import crud, { sequelizeCrud } from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(crud('/admin/users', sequelizeCrud(User)))
```

### Limit actions

```ts
import express from 'express'
import crud, { sequelizeCrud } from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', {
    ...sequelizeCrud(User),
    : null,
  })
)
```
destroy
### Custom filters

Custom filters such as case insensitive filter can be perform like this:

```ts
import express from 'express'
import { Op } from 'sequelize'
import crud, { sequelizeCrud } from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', sequelizeCrud(User), {
    filters: {
      email: value => ({
        [Op.iLike]: value,
      }),
    },
  })
)
```

### Custom behavior & other ORMs

```ts
import express from 'express'
import crud from 'express-sequelize-crud'
import { User } from './models'

const app = new express()
app.use(
  crud('/admin/users', {
    getList: ({ filter, limit, offset, order }) =>
      User.findAndCountAll({ limit, offset, order, where: filter }),
    getOne: id => User.findByPk(id),
    create: body => User.create(body),
    update: (id, body) => User.update(body, { where: { id } }),
    destroy: id => User.destroy({ where: { id } }),
  })
)

app.use(
  crud('/admin/users', {
    search: async (q, limit) => {
      const { rows, count } = await User.findAndCountAll({
        limit,
        where: {
          [Op.or]: [
            { address: { [Op.like]: `${q}%` } },
            { zipCode: { [Op.iLike]: `${q}%` } },
            { city: { [Op.iLike]: `${q}%` } },
          ],
        },
      })

      return { rows, count }
    },
  })
)
```

```ts
import crud, {
  sequelizeCrud,
  crudifySearchFields,
} from 'express-sequelize-crud'

crud('/admin/users', {
  ...sequelizeCrud(User),
  search: crudifySearchFields(User, ['address', 'zipCode', 'city']),
})
```

```ts
import { Op } from 'sequelize'

const search = crudifySearchFields(
  User,
  ['address', 'zipCode', 'city'],
  Op.like
)
////
/////
//////
////////
const { 
    default: crud, 
    crudify,
    crudifySearchFields
} = require("../lib/api");
const db = require("../models");
const story = crud('/stories',
{
    ...crudify(db.story,
        ["tasks"] // children alias
        ),
    restrict: [],
    search: crudifySearchFields(db.story,
        ['tasks'], // children alias
        ['name']  // field for search
    )
})
module.exports = {
    story
};
////
///
///
http://localhost:8100/api/tasks?sort=["id","DESC"]
http://localhost:8100/api/tasks?filter={"q":"abcd"}
http://localhost:8100/api/tasks?filter={"id":1,"name":"matache tache he"}

http://localhost:8100/api/tasks?page=0&size=1 &sort=["id","DESC"]&filter={"q":"a"}
http://localhost:8100/api/tasks?page=0&size=1
