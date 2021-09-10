// License Someting
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Token.sol";

contract Exchange {
    using SafeMath for uint;

    // Variables //
    address public   feeAccount; // account that recieves the exchange fees
    uint256 public   feePercent; // the fee percentage
    address constant Ether = address(0); // store Ether in tokens mapping with blank address
    mapping(address => mapping(address => uint256)) public tokens;

    // Events //
    event Deposit (address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount; // _ is for a local variable to avoid naming conflicts
        feePercent = _feePercent;

    }
    function() external {
        revert();
    }
    function depositToken(address _token, uint256 _amount) public {
        // Which token and how much ?
        // track balance - manage deposit
        // send tokens to the contract
        // emit an event
        require(_token != Ether);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        // require will lock the rest of the function if the attached statement fails
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        // when tokens come in, add the amount the the current balance and create a new balance
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
        
    }
    function depositEther() payable public {
        // need the payable modifier to use msg.value 
        tokens[Ether][msg.sender] = tokens[Ether][msg.sender].add(msg.value);
        emit Deposit(Ether, msg.sender, msg.value, tokens[Ether][msg.sender]);
    }
    function withdrawEther(uint256 _amount) public {
        require(tokens[Ether][msg.sender] >= _amount); // only allow a user to submit as many tokens as they have on the exchage
        tokens[Ether][msg.sender] = tokens[Ether][msg.sender].sub(_amount);
        msg.sender.transfer(_amount); // sends ether back to original owner
        emit Withdraw(Ether, msg.sender, _amount, tokens[Ether][msg.sender]);
    }
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != Ether);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
    function balanceOf(address _token, address _user) public view returns (uint256) {
       return tokens[_token][_user];
    }
}
// Deposite and Withdraw
// Manage Orders - Make or Cancel
// Handle Trades - Charge Fees