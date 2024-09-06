// controllers/UsersController.js
import dbClient from '../utils/db.js';

class UsersController {
  static async getUsers(req, res) {
    const users = await dbClient.collection('users').find().toArray();
    return res.status(200).json(users);
  }

  static async getUser(req, res) {
    const userId = req.params.id;
    const user = await dbClient.collection('users').findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  }

  static async createUser(req, res) {
    const { name, email, password } = req.body;
    const newUser = { name, email, password };
    await dbClient.collection('users').insertOne(newUser);
    return res.status(201).json(newUser);
  }

  static async updateUser(req, res) {
    const userId = req.params.id;
    const updates = req.body;
    await dbClient.collection('users').updateOne({ _id: userId }, { $set: updates });
    return res.status(200).json({ message: 'User updated successfully' });
  }

  static async deleteUser(req, res) {
    const userId = req.params.id;
    await dbClient.collection('users').deleteOne({ _id: userId });
    return res.status(204).send();
  }
}

export default UsersController;
