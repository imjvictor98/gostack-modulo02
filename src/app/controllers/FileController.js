import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file; //desestruturacao a partir da variavel file que esta na requisicao da nossa rota

    const file = await File.create({
      //cria um arquivo
      name, // com o nome informado
      path, // e com o path informado
    });
    return res.json(file); //retorna os dados desse arquivo
  }
}

export default new FileController();
