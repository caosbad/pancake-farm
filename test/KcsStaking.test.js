const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const KccsToken = artifacts.require('KccsToken');
const KcsStaking = artifacts.require('KcsStaking');
const MockKIP20 = artifacts.require('libs/MockKIP20');
const WKCS = artifacts.require('libs/WKCS');

contract('KcsStaking.......', async ([alice, bob, admin, dev, minter]) => {
  beforeEach(async () => {
    this.rewardToken = await KccsToken.new({ from: minter });
    this.lpToken = await MockKIP20.new('LPToken', 'LP1', '1000000', {
      from: minter,
    });
    this.wKCS = await WKCS.new({ from: minter });
    this.kcsChef = await KcsStaking.new(
      this.wKCS.address,
      this.rewardToken.address,
      1000,
      10,
      1010,
      admin,
      this.wKCS.address,
      { from: minter }
    );
    await this.rewardToken.mint(this.kcsChef.address, 100000, { from: minter });
  });

  it('deposit/withdraw', async () => {
    await time.advanceBlockTo('10');
    await this.kcsChef.deposit({ from: alice, value: 100 });
    await this.kcsChef.deposit({ from: bob, value: 200 });
    assert.equal(
      (await this.wKCS.balanceOf(this.kcsChef.address)).toString(),
      '300'
    );
    assert.equal((await this.kcsChef.pendingReward(alice)).toString(), '1000');
    await this.kcsChef.deposit({ from: alice, value: 300 });
    assert.equal((await this.kcsChef.pendingReward(alice)).toString(), '0');
    assert.equal((await this.rewardToken.balanceOf(alice)).toString(), '1333');
    await this.kcsChef.withdraw('100', { from: alice });
    assert.equal(
      (await this.wKCS.balanceOf(this.kcsChef.address)).toString(),
      '500'
    );
    await this.kcsChef.emergencyRewardWithdraw(1000, { from: minter });
    assert.equal((await this.kcsChef.pendingReward(bob)).toString(), '1399');
  });

  it('should block man who in blanklist', async () => {
    await this.kcsChef.setBlackList(alice, { from: admin });
    await expectRevert(
      this.kcsChef.deposit({ from: alice, value: 100 }),
      'in black list'
    );
    await this.kcsChef.removeBlackList(alice, { from: admin });
    await this.kcsChef.deposit({ from: alice, value: 100 });
    await this.kcsChef.setAdmin(dev, { from: minter });
    await expectRevert(
      this.kcsChef.setBlackList(alice, { from: admin }),
      'admin: wut?'
    );
  });

  it('emergencyWithdraw', async () => {
    await this.kcsChef.deposit({ from: alice, value: 100 });
    await this.kcsChef.deposit({ from: bob, value: 200 });
    assert.equal(
      (await this.wKCS.balanceOf(this.kcsChef.address)).toString(),
      '300'
    );
    await this.kcsChef.emergencyWithdraw({ from: alice });
    assert.equal(
      (await this.wKCS.balanceOf(this.kcsChef.address)).toString(),
      '200'
    );
    assert.equal((await this.wKCS.balanceOf(alice)).toString(), '100');
  });

  it('emergencyRewardWithdraw', async () => {
    await expectRevert(
      this.kcsChef.emergencyRewardWithdraw(100, { from: alice }),
      'caller is not the owner'
    );
    await this.kcsChef.emergencyRewardWithdraw(1000, { from: minter });
    assert.equal((await this.rewardToken.balanceOf(minter)).toString(), '1000');
  });

  it('setLimitAmount', async () => {
    // set limit to 1e-12 KCS
    await this.kcsChef.setLimitAmount('1000000', { from: minter });
    await expectRevert(
      this.kcsChef.deposit({ from: alice, value: 100000000 }),
      'exceed the to'
    );
  });
});
