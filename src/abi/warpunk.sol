// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen + 32);
        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, 
                input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
                
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}

contract Warpunk is ERC721Enumerable, Ownable {
    address public guard; 
    uint256 public mintPrice;
    
    bool public mintActive;
    mapping(uint256 => string) private _tokenUrls;

    uint256 public constant MAX_SUPPLY = 2000;
    uint256 private _mintedCount;

    constructor() ERC721("Warpunk", "WRPK") Ownable(msg.sender) {
        mintPrice = 0 ether;
    }

    function startmint() external onlyOwner {
        require(!mintActive, "mint is already active");
        mintActive = true;
    }

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    function mint(uint256 inputFid, string memory url, bytes memory signature) external payable {
        require(mintActive, "mint has not started yet");
        require(bytes(url).length > 0, "URL cannot be empty");
        require(guard == address(0) || _verifySignatureWithUrl(msg.sender, inputFid, url, signature), "Invalid signature");
        
        require(!tokenMinted(inputFid), "Token already minted"); 
        require(balanceOf(msg.sender) == 0, "Address already minted");

        require(msg.value >= mintPrice, "Insufficient payment");
        require(_mintedCount < MAX_SUPPLY, "Max supply reached"); 

        _safeMint(msg.sender, inputFid);
        _tokenUrls[inputFid] = url;
        _mintedCount++; 
    }

    function totalMinted() public view returns (uint256) {
        return _mintedCount;
    }

    function tokenMinted(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function hasMinted(address user) public view returns (uint256) {
        if (balanceOf(user) == 0) {
            return 0;
        }
        return tokenOfOwnerByIndex(user, 0);
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenMinted(tokenId), "Token does not exist");
        string memory url = _tokenUrls[tokenId];
        require(bytes(url).length > 0, "URL not set for token");
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
                '{"name": "Warpunk #', 
                toString(tokenId), 
                '", "description": "The Warpunk are memetic creatures and an important part of Farcaster lore. This is a collection of unique Warplets + Base Punk + generated using Farcaster data for each user.", "image": "',
                url,
                
    '", "attributes": [{"trait_type": "Species", "value": "Warpunk"}]}'
            ))));
        return string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    json
                )
            );
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    
    function setguard(address _guard) external onlyOwner {
        guard = _guard;
    }

    function _verifySignatureWithUrl(address minter, uint256 tokenId, string memory url, bytes memory signature) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(minter, "WRPK", tokenId, url));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);

        return recoveredSigner == guard;
    }

    function updateTokenUrl(uint256 tokenId, string memory url) external onlyOwner {
        require(tokenMinted(tokenId), "Token does not exist");
        _tokenUrls[tokenId] = url;
    }

    function withdrawFunds() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    
    function withdrawERC20(address tokenAddress) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        token.transfer(msg.sender, balance);
    }
}