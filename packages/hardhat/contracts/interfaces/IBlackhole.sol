pragma solidity 0.8.1;

interface IBlackhole {
    function nextMinimumBet() external view returns(uint256);
    function bet() external payable;
    function win() external;
}