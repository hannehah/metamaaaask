// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Auction.sol";

contract DeployAuction is Script {
    function run() external {
        vm.startBroadcast();

        new Auction(
            "Rare Artwork",
            "Description of the auction item",
            86400
        );

        vm.stopBroadcast();
    }
}
