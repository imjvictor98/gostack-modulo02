/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      // procura os fornecedores
      where: { provider: true }, // aonde o provider é verdadeiro
      attributes: ['id', 'name', 'email', 'avatar_id'], // mostrando os atributos id, nome, email e foto
      include: [
        // incluido
        {
          model: File, // o model do File
          as: 'avatar', // como um avatar
          attributes: ['name', 'path', 'url'], // mostrando os atributos name, path e url
        },
      ],
    });
    return res.json(providers); // retorna os fornecedores encontrados
  }
}

export default new ProviderController();
