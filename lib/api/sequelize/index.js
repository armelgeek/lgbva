const CustomError = require("../../CustomError");
const crudify = ( model,relations,validations)=> {
  return {
    create: async body => model.create(body),
    update: async (id, body) => {
      const record = await model.findByPk(id)
      if (!record) {
        throw new Error('Enregistrement non trouvé.');
      }
      return record.update(body)
    },
    getOne: async id => model.findByPk(id,{ include: relations }),
    getList: async ({ filter, limit, offset,fields, order }) => {
     return model.findAndCountAll({
        order:[(order!=null) ? order.split(':') :['id','ASC']],
        attributes:(fields!=="*" && fields!=null) ? fields.split(','):null,
        where: filter,
        limit:(!isNaN(limit)) ? limit : null,
        offset:(!isNaN(offset)) ? offset : null,
        include: relations,
      })
    },
    destroy: async id => {
      const record = await model.findByPk(id)
      if (!record) {
        throw new Error('Enregistrement non trouvé.');
      }
      await record.destroy()
      return { id }
    },
  }
}
module.exports = {
    crudify
};