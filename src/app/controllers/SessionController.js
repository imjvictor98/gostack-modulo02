/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body; //desestruturação do email e senha pelo body da requisicao

    const user = await User.findOne({ where: { email } }); //procura um usuario aonde o email é o email da requisicao

    if (!user) {
      //se ele nao for encontrado
      return res.status(401).json({ error: 'User not found' }); //retorna um json com erro
    }

    if (!(await user.checkPassword(password))) {
      //verifica se a senha informada pelo body é diferente que está no banco de dados
      return res.status(401).json({ error: 'Password does not match' }); //retorna um json com um erro
    }

    const { id, name } = user; //faz a desestruturação de id e nome pelo usuario que foi encontrado

    return res.json({
      //retorna um json com as propriedades id, email e nome
      user: {
        id,
        name,
        email,
      }, // e o token
      token: jwt.sign({ id }, authConfig.secret, {
        //onde é feita a assinatura com o id do usuario dentro do payload
        expiresIn: authConfig.expiresIn, //passando o secredo e o tempo de expiração
      }),
    });
  }
}

export default new SessionController();
