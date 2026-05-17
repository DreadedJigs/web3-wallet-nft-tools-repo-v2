// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract CodexNftCollection is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    string private _baseTokenUri;

    event BaseUriUpdated(string newBaseUri);

    constructor(string memory name_, string memory symbol_, string memory baseTokenUri_) ERC721(name_, symbol_) Ownable(msg.sender) {
        _baseTokenUri = baseTokenUri_;
    }

    function mintTo(address recipient) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        _nextTokenId += 1;
        _safeMint(recipient, tokenId);
    }

    function setBaseURI(string calldata newBaseUri) external onlyOwner {
        _baseTokenUri = newBaseUri;
        emit BaseUriUpdated(newBaseUri);
    }

    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenUri;
    }
}
