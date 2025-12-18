// script/DeployAuction.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Auction.sol";

contract DeployAuction is Script {
    function run() external {
        vm.startBroadcast();
        Auction auction = new Auction(
            "ChainBid",
            "Decentralized auction",
            3600
        );
        vm.stopBroadcast();

        console2.log("Auction deployed at:", address(auction));
    }
}
