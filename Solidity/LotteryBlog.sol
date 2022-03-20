// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract LotteryBlog {

    event EnterNumberEvent(uint8 number, address from, uint value);
    event PickWinnerEvent(uint8 winNumber, address to, uint value);
    event KillContractEvent();

    struct Player {
        uint8 Number;
        bool Exist;
    }

    struct Number {
        address Address;
        bool Exist;
    }

    mapping(address => Player) private _players;
    mapping(uint8 => Number) private _numbers;
    
    address private _owner = msg.sender;
    uint8[] private _onlyNumbers;
    uint private _balance = 0;
    bool private _isActive = true;

    modifier onlyOwner {
      require(msg.sender == _owner, "Only owner");
      _;
   }

   modifier isActive {
       require(_isActive, "Lottery is closed");
       _;
   }

    function getBalance() external view onlyOwner isActive returns(uint) {
        return _balance;
    }

    function enter(uint8 number) external isActive payable {
        require(msg.value == 1 ether, "Accepted only 1 ETH");
        require(number > 0 && number < 10, "Number can be from 1 to 9");
        require(!_players[msg.sender].Exist, "Player already has a number");
        require(!_numbers[number].Exist, "Number already assigned");

        _players[msg.sender] = Player(number, true);
        _numbers[number] = Number(msg.sender, true);
        _onlyNumbers.push(number);
        _balance += msg.value;

        emit EnterNumberEvent(number, msg.sender, msg.value);
    }

    function getNumbersUsed() external view returns (uint8[] memory) {
        return _onlyNumbers;
    }

    function pickWinner(uint8 winNumber) public onlyOwner isActive {
        require(_numbers[winNumber].Exist, "winNumber do not exist in array");
        address to = payable(_numbers[winNumber].Address);
        (bool sent, ) = to.call{value: _balance}("");
        require(sent, "Failed to send Ether to the winner");
        emit PickWinnerEvent(winNumber, to, _balance);
        _balance = 0;
        _isActive = false;
    }

    function kill() external onlyOwner {
        selfdestruct(payable(_owner));
        emit KillContractEvent();
    }
}
