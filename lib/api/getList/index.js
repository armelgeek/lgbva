const mapValues = require('lodash/mapValues');
const getPagination = (page, size) => {
  const limit = size ? +size : 10000;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit,benefice=null) => {
  const { count: totalItems, rows } = data;
  let lastItem=rows.slice(-1);
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  if(benefice!=null){
    return { nextId: lastItem[0]==null ? 1 :(lastItem[0].id+1),totalItems, rows, totalPages, currentPage,benefice };
  }else{

  return { nextId:  lastItem[0]==null ? 1 :(lastItem[0].id+1), totalItems, rows, totalPages, currentPage };
  }
};


const getMany = (
  doGetFilteredList,
  doGetSearchList,
  filtersOption
) => async (req, res, next) => {
  try { 
    const { q, page, limit, offset, filter,fields, order } = parseQuery(
      req.query,
      filtersOption
    )
    if (!q) {
      const data = await doGetFilteredList({
        filter,
        limit,
        offset,
        order,
        fields,
      })
     const response = getPagingData(data,page,limit)
    // res.send_ok('retreivie data successfully!', {
    /*  response
    })*/
    res.json(response)
      /**
       * {
    "rows": [
        {
            "id": 1,
            "name": "matache tache he",
            "createdAt": "2021-09-19T01:27:25.560Z",
            "updatedAt": "2021-09-19T05:22:43.750Z"
        },
        {
            "id": 2,
            "name": "encore",
            "createdAt": "2021-09-19T05:41:46.539Z",
            "updatedAt": "2021-09-19T05:41:46.539Z"
        }
    ],
    "count": 2
}
       * 
       */
    } else {
      if (!doGetSearchList) {
        return res.send_badRequest ('Search has not been implemented yet for this resource')
      }
      const data = await doGetSearchList(q, limit, filter)
    
      const response = getPagingData(data,page,limit)
      res.json(response)
   //   res.send_ok('Planets were found successfully!', {
     //   response
     // })
      /**
       *{
    "rows": [
        {
            "id": 1,
            "name": "matache tache he",
            "createdAt": "2021-09-19T01:27:25.560Z",
            "updatedAt": "2021-09-19T05:22:43.750Z"
        }
    ],
    "count": 1
}
       * 
       */
    }
  } catch (error) {
    next(error)
  }
}

const parseQuery = (query, filtersOption) => {
  const { sort, filter, page, fields, size } = query
  const { limit, offset } = getPagination(page, size);
  const { q, ...filters } = JSON.parse(filter || '{}')
  return {
    offset: offset || null,
    limit: limit || null,
    fields:fields ||  null,
    filter: getFilter(filters, filtersOption),
    order: sort || null,
    q,
    page
  }
}

const getFilter = (
  filter,
  filtersOption
) =>
  mapValues(filter, (value, key) => {
    if (filtersOption && filtersOption[key]) {
      return filtersOption[key](value)
    }
    return value
  })
module.exports = {
  getMany,getPagingData,
  parseQuery
}