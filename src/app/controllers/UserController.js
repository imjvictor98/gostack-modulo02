import * as yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });
    //busca um usuario no banco onde o email é igual o email passaado no body da requisicao

    if (userExists) {
      //se o usuario ja existe
      return res.status(400).json({ error: 'User already exists' }); //retorna um json com erro
    }

    const { id, name, email, provider } = await User.create(req.body);
    //desestrutura id, nome, email e fornecedor do Usuario que foi criado e
    //passa todo os dados para serem gravados nesse novo usuario

    return res.json({
      //retorna um json com as propriedades id, nome, email e fornecedor
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = yup.object().shape({
      //cria um schema para validar as respostas do usuario
      name: yup.string(), //nome é uma string
      email: yup.string().email(), //email é uma string
      oldPassword: yup.string().min(6), //oldPasswotrd é uma string e no minimo 6 caracteres
      password: yup //passwotrd é uma string e no minimo 6 caracteres
        .string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      //se o oldPassword foi informado, entao ira fazer um callback
      //aonde se oldPassword for informado ele é obrigatorio, senao não é obrigatorio
      confirmPassword: yup
        .string()
        .when('password', (password, field) =>
          password ? field.required().oneOf([yup.ref('password')]) : field
        ),
    });

    if (!(await schema.isValid(req.body))) {
      //se o schema informado for invalido
      return res.status(400).json({ error: 'Malformed field' }); //retorna um json com erro
    }

    const { email, oldPassword } = req.body; //desestrutura email e a senha antiga pelo body da requisicao

    const user = await User.findByPk(req.userId); //procura um usuario pela PK passando o id que esta no token

    if (email !== user.email) {
      //se o email informado pelo body da requisicao for diferente do que esta no banco de dados
      const userExists = await User.findOne({
        // busca o usuario com o email do formulario
        where: { email }, //verifica se o email é igual o do formulario
      });

      if (userExists) {
        //se esse usuario existir
        return res
          .status(400)
          .json({ error: 'User still the same, change something :)' }); //retorna um json com erro
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      //se o oldPassword for informado e nao for igual a senha que está no banco de dados
      return res.status(401).json({ error: 'Password does not match' }); //retorna um json com erro
    }

    const { id, name } = await user.update(req.body); //desestruturacao pelo id e nome, e ja atualiza o usuario com o que foi passado no body da requisicao

    return res.json({ id, name, email }); //retorna um json com id, nome e email
  }
}

export default new UserController();
