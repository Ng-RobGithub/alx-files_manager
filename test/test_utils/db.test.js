/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db.js';

describe('+ DBClient utility', () => {
  before(async function () {
    this.timeout(10000);
    try {
      const [usersCollection, filesCollection] = await Promise.all([
        dbClient.usersCollection(),
        dbClient.filesCollection(),
      ]);
      await Promise.all([
        usersCollection.deleteMany({}),
        filesCollection.deleteMany({}),
      ]);
    } catch (error) {
      throw new Error(`Setup error: ${error.message}`);
    }
  });

  it('+ Client is alive', () => {
    expect(dbClient.isAlive()).to.equal(true);
  });

  it('+ nbUsers returns the correct value', async () => {
    expect(await dbClient.nbUsers()).to.equal(0);
  });

  it('+ nbFiles returns the correct value', async () => {
    expect(await dbClient.nbFiles()).to.equal(0);
  });
});
