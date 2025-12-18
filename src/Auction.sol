// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Auction {
    string public itemName;
    string public description;
    uint public endTime;

    uint public highestBid;
    address public highestBidder;
    address public owner;

    uint public constant MIN_BID = 0.005 ether;
    bool public ended;

    mapping(address => uint) public pendingReturns;

    struct Bid {
        address bidder;
        uint amount;
        uint timestamp;
    }

    Bid[] public bidHistory;

    constructor(
        string memory _name,
        string memory _description,
        uint _durationSeconds
    ) {
        itemName = _name;
        description = _description;
        endTime = block.timestamp + _durationSeconds;
        owner = msg.sender;
    }

    function bid() external payable {
        require(block.timestamp < endTime, "Auction has ended");
        require(!ended, "Auction already ended");

       
        if (highestBid == 0) {
            require(msg.value >= MIN_BID, "Bid below minimum");
        } else {
            require(msg.value > highestBid, "Bid too low");
        }

        
        if (highestBidder != address(0)) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        bidHistory.push(Bid(msg.sender, msg.value, block.timestamp));
    }

    function withdrawPending() external {
        uint amount = pendingReturns[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingReturns[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function auctionEnd() external {
        require(block.timestamp >= endTime, "Auction not ended");
        require(msg.sender == owner, "Only owner");
        require(!ended, "Auction already ended");
        require(highestBid >= MIN_BID, "No valid bids");

        ended = true;

        (bool success, ) = payable(owner).call{value: highestBid}("");
        require(success, "Transfer failed");
    }
}
