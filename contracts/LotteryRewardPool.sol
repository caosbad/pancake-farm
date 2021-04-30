pragma solidity 0.6.12;

import 'kcc-swap-lib/contracts/token/KIP20/IKIP20.sol';
import 'kcc-swap-lib/contracts/token/KIP20/SafeKIP20.sol';
import 'kcc-swap-lib/contracts/access/Ownable.sol';

import './MasterChef.sol';

contract LotteryRewardPool is Ownable {
    using SafeKIP20 for IKIP20;

    MasterChef public chef;
    address public adminAddress;
    address public receiver;
    IKIP20 public lptoken;
    IKIP20 public kccs;

    constructor(
        MasterChef _chef,
        IKIP20 _kccs,
        address _admin,
        address _receiver
    ) public {
        chef = _chef;
        kccs = _kccs;
        adminAddress = _admin;
        receiver = _receiver;
    }

    event StartFarming(address indexed user, uint256 indexed pid);
    event Harvest(address indexed user, uint256 indexed pid);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == adminAddress, "admin: wut?");
        _;
    }

    function startFarming(uint256 _pid, IKIP20 _lptoken, uint256 _amount) external onlyAdmin {
        _lptoken.safeApprove(address(chef), _amount);
        chef.deposit(_pid, _amount);
        emit StartFarming(msg.sender, _pid);
    }

    function  harvest(uint256 _pid) external onlyAdmin {
        chef.deposit(_pid, 0);
        uint256 balance = kccs.balanceOf(address(this));
        kccs.safeTransfer(receiver, balance);
        emit Harvest(msg.sender, _pid);
    }

    function setReceiver(address _receiver) external onlyAdmin {
        receiver = _receiver;
    }

    function  pendingReward(uint256 _pid) external view returns (uint256) {
        return chef.pendingKccs(_pid, address(this));
    }

    // EMERGENCY ONLY.
    function emergencyWithdraw(IKIP20 _token, uint256 _amount) external onlyOwner {
        kccs.safeTransfer(address(msg.sender), _amount);
        emit EmergencyWithdraw(msg.sender, _amount);
    }

    function setAdmin(address _admin) external onlyOwner {
        adminAddress = _admin;
    }

}
