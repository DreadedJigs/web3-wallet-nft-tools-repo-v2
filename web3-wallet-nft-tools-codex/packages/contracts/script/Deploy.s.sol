// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {CodexNftCollection} from "../src/CodexNftCollection.sol";

contract Deploy is Script {
    function run() external returns (CodexNftCollection collection) {
        vm.startBroadcast();
        collection = new CodexNftCollection("Codex Apes", "CAPE", "ipfs://REPLACE_WITH_METADATA_CID/");
        vm.stopBroadcast();
    }
}
