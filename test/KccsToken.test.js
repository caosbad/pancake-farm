const { assert } = require("chai");

const KccsToken = artifacts.require('KccsToken');

contract('KccsToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.cake = await KccsToken.new({ from: minter });
    });


    it('mint', async () => {
        await this.cake.mint(alice, 1000, { from: minter });
        assert.equal((await this.cake.balanceOf(alice)).toString(), '1000');
    })
});
