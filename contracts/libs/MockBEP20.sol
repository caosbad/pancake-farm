pragma solidity 0.6.12;

import "kcc-swap-lib/contracts/token/KIP20/KIP20.sol";

contract MockKIP20 is KIP20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 supply
    ) public KIP20(name, symbol) {
        _mint(msg.sender, supply);

    }
}