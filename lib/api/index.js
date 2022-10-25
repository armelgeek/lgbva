const express = require('express');

const bodyParser = require('body-parser');
const { getMany } = require('./getList');
const { getOne } = require('./getOne')
const { create } = require('./create')
const { update } = require('./update')
const { destroy } = require('./delete')
const { isAuth } = require('../user/controllers/auth');
const { crudifySearchFields } = require('./sequelize/searchList');
const { crudify } = require('./sequelize');

const crud = (
  path,
  actions,
  options
) => {
  const router = express.Router();
  router.use(bodyParser.json())
  if (actions.getList) {

    router.get(
      path,
      getMany(
        actions.getList,
        actions.search || undefined,
        actions.restrict || [],
        actions.relations || {},
        options && options.filters
      )
    );
  }
  if (actions.getOne) {
    if (actions?.restrict.includes('get')) {
      router.get(`${path}/:id`, isAuth, getOne(actions.getOne,actions?.relations))
    } else {
      router.get(`${path}/:id`, getOne(actions.getOne,actions?.relations))
    }
  }

  if (actions.create) {
    if (actions?.restrict.includes('post')) {
      router.post(path, isAuth, create(actions.create))
    } else {
      router.post(path,[], create(actions.create))
    }
  }

  if (actions.update) {
    if (!actions.getOne) {
      throw new Error('You cannot define update without defining getOne')
    }
    if (actions?.restrict.includes('put')) {
      router.put(`${path}/:id`, isAuth, update(actions.update, actions.getOne))
    } else {
      router.put(`${path}/:id`, update(actions.update, actions.getOne))
    }
  }

  if (actions.destroy) {
    if (actions?.restrict.includes('delete')) {
      router.delete(`${path}/:id`, isAuth, destroy(actions.destroy))
    } else {
      router.delete(`${path}/:id`, destroy(actions.destroy))
    }
  }

  return router
}

module.exports = {
  default: crud, 
  crudifySearchFields,
  crudify,
  getOne,
  getMany,
  create,
  update,
  destroy 
};