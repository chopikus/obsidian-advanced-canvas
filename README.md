This fork adds a screen sharing feature for a reMarkable tablet. Specifically, it embeds a page from [goMarkableStream](https://github.com/owulveryck/goMarkableStream) by injecting an iframe into the group node.

## Installation
1. Set up [goMarkableStream](https://github.com/owulveryck/goMarkableStream) on your reMarkable tablet. Make sure you run goMarkableStream with environment variable `RK_HTTPS=false` and with `-unsafe` argument. Example: `RK_HTTPS=false ./goMarkableStream -unsafe`.
2. Add this plugin via [BRAT](https://github.com/TfTHacker/obsidian42-brat) or directly.
3. Enable ReMarkable Screen Sharing option in Advanced Canvas settings.

## Usage
So far there are 3 ways to insert a ReMarkable screen available:
* _Insert ReMarkable screen (Portrait)_ command.
* _Insert ReMarkable screen (Landscape)_ command.
* _Insert rM screen (Landscape)_ button in the card layout.

## Limitations
The plugin doesn't work yet with https and authentication.
