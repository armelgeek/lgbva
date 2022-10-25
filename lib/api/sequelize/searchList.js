const { uniqBy, flatten } = require('lodash')
const { Op } = require('sequelize');
const CustomError = require('../../CustomError');

const crudifySearchFields = (
  model,
  relations,
  searchableFields = [],
  comparator = Op.like
) => async (q, limit, scope = {}) => {
  const resultChunks = await Promise.all(
    prepareQueries(searchableFields)(q, comparator).map(query =>
      model.findAll({
        limit,
        where: { ...query, ...scope },
        raw: true,
        include: relations,
      })
    )
  )

  const rows = uniqBy(flatten(resultChunks).slice(0, limit), 'id')

  return { rows, count: rows.length }
}

const prepareQueries = (searchableFields = []) => (
  q,
  comparator = Op.like
) => {
  if (!searchableFields) {
    throw new Error("Vous devez fournir l'option searchableFields pour utiliser le filtre 'q'");
  }
  const defaultQuery = {
    [Op.or]: searchableFields.map(field => ({
      [field]: {
        [comparator]: `${q.split(/\s+/)}%`,
      },
    })),
  }

  const tokens = q.split(/\s+/).filter(token => token !== '')
  if (tokens.length < 2) return [defaultQuery]
  return [
    defaultQuery,
    {
      [Op.and]: tokens.map(token => ({
        [Op.or]: searchableFields.map(field => ({
          [field]: {
            [comparator]: `${token}%`,
          },
        })),
      })),
    },
  {
      [Op.or]: tokens.map(token => ({
        [Op.or]: searchableFields.map(field => ({
          [field]: {
            [comparator]: `${token}%`,
          },
        })),
      })),
    },
  ]
}
module.exports = {
  crudifySearchFields,
  prepareQueries
};