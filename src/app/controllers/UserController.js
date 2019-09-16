/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });
    
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { 
      id, name, email, provider 
    } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider
    });
  }

  async update(req, res) {
    return res.json({ ok: true });
  }
}

export default new UserController();