// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {CodexNftCollection} from "../src/CodexNftCollection.sol";

contract CodexNftCollectionTest is Test {
    CodexNftCollection internal collection;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        collection = new CodexNftCollection("Codex Apes", "CAPE", "ipfs://metadata/");
    }

    function testOwnerCanMint() public {
        uint256 tokenId = collection.mintTo(alice);
        assertEq(tokenId, 1);
        assertEq(collection.ownerOf(1), alice);
        assertEq(collection.nextTokenId(), 2);
    }

    function testNonOwnerCannotMint() public {
        vm.prank(bob);
        vm.expectRevert();
        collection.mintTo(bob);
    }

    function testOwnerCanUpdateBaseUri() public {
        collection.setBaseURI("ipfs://new-metadata/");
        collection.mintTo(alice);
        assertEq(collection.tokenURI(1), "ipfs://new-metadata/1");
    }
}
