const { advanceBlockTo } = require('@openzeppelin/test-helpers/src/time');
const { assert } = require('chai');
const KccsToken = artifacts.require('KccsToken');
const SodaBar = artifacts.require('SodaBar');

contract('SodaBar', ([alice, bob, carol, dev, minter]) => {
  beforeEach(async () => {
    this.kccs = await KccsToken.new({ from: minter });
    this.soda = await SodaBar.new(this.kccs.address, { from: minter });
  });

  it('mint', async () => {
    await this.soda.mint(alice, 1000, { from: minter });
    assert.equal((await this.soda.balanceOf(alice)).toString(), '1000');
  });

  it('burn', async () => {
    await advanceBlockTo('650');
    await this.soda.mint(alice, 1000, { from: minter });
    await this.soda.mint(bob, 1000, { from: minter });
    assert.equal((await this.soda.totalSupply()).toString(), '2000');
    await this.soda.burn(alice, 200, { from: minter });

    assert.equal((await this.soda.balanceOf(alice)).toString(), '800');
    assert.equal((await this.soda.totalSupply()).toString(), '1800');
  });

  it('safeKccsTransfer', async () => {
    assert.equal(
      (await this.kccs.balanceOf(this.soda.address)).toString(),
      '0'
    );
    await this.kccs.mint(this.soda.address, 1000, { from: minter });
    await this.soda.safeKccsTransfer(bob, 200, { from: minter });
    assert.equal((await this.kccs.balanceOf(bob)).toString(), '200');
    assert.equal(
      (await this.kccs.balanceOf(this.soda.address)).toString(),
      '800'
    );
    await this.soda.safeKccsTransfer(bob, 2000, { from: minter });
    assert.equal((await this.kccs.balanceOf(bob)).toString(), '1000');
  });
});
